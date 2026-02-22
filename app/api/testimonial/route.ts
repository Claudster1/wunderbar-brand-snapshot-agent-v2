// POST /api/testimonial — Save a testimonial + optional case study interest
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { sanitizeString, isValidEmail } from "@/lib/security/inputValidation";
import { logger } from "@/lib/logger";
import { applyActiveCampaignTags } from "@/lib/applyActiveCampaignTags";
import { fireACEvent } from "@/lib/fireACEvent";

export const dynamic = "force-dynamic";

const VALID_TIERS = ["snapshot", "snapshot_plus", "blueprint", "blueprint_plus"];

export async function POST(req: NextRequest) {
  const guard = apiGuard(req, { routeId: "testimonial", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const {
      reportId,
      email,
      tier,
      experienceScore,
      testimonial,
      displayName,
      companyName,
      roleTitle,
      permissionToPublish,
      caseStudyInterest,
    } = body;

    // ─── Validate required fields ───
    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "Missing reportId." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid product tier." }, { status: 400 });
    }

    if (!testimonial || typeof testimonial !== "string" || testimonial.trim().length < 10) {
      return NextResponse.json(
        { error: "Please share a few words about your experience (at least 10 characters)." },
        { status: 400 }
      );
    }

    // ─── Sanitize ───
    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedTestimonial = sanitizeString(testimonial).slice(0, 5000);
    const sanitizedDisplayName = displayName ? sanitizeString(String(displayName)).slice(0, 200) : null;
    const sanitizedCompany = companyName ? sanitizeString(String(companyName)).slice(0, 200) : null;
    const sanitizedRole = roleTitle ? sanitizeString(String(roleTitle)).slice(0, 200) : null;

    // ─── Save to database ───
    const supabase = supabaseServer();

    const { error: dbError } = await (supabase
      .from("testimonials" as any)
      .upsert(
        {
          report_id: reportId,
          user_email: normalizedEmail,
          product_tier: tier,
          experience_score: typeof experienceScore === "number" ? experienceScore : null,
          testimonial: sanitizedTestimonial,
          display_name: sanitizedDisplayName,
          company_name: sanitizedCompany,
          role_title: sanitizedRole,
          permission_to_publish: !!permissionToPublish,
          case_study_interest: !!caseStudyInterest,
          status: "pending",
        } as any,
        { onConflict: "report_id,user_email" }
      ));

    if (dbError) {
      logger.error("[Testimonial] Database error", { error: dbError.message });
      return NextResponse.json({ error: "Failed to save testimonial." }, { status: 500 });
    }

    logger.info("[Testimonial] Saved", {
      tier,
      hasPermission: !!permissionToPublish,
      caseStudy: !!caseStudyInterest,
    });

    // ─── Tag in ActiveCampaign (non-blocking) ───
    tagForTestimonial(normalizedEmail, !!permissionToPublish, !!caseStudyInterest).catch(
      (err) => logger.error("[Testimonial] AC tagging failed", { error: String(err) })
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[Testimonial] Unexpected error", { error: message });
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// ─── ActiveCampaign tagging for testimonials ───
async function tagForTestimonial(
  email: string,
  permissionToPublish: boolean,
  caseStudyInterest: boolean
) {
  const tags: string[] = ["testimonial:submitted"];

  if (permissionToPublish) {
    tags.push("testimonial:publishable");
  }

  if (caseStudyInterest) {
    tags.push("case-study:interested");
  }

  await applyActiveCampaignTags({ email, tags });

  await fireACEvent({
    email,
    eventName: "testimonial_submitted",
    tags,
    fields: {
      testimonial_publishable: permissionToPublish ? "yes" : "no",
      case_study_interest: caseStudyInterest ? "yes" : "no",
    },
  });
}
