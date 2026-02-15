// POST /api/nps/respond — Record an NPS survey response
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { sanitizeString, isValidEmail } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";
import { applyActiveCampaignTags, removeActiveCampaignTags } from "@/lib/applyActiveCampaignTags";
import { fireACEvent } from "@/lib/fireACEvent";

// ─── Tag NPS category in ActiveCampaign ───
const NPS_CATEGORIES = ["promoter", "passive", "detractor"] as const;

async function tagContactForNPS(
  email: string,
  category: "promoter" | "passive" | "detractor",
  tier: string,
  score: number
) {
  // Remove stale NPS tags (a person may retake, so keep only the latest)
  const staleTags = NPS_CATEGORIES.filter((c) => c !== category).map((c) => `nps:${c}`);
  await removeActiveCampaignTags({ email, tags: staleTags });

  // Apply current NPS tag + tier-specific tag
  const applyTags = [`nps:${category}`, `nps:${tier}:${category}`];

  // Promoters get a review-eligible tag
  if (category === "promoter") {
    applyTags.push("review:eligible", "testimonial:eligible");
  }

  // Detractors get retention tag for win-back automation
  if (category === "detractor") {
    applyTags.push("retention:at-risk");
  }

  await applyActiveCampaignTags({ email, tags: applyTags });

  // Set custom fields for NPS email personalization
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.wunderbrand.ai";
  const { setContactFields } = await import("@/lib/applyActiveCampaignTags");

  try {
    const npsFields: Record<string, string> = {
      nps_score: String(score),
      nps_category: category,
      nps_tier: tier,
      nps_date: new Date().toISOString().split("T")[0],
    };
    if (category === "promoter") {
      npsFields.testimonial_link = `${BASE_URL}/nps?tier=${tier}&step=testimonial&email=${encodeURIComponent(email)}`;
      npsFields.google_review_url = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "";
    }
    await setContactFields({ email, fields: npsFields });
  } catch (fieldErr) {
    // Non-blocking
  }

  // Fire event so AC automations can trigger review/case-study sequences
  await fireACEvent({
    email,
    eventName: "nps_submitted",
    tags: applyTags,
    fields: {
      nps_score: score,
      nps_category: category,
      nps_tier: tier,
      nps_date: new Date().toISOString().split("T")[0],
      testimonial_link: category === "promoter" ? `${BASE_URL}/nps?tier=${tier}&step=testimonial&email=${encodeURIComponent(email)}` : "",
      google_review_url: category === "promoter" ? (process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "") : "",
    },
  });
}

export const dynamic = "force-dynamic";

const VALID_TIERS = ["snapshot", "snapshot_plus", "blueprint", "blueprint_plus"];

export async function POST(req: NextRequest) {
  const guard = apiGuard(req, { routeId: "nps-respond", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const { score, reason, reportId, email, tier } = body;

    // ─── Validate required fields ───
    if (typeof score !== "number" || score < 0 || score > 10 || !Number.isInteger(score)) {
      return NextResponse.json({ error: "Score must be an integer between 0 and 10." }, { status: 400 });
    }

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid product tier." }, { status: 400 });
    }

    // ─── Sanitize ───
    const sanitizedReason = reason ? sanitizeString(String(reason)).slice(0, 2000) : null;
    const normalizedEmail = email.trim().toLowerCase();

    // ─── Save to database ───
    const supabase = supabaseServer();

    const { error: dbError } = await (supabase
      .from("nps_responses" as any)
      .upsert(
        {
          report_id: reportId,
          user_email: normalizedEmail,
          product_tier: tier,
          score,
          reason: sanitizedReason,
        } as any,
        { onConflict: "report_id,user_email" }
      ));

    if (dbError) {
      logger.error("[NPS] Database error", { error: dbError.message });
      return NextResponse.json({ error: "Failed to save response." }, { status: 500 });
    }

    // ─── Categorize ───
    const category = score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
    logger.info("[NPS] Response recorded", { tier, score, category });

    // ─── Tag contact in ActiveCampaign (non-blocking) ───
    tagContactForNPS(normalizedEmail, category, tier, score).catch((err) =>
      logger.error("[NPS] AC tagging failed", { error: String(err) })
    );

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[NPS] Unexpected error", { error: message });
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
