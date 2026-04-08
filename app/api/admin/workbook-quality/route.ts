import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminSession";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { evaluateSectionsQuality } from "@/lib/personalizationQuality";

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function getReportSections(workbook: Record<string, any>): Record<string, unknown> {
  const customSections = workbook.custom_sections;
  if (!customSections || typeof customSections !== "object") return {};
  const reportSections = (customSections as Record<string, unknown>).report_sections;
  if (!reportSections || typeof reportSections !== "object") return {};
  return reportSections as Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const includeSections = url.searchParams.get("includeSections") === "1";

  if (!reportId) {
    return NextResponse.json({ error: "reportId is required." }, { status: 400 });
  }

  const { data: workbook, error } = await supabaseAdmin
    .from("brand_workbook")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (error || !workbook) {
    return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
  }

  const reportSections = getReportSections(workbook);
  const context = {
    businessName: asText(workbook.business_name),
    audience: asText(
      workbook.primary_audience?.description ||
        (typeof workbook.primary_audience === "string" ? workbook.primary_audience : "") ||
        workbook.secondary_audience?.description
    ),
    differentiator: asText(
      workbook.competitive_differentiation ||
        workbook.unique_value_proposition ||
        workbook.positioning_statement
    ),
    primaryPillar: asText(workbook.primary_pillar) || "messaging",
  };
  const computedQuality = evaluateSectionsQuality(reportSections, context);
  const storedQuality =
    workbook.custom_sections &&
    typeof workbook.custom_sections === "object" &&
    (workbook.custom_sections as Record<string, unknown>).personalization_quality &&
    typeof (workbook.custom_sections as Record<string, unknown>).personalization_quality === "object"
      ? (workbook.custom_sections as Record<string, unknown>).personalization_quality
      : null;

  return NextResponse.json({
    reportId: workbook.report_id,
    businessName: workbook.business_name || "",
    productTier: workbook.product_tier || "",
    updatedAt: workbook.updated_at || null,
    lastExportedAt: workbook.last_exported_at || null,
    storedQuality,
    computedQuality,
    ...(includeSections ? { reportSections } : {}),
  });
}
