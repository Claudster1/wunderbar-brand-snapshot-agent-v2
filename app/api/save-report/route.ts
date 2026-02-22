// app/api/save-report/route.ts
// API route to save WunderBrand Snapshot™ report and return redirect URL

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateScores } from "@/src/lib/brandSnapshotEngine";

export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "save-report", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    // ─── Security: Body size limit ───
    const { checkBodySize, BODY_LIMITS } = await import("@/lib/security/bodyLimit");
    const sizeCheck = checkBodySize(req, BODY_LIMITS.SAVE_REPORT);
    if (sizeCheck) return sizeCheck;

    const body = await req.json();

    // ─── Security: Verify Turnstile token (bot protection) ───
    const { verifyTurnstileToken } = await import("@/lib/security/turnstile");
    const turnstileResult = await verifyTurnstileToken(
      body.turnstileToken,
      req.headers.get("x-forwarded-for") || undefined
    );
    if (!turnstileResult.success) {
      const { logSecurityEvent, getRequestContext } = await import("@/lib/security/securityEvents");
      logSecurityEvent("turnstile_failed", { ...getRequestContext(req), meta: { errors: turnstileResult["error-codes"] } });
      return NextResponse.json(
        { error: "Security verification failed. Please refresh and try again." },
        { status: 403 }
      );
    }
    
    // ─── Security: Behavioral scoring enforcement ───
    const behavioralScore = body.behavioralScore;
    if (typeof behavioralScore === "number" && behavioralScore > 70) {
      const { logSecurityEvent, getRequestContext } = await import("@/lib/security/securityEvents");
      logSecurityEvent("behavioral_score_blocked", { ...getRequestContext(req), meta: { score: behavioralScore } });
      return NextResponse.json(
        { error: "Suspicious activity detected. Please try again." },
        { status: 403 }
      );
    }

    // Extract data from request
    const {
      brandAlignmentScore,
      pillarScores,
      pillarInsights,
      recommendations, // Pillar-specific recommendations object
      userContext,
      userName,
      email,
      company,
      websiteNotes,
    } = body;

    if (!brandAlignmentScore || !pillarScores) {
      return NextResponse.json(
        { error: "Missing required fields: brandAlignmentScore, pillarScores" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Use centralized engine to calculate scores and generate insights
    const engineResults = calculateScores(pillarScores);

    // Generate unique report ID
    const reportId = crypto.randomUUID();

    // Prepare insights object (use provided or generated from engine)
    const insights = pillarInsights || {
      positioning: engineResults.pillarInsights.positioning.opportunity,
      messaging: engineResults.pillarInsights.messaging.opportunity,
      visibility: engineResults.pillarInsights.visibility.opportunity,
      credibility: engineResults.pillarInsights.credibility.opportunity,
      conversion: engineResults.pillarInsights.conversion.opportunity,
    };

    // Save to database with full dynamic results
    const { error: insertError } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .insert({
        report_id: reportId,
        user_name: userName || null,
        email: email || null,
        company: company || null,
        brand_alignment_score: engineResults.brandAlignmentScore,
        pillar_scores: engineResults.pillarScores,
        pillar_insights: engineResults.pillarInsights, // Full insights with strength, opportunity, action
        recommendations: recommendations || {}, // Pillar-specific recommendations object
        website_notes: websiteNotes || null,
        weakest_pillar: engineResults.weakestPillar.pillar,
        strengths: engineResults.strengths,
        snapshot_upsell: engineResults.snapshotUpsell,
      });

    if (insertError) {
      logger.error("Supabase insert error", { error: insertError instanceof Error ? insertError.message : String(insertError) });
      return NextResponse.json(
        { error: "Failed to save report. Please try again." },
        { status: 500 }
      );
    }

    // Return report ID and redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/report/${reportId}`;

    // ─── Free tier completion: Tag contact + fire event for upgrade nurture ───
    const tier = body.tier || "snapshot";
    if (email && tier === "snapshot") {
      try {
        const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
          await import("@/lib/applyActiveCampaignTags");
        const { fireACEvent } = await import("@/lib/fireACEvent");
        const normalizedEmail = email.trim().toLowerCase();
        const firstName = userName || "";

        // Sync contact name
        if (firstName) {
          await getOrCreateContactId(normalizedEmail, { firstName });
        }

        // Tag as free tier completer + upgrade intent
        await applyActiveCampaignTags({
          email: normalizedEmail,
          tags: [
            "completed:snapshot",
            "intent:upgrade-snapshot-plus",
            "onboarding:snapshot",
          ],
        });

        // Set custom fields for email personalization
        const reportLink = `${baseUrl}/report/${reportId}`;
        const experienceSurveyLink = `${baseUrl}/experience-survey?tier=snapshot&reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(normalizedEmail)}`;

        await setContactFields({
          email: normalizedEmail,
          fields: {
            product_purchased: "WunderBrand Snapshot\u2122 (Free)",
            product_key: "snapshot",
            report_link: reportLink,
            report_id: reportId,
            dashboard_link: `${baseUrl}/dashboard`,
            experience_survey_link: experienceSurveyLink,
            brand_alignment_score: String(engineResults.brandAlignmentScore),
            weakest_pillar: engineResults.weakestPillar.pillar,
            upgrade_product_name: "WunderBrand Snapshot+\u2122",
            upgrade_product_url: "https://wunderbardigital.com/wunderbrand-snapshot-plus",
            upgrade_price: "$497",
            services_url: "https://wunderbardigital.com/talk-to-an-expert",
            ...(firstName ? { first_name_custom: firstName } : {}),
          },
        });

        // Fire event so AC can trigger the free-tier nurture sequence
        await fireACEvent({
          email: normalizedEmail,
          eventName: "free_report_ready",
          tags: ["report:snapshot-ready"],
          fields: {
            first_name: firstName,
            product_name: "WunderBrand Snapshot\u2122",
            report_link: reportLink,
            report_id: reportId,
            brand_alignment_score: engineResults.brandAlignmentScore,
            weakest_pillar: engineResults.weakestPillar.pillar,
            experience_survey_link: experienceSurveyLink,
            dashboard_link: `${baseUrl}/dashboard`,
            upgrade_product_name: "WunderBrand Snapshot+\u2122",
            upgrade_product_url: "https://wunderbardigital.com/wunderbrand-snapshot-plus",
            upgrade_price: "$497",
          },
        });
      } catch (acErr) {
        logger.error("[Save Report] AC free tier tagging failed", { error: acErr instanceof Error ? acErr.message : String(acErr) });
      }
    }

    return NextResponse.json({
      reportId,
      redirectUrl,
      success: true,
    });
  } catch (err: unknown) {
    logger.error("[Save Report API] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to save report. Please try again." },
      { status: 500 }
    );
  }
}

