// GET  /api/session/followups       — List follow-ups in the review queue
// PATCH /api/session/followups      — Update a follow-up (edit, approve, reject)
// POST  /api/session/followups      — Approve + send a follow-up (triggers AC email)
//
// All endpoints require ADMIN_API_KEY in the Authorization header.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();
  return Boolean(ADMIN_API_KEY && apiKey === ADMIN_API_KEY);
}

// ─── GET: List follow-ups ───
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending_review";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 25, 100);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const sessionType = url.searchParams.get("type");

  let query = supabaseAdmin
    .from("session_followups")
    .select(
      "id, contact_email, contact_name, session_type, product_tier, " +
      "generated_subject, generated_body, generated_action_items, generated_next_steps, " +
      "generated_product_recommendations, final_subject, final_body, " +
      "status, reviewed_by, reviewed_at, reviewer_notes, " +
      "transcript_summary, transcript_source, " +
      "ac_event_fired, created_at, updated_at"
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (sessionType) {
    query = query.eq("session_type", sessionType);
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error("[Session Followups] List failed", { error: error.message });
    return NextResponse.json({ error: "Failed to fetch follow-ups." }, { status: 500 });
  }

  return NextResponse.json({ followups: data, count: data?.length ?? 0 });
}

// ─── PATCH: Edit / approve / reject a follow-up ───
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const body = await req.json();
  const { id, action, final_subject, final_body, reviewer_notes, reviewed_by } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Follow-up id is required." }, { status: 400 });
  }

  // ─── Action: approve (moves to approved, then sends) ───
  if (action === "approve") {
    // Fetch the current follow-up
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("session_followups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
    }

    // Use final_ content if edited, otherwise fall back to generated_ content
    const emailSubject = final_subject || existing.final_subject || existing.generated_subject;
    const emailBody = final_body || existing.final_body || existing.generated_body;

    if (!emailSubject || !emailBody) {
      return NextResponse.json({ error: "Subject and body are required to approve." }, { status: 400 });
    }

    // Update status
    const { error: updateErr } = await supabaseAdmin
      .from("session_followups")
      .update({
        status: "approved",
        final_subject: emailSubject,
        final_body: emailBody,
        reviewed_by: reviewed_by || "admin",
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewer_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      logger.error("[Session Followups] Approve failed", { error: updateErr.message });
      return NextResponse.json({ error: "Failed to approve." }, { status: 500 });
    }

    // ─── Fire AC event to trigger the follow-up email ───
    try {
      const { fireACEvent } = await import("@/lib/fireACEvent");
      const { applyActiveCampaignTags, setContactFields } = await import("@/lib/applyActiveCampaignTags");

      const email = existing.contact_email;
      const sessionLabel = existing.session_type === "talk_to_expert"
        ? "Talk to an Expert"
        : "Strategy Activation Session";

      // Remove pending tag, add sent tag
      await applyActiveCampaignTags({
        email,
        tags: [
          `followup:sent-${existing.session_type.replace(/_/g, "-")}`,
        ],
      });

      // Set the email content as custom fields so AC can personalize
      await setContactFields({
        email,
        fields: {
          followup_subject: emailSubject,
          followup_body: emailBody,
          followup_session_type: sessionLabel,
          followup_sent_date: new Date().toISOString().split("T")[0],
        },
      });

      // Fire the event to trigger the AC automation
      const eventName = existing.session_type === "talk_to_expert"
        ? "expert_call_followup_ready"
        : "activation_session_followup_ready";

      await fireACEvent({
        email,
        eventName,
        tags: [`followup:sent-${existing.session_type.replace(/_/g, "-")}`],
        fields: {
          followup_subject: emailSubject,
          contact_name: existing.contact_name || "",
          session_type: sessionLabel,
        },
      });

      // Mark AC event as fired
      await supabaseAdmin
        .from("session_followups")
        .update({
          status: "sent",
          ac_event_fired: true,
          ac_event_fired_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      logger.info("[Session Followups] Follow-up approved and sent via AC", {
        id,
        email,
        type: existing.session_type,
      });

      return NextResponse.json({
        success: true,
        status: "sent",
        message: "Follow-up approved and email triggered via ActiveCampaign.",
      });
    } catch (acErr) {
      logger.error("[Session Followups] AC send failed", {
        error: acErr instanceof Error ? acErr.message : String(acErr),
      });
      // Still approved — admin can manually trigger
      return NextResponse.json({
        success: true,
        status: "approved",
        warning: "Approved but AC email trigger failed. You can retry or send manually.",
      });
    }
  }

  // ─── Action: reject ───
  if (action === "reject") {
    const { error: updateErr } = await supabaseAdmin
      .from("session_followups")
      .update({
        status: "rejected",
        reviewed_by: reviewed_by || "admin",
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewer_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to reject." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "rejected" });
  }

  // ─── Action: edit (save draft edits without approving) ───
  if (action === "edit") {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (final_subject) updates.final_subject = final_subject;
    if (final_body) updates.final_body = final_body;
    if (reviewer_notes) updates.reviewer_notes = reviewer_notes;

    const { error: updateErr } = await supabaseAdmin
      .from("session_followups")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to save edits." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "draft_saved" });
  }

  // ─── Action: regenerate (re-run AI with the same transcript) ───
  if (action === "regenerate") {
    // Fetch transcript
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("session_followups")
      .select("transcript_text, contact_email, contact_name, session_type, product_tier, report_id")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
    }

    // Re-generate via OpenAI
    try {
      const OpenAI = (await import("openai")).default;
      const { getFollowupSystemPrompt, getFollowupUserPrompt } = await import("@/lib/session/followupPrompts");
      const { withRetry } = await import("@/lib/openaiRetry");

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const systemPrompt = getFollowupSystemPrompt(existing.session_type as "talk_to_expert" | "activation_session");
      const userPrompt = getFollowupUserPrompt({
        transcript: existing.transcript_text,
        contactName: existing.contact_name || undefined,
        contactEmail: existing.contact_email,
        productTier: existing.product_tier || undefined,
        reportId: existing.report_id || undefined,
      });

      const completion = await withRetry(
        () =>
          openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.8, // Slightly higher for variety on regenerate
            max_tokens: 4000,
            response_format: { type: "json_object" },
          }),
        { maxRetries: 2, timeoutMs: 55_000 }
      );

      const rawContent = completion.choices[0]?.message?.content || "{}";
      const generated = JSON.parse(rawContent);

      await supabaseAdmin
        .from("session_followups")
        .update({
          generated_subject: generated.subject || null,
          generated_body: generated.body || null,
          generated_action_items: generated.action_items || null,
          generated_next_steps: generated.next_steps || null,
          generated_product_recommendations: generated.product_recommendations || null,
          status: "pending_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        status: "pending_review",
        subject: generated.subject,
        message: "Content regenerated and ready for review.",
      });
    } catch (genErr) {
      return NextResponse.json({ error: "Regeneration failed." }, { status: 502 });
    }
  }

  return NextResponse.json(
    { error: "Invalid action. Use: approve, reject, edit, regenerate." },
    { status: 400 }
  );
}
