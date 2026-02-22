// GET  /api/workbook?reportId=xxx  — Fetch workbook (auto-creates from report if missing)
// PATCH /api/workbook               — Save edits to a workbook section

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { getWorkbookEditability, shouldAutoFinalize } from "@/lib/workbookAccess";

export const runtime = "nodejs";

// ─── GET: Fetch or auto-create workbook ───
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const email = url.searchParams.get("email");

  if (!reportId || !email) {
    return NextResponse.json({ error: "reportId and email are required." }, { status: 400 });
  }

  // Check if workbook already exists
  const { data: existing } = await supabaseAdmin
    .from("brand_workbook")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (existing) {
    // Lazy auto-finalize for Blueprint tier if review window expired
    if (shouldAutoFinalize({
      productTier: existing.product_tier,
      createdAt: existing.created_at,
      finalizedAt: existing.finalized_at,
    })) {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from("brand_workbook")
        .update({ finalized_at: now, updated_at: now })
        .eq("report_id", reportId);
      existing.finalized_at = now;
    }

    const editability = getWorkbookEditability({
      productTier: existing.product_tier,
      createdAt: existing.created_at,
      finalizedAt: existing.finalized_at,
    });

    return NextResponse.json({ workbook: existing, editability });
  }

  // Auto-create from the diagnostic report
  try {
    const { data: report } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("*")
      .eq("report_id", reportId)
      .eq("email_verified", true)
      .single() as { data: any };

    if (!report) {
      return NextResponse.json({ error: "Report not found or not verified." }, { status: 404 });
    }

    // Verify email matches
    if (report.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Check tier — workbook is Blueprint+ only (or Blueprint for limited version)
    const tier = report.tier || report.product_tier || "snapshot";
    if (!["blueprint_plus", "blueprint-plus", "blueprint"].includes(tier)) {
      return NextResponse.json({
        error: "The Brand Workbook is available for WunderBrand Blueprint™ and Blueprint+™ customers.",
      }, { status: 403 });
    }

    // Extract data from the report to populate the workbook
    const engineResults = report.engine_results || report.results || {};
    const pillarScores = engineResults.pillarScores || {};
    const pillarInsights = engineResults.pillarInsights || {};
    const brandAlignmentScore = engineResults.brandAlignmentScore || 0;
    const archetype = engineResults.archetype || engineResults.brandArchetype || {};

    // Build initial workbook content from diagnostic outputs
    const workbook = {
      report_id: reportId,
      email: email.toLowerCase(),
      business_name: report.business_name || report.businessName || "",
      product_tier: tier,
      brand_alignment_score: brandAlignmentScore,
      pillar_scores: pillarScores,
      primary_pillar: engineResults.primaryPillar || engineResults.weakestPillar?.pillar || "",

      // Positioning — seed from diagnostic if available
      positioning_statement: extractFromInsights(pillarInsights, "positioning", "recommendation") || "",
      unique_value_proposition: extractFromInsights(pillarInsights, "positioning", "insight") || "",
      competitive_differentiation: extractFromInsights(pillarInsights, "positioning", "concreteExample") || "",

      // Elevator pitches — will be AI-generated on first load if empty
      elevator_pitch_30s: "",
      elevator_pitch_60s: "",
      elevator_pitch_email: "",

      // Messaging pillars — seed from pillar insights
      messaging_pillars: buildMessagingPillars(pillarInsights),

      // Brand voice — seed from messaging insights
      brand_voice_attributes: extractVoiceAttributes(pillarInsights),
      tone_guidelines: "",
      voice_dos: [],
      voice_donts: [],
      sample_rewrites: [],

      // Audience
      primary_audience: extractAudienceProfile(engineResults),
      secondary_audience: null,

      // Key differentiators
      key_differentiators: extractDifferentiators(pillarInsights),

      // Archetype
      brand_archetype: archetype.name || archetype.archetype || "",
      archetype_description: archetype.description || "",
      archetype_application: archetype.application || archetype.howToApply || "",
    };

    const { data: created, error: insertErr } = await supabaseAdmin
      .from("brand_workbook")
      .insert(workbook)
      .select("*")
      .single();

    if (insertErr) {
      logger.error("[Workbook] Create failed", { error: insertErr.message });
      return NextResponse.json({ error: "Failed to create workbook." }, { status: 500 });
    }

    const editability = getWorkbookEditability({
      productTier: tier,
      createdAt: created.created_at,
      finalizedAt: null,
    });

    return NextResponse.json({ workbook: created, isNew: true, editability });
  } catch (err) {
    logger.error("[Workbook] Auto-create error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to load workbook." }, { status: 500 });
  }
}

// ─── PATCH: Save edits ───
export async function PATCH(req: NextRequest) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "workbook-save" });
  if (!guard.passed) return guard.errorResponse;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { reportId, email, updates } = body;

    if (!reportId || !email || !updates || typeof updates !== "object") {
      return NextResponse.json({ error: "reportId, email, and updates are required." }, { status: 400 });
    }

    // Verify ownership and check editability
    const { data: workbook } = await supabaseAdmin
      .from("brand_workbook")
      .select("id, email, product_tier, created_at, finalized_at")
      .eq("report_id", reportId)
      .single();

    if (!workbook) {
      return NextResponse.json({ error: "Workbook not found." }, { status: 404 });
    }
    if (workbook.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const editability = getWorkbookEditability({
      productTier: workbook.product_tier,
      createdAt: workbook.created_at,
      finalizedAt: workbook.finalized_at,
    });

    if (!editability.canEdit) {
      return NextResponse.json({
        error: "This workbook is read-only.",
        reason: editability.reason,
        isFinalized: editability.isFinalized,
      }, { status: 403 });
    }

    // Whitelist of editable fields
    const EDITABLE_FIELDS = [
      "positioning_statement", "unique_value_proposition", "competitive_differentiation",
      "elevator_pitch_30s", "elevator_pitch_60s", "elevator_pitch_email",
      "messaging_pillars",
      "brand_voice_attributes", "tone_guidelines", "voice_dos", "voice_donts", "sample_rewrites",
      "primary_audience", "secondary_audience",
      "key_differentiators",
      "brand_archetype", "archetype_description", "archetype_application",
      "custom_sections", "business_name",
      "brand_standards_data",
    ];

    const safeUpdates: Record<string, unknown> = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in updates) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    safeUpdates.updated_at = new Date().toISOString();

    const { error: updateErr } = await supabaseAdmin
      .from("brand_workbook")
      .update(safeUpdates)
      .eq("report_id", reportId);

    if (updateErr) {
      logger.error("[Workbook] Update failed", { error: updateErr.message });
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedFields: Object.keys(safeUpdates) });
  } catch (err) {
    logger.error("[Workbook] PATCH error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}

// ─── Helper: Extract text from pillar insights ───
function extractFromInsights(
  insights: Record<string, any>,
  pillar: string,
  field: string
): string {
  const pillarData = insights[pillar];
  if (!pillarData) return "";
  if (typeof pillarData === "string") return "";
  return pillarData[field] || "";
}

// ─── Helper: Build messaging pillars from insights ───
function buildMessagingPillars(insights: Record<string, any>): Array<{
  title: string;
  description: string;
  proof_points: string[];
}> {
  const pillars = ["positioning", "messaging", "visibility", "credibility", "conversion"];
  return pillars
    .filter((p) => insights[p])
    .map((p) => {
      const data = insights[p];
      if (typeof data === "string") {
        return { title: p.charAt(0).toUpperCase() + p.slice(1), description: data, proof_points: [] };
      }
      return {
        title: p.charAt(0).toUpperCase() + p.slice(1),
        description: data.insight || data.recommendation || "",
        proof_points: data.actionItems || [],
      };
    });
}

// ─── Helper: Extract voice attributes ───
function extractVoiceAttributes(insights: Record<string, any>): string[] {
  const messaging = insights.messaging;
  if (!messaging) return [];
  if (messaging.voiceAttributes && Array.isArray(messaging.voiceAttributes)) {
    return messaging.voiceAttributes;
  }
  return [];
}

// ─── Helper: Extract audience profile ───
function extractAudienceProfile(results: Record<string, any>): Record<string, unknown> | null {
  if (results.targetAudience) {
    return typeof results.targetAudience === "string"
      ? { description: results.targetAudience, pain_points: [], decision_triggers: [] }
      : results.targetAudience;
  }
  return null;
}

// ─── Helper: Extract differentiators ───
function extractDifferentiators(
  insights: Record<string, any>
): Array<{ differentiator: string; competitive_advantage: string; proof: string }> {
  const positioning = insights.positioning;
  if (!positioning) return [];
  if (positioning.differentiators && Array.isArray(positioning.differentiators)) {
    return positioning.differentiators;
  }
  return [];
}
