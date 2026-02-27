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

export async function GET(
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

  const { data: inquiry, error: inquiryError } = await supabaseAdmin
    .from("crm_inquiries")
    .select(
      `
      id,
      source,
      status,
      priority,
      subject,
      message,
      transcript,
      owner,
      first_response_at,
      resolved_at,
      last_activity_at,
      created_at,
      updated_at,
      crm_contacts (
        id,
        email,
        phone,
        full_name,
        company_name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (inquiryError || !inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  }

  const [tasksRes, activitiesRes, syncRes] = await Promise.all([
    supabaseAdmin
      .from("crm_tasks")
      .select("id, title, status, due_at, assigned_to, created_at, updated_at")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("crm_activities")
      .select("id, activity_type, body, payload, created_by, created_at")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("crm_sync_log")
      .select("id, provider, status, event_type, error_message, payload, created_at")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  return NextResponse.json({
    inquiry,
    tasks: tasksRes.data || [],
    activities: activitiesRes.data || [],
    syncLog: syncRes.data || [],
  });
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
  const ownerProvided = Object.prototype.hasOwnProperty.call(body, "owner");
  let owner: string | null | undefined = undefined;
  if (ownerProvided) {
    if (typeof body.owner === "string") {
      const sanitizedOwner = sanitizeString(body.owner).trim();
      owner = sanitizedOwner || null;
    } else if (body.owner === null) {
      owner = null;
    }
  }
  const note = typeof body.note === "string" ? sanitizeString(body.note) : null;

  if (!status && owner === undefined && !note) {
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
  if (owner !== undefined) updates.owner = owner;
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
      createdBy: (owner ?? undefined) || "admin",
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
