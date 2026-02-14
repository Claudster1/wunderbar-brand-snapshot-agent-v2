// POST /api/nps/respond — Record an NPS survey response
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { sanitizeString, isValidEmail } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";

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

    // ─── Categorize for logging ───
    const category = score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
    logger.info("[NPS] Response recorded", { tier, score, category });

    return NextResponse.json({ success: true, category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[NPS] Unexpected error", { error: message });
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
