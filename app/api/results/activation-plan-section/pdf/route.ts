import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkReportAccess, getUserEmailFromRequest } from "@/lib/reportAccess";
import { ActivationPlanSectionDocument } from "@/src/pdf/documents/ActivationPlanSectionDocument";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import { extractActivationPlanBodyFromSectionText } from "@/lib/activation/extractActivationPlanFromWorkbook";
import { snapshotReportToActivationWorkspace } from "@/lib/activation/snapshotReportToActivationWorkspace";
import { ACTIVATION_PLAN_SECTION_IDS, filterActivationPlanSections, type ActivationPlanSectionId } from "@/components/results/tabConfig";
import type { WorkbookVersion } from "@/lib/workbookTypes";

export const runtime = "nodejs";
export const maxDuration = 60;

function isActivationPlanSectionId(id: string): id is ActivationPlanSectionId {
  return (ACTIVATION_PLAN_SECTION_IDS as readonly string[]).includes(id);
}

export async function GET(req: NextRequest) {
  const guard = apiGuard(req, {
    routeId: "activation-plan-section-pdf",
    rateLimit: GENERAL_RATE_LIMIT,
  });
  if (!guard.passed) return guard.errorResponse;

  const reportId = req.nextUrl.searchParams.get("reportId") || "";
  const planIdRaw = req.nextUrl.searchParams.get("planId") || "";
  const planId = planIdRaw;
  const versionId = req.nextUrl.searchParams.get("versionId");
  const emailParam = req.nextUrl.searchParams.get("email");

  if (!reportId || !planId || !isActivationPlanSectionId(planId)) {
    return NextResponse.json({ error: "Missing or invalid reportId/planId" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin client not configured" }, { status: 500 });
  }

  // Load snapshot report to build activation workspace (mirrors standalone activation page).
  const { data: report, error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select(
      "report_id, company_name, product_tier, brand_alignment_score, pillar_scores, pillar_insights, recommendations, summary, opportunities_summary, upgrade_cta, full_report, user_name, user_email, email_verified, created_at",
    )
    .eq("report_id", reportId)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const userEmail = getUserEmailFromRequest(req);
  const access = checkReportAccess(userEmail, (report as any).user_email);
  if (!access.hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  if ((report as any).email_verified === false) {
    return NextResponse.json({ error: "Email verification required before downloading your report." }, { status: 403 });
  }

  const workspace = snapshotReportToActivationWorkspace(report, reportId);
  if (!workspace) return NextResponse.json({ error: "Unable to build activation workspace" }, { status: 500 });

  const { diagnosticData, scheduleRows, productTier } = workspace;
  const allSections = buildActivationPlanSectionsList(diagnosticData, scheduleRows.length);
  const tierSections = filterActivationPlanSections(productTier, allSections);
  const section = tierSections.find((s) => s.id === planId);

  if (!section) {
    return NextResponse.json({ error: "Plan not included in your tier" }, { status: 403 });
  }

  let sectionBody = section.body;
  let bodySource: "workbook" | "report" = "report";
  let resolvedVersionLabel: string | undefined;

  const emailForWorkbook = (emailParam || "").trim().toLowerCase() || null;
  if (emailForWorkbook) {
    const { data: workbook } = await supabaseAdmin
      .from("brand_workbook")
      .select("email, custom_sections")
      .eq("report_id", reportId)
      .maybeSingle();

    if (workbook && typeof (workbook as { email?: string }).email === "string") {
      const wbEmail = ((workbook as { email: string }).email || "").toLowerCase();
      if (wbEmail && wbEmail !== emailForWorkbook) {
        return NextResponse.json({ error: "Workbook email does not match" }, { status: 403 });
      }
    }

    const custom = (workbook as { custom_sections?: Record<string, unknown> } | null)?.custom_sections;
    const tabSections =
      custom &&
      typeof custom.workbook_tab_sections === "object" &&
      custom.workbook_tab_sections !== null
        ? (custom.workbook_tab_sections as Record<string, string>)
        : {};
    const versions = Array.isArray(custom?.workbook_tab_versions)
      ? (custom.workbook_tab_versions as WorkbookVersion[])
      : [];

    let rawSectionText = "";
    if (versionId) {
      const v = versions.find((item) => item.versionId === versionId);
      if (!v) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
      }
      resolvedVersionLabel = typeof v.label === "string" && v.label.trim() ? v.label.trim() : undefined;
      rawSectionText = v.sectionSnapshots?.[section.workbookSectionId] ?? "";
    } else if (typeof tabSections[section.workbookSectionId] === "string") {
      rawSectionText = tabSections[section.workbookSectionId] ?? "";
    }

    const extracted =
      rawSectionText.trim().length > 0
        ? extractActivationPlanBodyFromSectionText(rawSectionText, section.label)
        : null;
    if (extracted && extracted.trim().length > 0) {
      sectionBody = extracted;
      bodySource = "workbook";
    }
  }

  const { renderToBuffer } = await import("@react-pdf/renderer");
  const doc = React.createElement(ActivationPlanSectionDocument, {
    productTier,
    brandName: typeof (diagnosticData.companyName) === "string" ? diagnosticData.companyName : "Your Brand",
    sectionLabel: section.label,
    sectionBody,
    bodySource,
    versionNote:
      versionId && bodySource === "workbook"
        ? resolvedVersionLabel
          ? `Saved version: ${resolvedVersionLabel}`
          : `Saved version (${versionId.slice(0, 8)}…)`
        : undefined,
  });

  const pdfBuffer = await renderToBuffer(doc as any);

  const companyName = (typeof (diagnosticData.companyName) === "string" && diagnosticData.companyName.trim()) || "YourBrand";
  const safeCompany = companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const filename = `${safeCompany}_${section.id}_activation-plan.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
      "Cache-Control": "no-store",
    },
  });
}

