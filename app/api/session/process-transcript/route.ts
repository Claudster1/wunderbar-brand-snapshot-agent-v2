// POST /api/session/process-transcript
// Receives a call transcript (from Zapier/Otter.ai or manual upload),
// generates a personalized follow-up email via OpenAI, and stores it
// in the review queue for admin approval before sending.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";
import { withRetry } from "@/lib/openaiRetry";
import {
  getFollowupSystemPrompt,
  getFollowupUserPrompt,
  type SessionType,
} from "@/lib/session/followupPrompts";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for OpenAI generation

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ZAPIER_WEBHOOK_SECRET = process.env.ZAPIER_WEBHOOK_SECRET; // Optional: shared secret for Zapier

const VALID_SESSION_TYPES: SessionType[] = ["talk_to_expert", "activation_session"];

export async function POST(req: NextRequest) {
  // ─── Auth: Accept either ADMIN_API_KEY or ZAPIER_WEBHOOK_SECRET ───
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();
  const zapierSecret = req.headers.get("x-zapier-secret") || "";

  const isAdmin = ADMIN_API_KEY && apiKey === ADMIN_API_KEY;
  const isZapier = ZAPIER_WEBHOOK_SECRET && zapierSecret === ZAPIER_WEBHOOK_SECRET;

  if (!isAdmin && !isZapier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      contact_email,
      contact_name,
      session_type,
      transcript,
      transcript_summary,
      report_id,
      product_tier,
      team_member_name,
      additional_context,
      source,
    } = body;

    // ─── Validation ───
    if (!contact_email || typeof contact_email !== "string" || !contact_email.includes("@")) {
      return NextResponse.json({ error: "Valid contact_email is required." }, { status: 400 });
    }
    if (!session_type || !VALID_SESSION_TYPES.includes(session_type)) {
      return NextResponse.json(
        { error: `session_type must be one of: ${VALID_SESSION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!transcript || typeof transcript !== "string" || transcript.length < 50) {
      return NextResponse.json({ error: "Transcript must be at least 50 characters." }, { status: 400 });
    }
    if (transcript.length > 200_000) {
      return NextResponse.json({ error: "Transcript too large (max 200KB)." }, { status: 400 });
    }

    logger.info("[Session] Processing transcript", {
      email: contact_email,
      type: session_type,
      transcriptLength: transcript.length,
    });

    // ─── Auto-enrich: look up contact's report + purchase history ───
    let enrichedReportId = report_id || null;
    let enrichedProductTier = product_tier || null;
    let enrichmentContext = additional_context || "";

    if (supabaseAdmin) {
      const normalizedEmail = contact_email.trim().toLowerCase();

      try {
        // Find their most recent report
        const { data: reportData } = await supabaseAdmin
          .from("brand_snapshot_reports")
          .select("report_id, company_name, brand_alignment_score, pillar_scores, user_name, created_at")
          .eq("user_email", normalizedEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reportData) {
          enrichedReportId = enrichedReportId || reportData.report_id;

          // Build context from report data
          const reportContext: string[] = [];
          if (reportData.company_name) reportContext.push(`Business: ${reportData.company_name}`);
          if (reportData.brand_alignment_score != null) reportContext.push(`WunderBrand Score: ${reportData.brand_alignment_score}/100`);

          if (reportData.pillar_scores && typeof reportData.pillar_scores === "object") {
            const scores = reportData.pillar_scores as Record<string, number>;
            const pillarLines = Object.entries(scores)
              .map(([pillar, score]) => `${pillar}: ${score}/20`)
              .join(", ");
            reportContext.push(`Pillar scores: ${pillarLines}`);

            // Identify weakest pillar
            const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
            if (weakest) reportContext.push(`Weakest pillar: ${weakest[0]} (${weakest[1]}/20)`);

            // Identify strongest pillar
            const strongest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
            if (strongest) reportContext.push(`Strongest pillar: ${strongest[0]} (${strongest[1]}/20)`);
          }

          if (reportData.created_at) {
            const reportDate = new Date(reportData.created_at).toLocaleDateString("en-AU", {
              year: "numeric", month: "long", day: "numeric",
            });
            reportContext.push(`Report date: ${reportDate}`);
          }

          if (reportContext.length > 0) {
            const enrichmentBlock = `\n\nCLIENT WUNDERBRAND REPORT DATA:\n${reportContext.join("\n")}`;
            enrichmentContext = enrichmentContext
              ? `${enrichmentContext}${enrichmentBlock}`
              : enrichmentBlock.trim();
          }

          logger.info("[Session] Enriched with report data", {
            email: normalizedEmail,
            reportId: reportData.report_id,
            score: reportData.brand_alignment_score,
          });
        }

        // Find their highest product tier from purchases
        if (!enrichedProductTier) {
          const { data: purchases } = await supabaseAdmin
            .from("brand_snapshot_purchases")
            .select("product_sku, created_at")
            .eq("user_email", normalizedEmail)
            .eq("status", "completed")
            .order("created_at", { ascending: false });

          if (purchases && purchases.length > 0) {
            // Rank tiers: blueprint_plus > blueprint > snapshot_plus > snapshot
            const tierRank: Record<string, number> = {
              BLUEPRINT_PLUS: 4, BLUEPRINT: 3, SNAPSHOT_PLUS: 2, SNAPSHOT: 1,
            };
            const highest = purchases.sort(
              (a, b) => (tierRank[b.product_sku] || 0) - (tierRank[a.product_sku] || 0)
            )[0];
            enrichedProductTier = highest.product_sku.toLowerCase().replace("_", "-");

            const allProducts = purchases.map((p) => p.product_sku).join(", ");
            enrichmentContext += `\nProducts purchased: ${allProducts}`;

            logger.info("[Session] Enriched with purchase data", {
              email: normalizedEmail,
              tier: enrichedProductTier,
              totalPurchases: purchases.length,
            });
          }
        }
      } catch (enrichErr) {
        logger.error("[Session] Enrichment lookup failed (non-blocking)", {
          error: enrichErr instanceof Error ? enrichErr.message : String(enrichErr),
        });
        // Non-blocking — continue with whatever data we have
      }
    }

    // ─── Generate follow-up content via OpenAI ───
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = getFollowupSystemPrompt(session_type);
    const userPrompt = getFollowupUserPrompt({
      transcript,
      contactName: contact_name,
      contactEmail: contact_email,
      productTier: enrichedProductTier,
      reportId: enrichedReportId,
      teamMemberName: team_member_name,
      additionalContext: enrichmentContext || undefined,
    });

    const completion = await withRetry(
      () =>
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      { maxRetries: 2, timeoutMs: 55_000 }
    );

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let generated: {
      subject?: string;
      body?: string;
      action_items?: unknown[];
      next_steps?: unknown[];
      product_recommendations?: unknown[];
    };

    try {
      generated = JSON.parse(rawContent);
    } catch {
      logger.error("[Session] Failed to parse OpenAI response", { raw: rawContent.slice(0, 500) });
      return NextResponse.json({ error: "AI generation produced invalid output. Please retry." }, { status: 502 });
    }

    // ─── Save to review queue ───
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const { data, error: dbError } = await supabaseAdmin
      .from("session_followups")
      .insert({
        contact_email: contact_email.trim().toLowerCase(),
        contact_name: contact_name || null,
        session_type,
        report_id: enrichedReportId || null,
        product_tier: enrichedProductTier || null,
        transcript_text: transcript,
        transcript_summary: transcript_summary || null,
        transcript_source: source || (isZapier ? "otter_zapier" : "manual"),
        generated_subject: generated.subject || null,
        generated_body: generated.body || null,
        generated_action_items: generated.action_items || null,
        generated_next_steps: generated.next_steps || null,
        generated_product_recommendations: generated.product_recommendations || null,
        status: "pending_review",
      })
      .select("id, status, generated_subject")
      .single();

    if (dbError) {
      logger.error("[Session] DB insert failed", { error: dbError.message });
      return NextResponse.json({ error: "Failed to save follow-up." }, { status: 500 });
    }

    // ─── Tag contact in AC ───
    try {
      const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
        await import("@/lib/applyActiveCampaignTags");

      const normalizedEmail = contact_email.trim().toLowerCase();

      // Sync contact name
      if (contact_name) {
        await getOrCreateContactId(normalizedEmail, { firstName: contact_name });
      }

      // Apply tags
      const tags = [
        session_type === "talk_to_expert" ? "call:expert-completed" : "session:activation-completed",
        "followup:pending-review",
      ];
      if (session_type === "activation_session") {
        tags.push("session:completed");
      }
      await applyActiveCampaignTags({ email: normalizedEmail, tags });

      // Set custom fields
      await setContactFields({
        email: normalizedEmail,
        fields: {
          last_call_type: session_type === "talk_to_expert" ? "Talk to an Expert" : "Strategy Activation Session",
          last_call_date: new Date().toISOString().split("T")[0],
          ...(team_member_name ? { last_call_strategist: team_member_name } : {}),
        },
      });
    } catch (acErr) {
      logger.error("[Session] AC tagging failed", { error: acErr instanceof Error ? acErr.message : String(acErr) });
      // Non-blocking — the follow-up is still saved for review
    }

    logger.info("[Session] Follow-up generated and queued", {
      id: data?.id,
      email: contact_email,
      type: session_type,
      subject: generated.subject?.slice(0, 60),
    });

    return NextResponse.json({
      success: true,
      followup_id: data?.id,
      status: "pending_review",
      subject: generated.subject,
      message: "Follow-up content generated and queued for review.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[Session] process-transcript error", { error: msg });
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
