// PATCH /api/admin/followups/[id]
// Update a follow-up: edit content, approve, mark sent, reject, or approve & send via AC.
//
// Special action:
//   { "action": "approve_and_send" }
//   Approves the follow-up AND pushes the email to ActiveCampaign for delivery.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendFollowupViaAC } from "@/lib/activeCampaign/sendFollowup";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

const ALLOWED_STATUSES = ["pending_review", "approved", "sent", "rejected"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await req.json();

  /* ─── Approve & Send via ActiveCampaign ─── */
  if (body.action === "approve_and_send") {
    // Fetch the full follow-up record
    const { data: followup, error: fetchErr } = await supabaseAdmin
      .from("session_followups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !followup) {
      return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });
    }

    const subject = followup.final_subject || followup.generated_subject;
    const emailBody = followup.final_body || followup.generated_body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: "Cannot send — subject or body is missing." },
        { status: 400 },
      );
    }

    // Push to ActiveCampaign
    const acResult = await sendFollowupViaAC({
      contactEmail: followup.contact_email,
      contactName: followup.contact_name,
      sessionType: followup.session_type,
      subject,
      body: emailBody,
      productTier: followup.product_tier,
      businessName: null, // enriched from AC contact record
    });

    if (!acResult.success) {
      return NextResponse.json(
        { error: `ActiveCampaign error: ${acResult.error}` },
        { status: 502 },
      );
    }

    // Update DB: mark approved + sent
    const now = new Date().toISOString();
    const { error: updateErr } = await supabaseAdmin
      .from("session_followups")
      .update({
        status: "sent",
        reviewed_at: now,
        reviewed_by: "admin",
        final_subject: subject,
        final_body: emailBody,
        ac_event_fired: true,
        ac_event_fired_at: now,
        updated_at: now,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sent: true,
      contactId: acResult.contactId,
    });
  }

  /* ─── Standard field update ─── */
  const update: Record<string, unknown> = {};

  if (body.status && ALLOWED_STATUSES.includes(body.status)) {
    update.status = body.status;
    if (body.status === "approved" || body.status === "rejected") {
      update.reviewed_at = new Date().toISOString();
      update.reviewed_by = "admin";
    }
  }
  if (typeof body.generated_subject === "string") {
    update.generated_subject = body.generated_subject;
    update.final_subject = body.generated_subject;
  }
  if (typeof body.generated_body === "string") {
    update.generated_body = body.generated_body;
    update.final_body = body.generated_body;
  }
  if (body.generated_action_items !== undefined) update.generated_action_items = body.generated_action_items;
  if (body.generated_next_steps !== undefined) update.generated_next_steps = body.generated_next_steps;
  if (typeof body.reviewer_notes === "string") update.reviewer_notes = body.reviewer_notes;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("session_followups")
    .update(update)
    .eq("id", id)
    .select("id, status, generated_subject, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, followup: data });
}
