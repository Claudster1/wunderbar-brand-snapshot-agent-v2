import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCrmActivity, createCrmSyncLog } from "@/lib/crm/inbound";
import { applyActiveCampaignTags, removeActiveCampaignTags } from "@/lib/applyActiveCampaignTags";
import { sanitizeString } from "@/lib/security/inputValidation";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ALLOWED_STATUS = ["new", "in_progress", "responded", "closed"];

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

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
  const status = typeof body.status === "string" ? body.status : null;
  const owner = typeof body.owner === "string" ? sanitizeString(body.owner) : null;
  const note = typeof body.note === "string" ? sanitizeString(body.note) : null;

  if (!status && !owner && !note) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }
  if (status && !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data: inquiry, error: fetchError } = await supabaseAdmin
    .from("crm_inquiries")
    .select("id, contact_id, status, crm_contacts(email)")
    .eq("id", id)
    .single();
  if (fetchError || !inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };
  if (status) updates.status = status;
  if (owner) updates.owner = owner;
  if (status === "responded" && inquiry.status !== "responded") {
    updates.first_response_at = new Date().toISOString();
  }
  if (status === "closed") {
    updates.resolved_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("crm_inquiries")
    .update(updates)
    .eq("id", id)
    .select("id, status, owner, updated_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Failed to update inquiry." }, { status: 500 });
  }

  const contactEmail = (inquiry as { crm_contacts?: { email?: string } | null })?.crm_contacts?.email;

  if (status) {
    await createCrmActivity({
      inquiryId: id,
      contactId: inquiry.contact_id,
      activityType: "status_changed",
      body: `Status changed to ${status}`,
      payload: { from: inquiry.status, to: status },
      createdBy: owner || "admin",
    });
  }

  if (note) {
    await createCrmActivity({
      inquiryId: id,
      contactId: inquiry.contact_id,
      activityType: "note_added",
      body: note,
      payload: {},
      createdBy: owner || "admin",
    });
  }

  if (status === "responded" || status === "closed") {
    await supabaseAdmin
      .from("crm_tasks")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("inquiry_id", id)
      .eq("status", "open");
  }

  if (status && contactEmail) {
    try {
      if (status === "responded" || status === "closed") {
        await applyActiveCampaignTags({
          email: contactEmail,
          tags: ["inquiry:responded"],
        });
        await removeActiveCampaignTags({
          email: contactEmail,
          tags: ["inquiry:pending-response"],
        });
      } else if (status === "new" || status === "in_progress") {
        await applyActiveCampaignTags({
          email: contactEmail,
          tags: ["inquiry:pending-response"],
        });
      }

      await createCrmSyncLog({
        status: "success",
        eventType: "ac.tags.inquiry_status_update",
        contactId: inquiry.contact_id,
        inquiryId: id,
        payload: { email: contactEmail, status },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await createCrmSyncLog({
        status: "failed",
        eventType: "ac.tags.inquiry_status_update",
        contactId: inquiry.contact_id,
        inquiryId: id,
        errorMessage: msg,
        payload: { email: contactEmail, status },
      });
    }
  }

  return NextResponse.json({ success: true, inquiry: updated });
}
