import { supabaseAdmin } from "@/lib/supabase-admin";

export type CrmContactInput = {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  companyName?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
};

export type CrmInquiryInput = {
  contactId?: string | null;
  source: "connect_form" | "quo_call" | "quo_voicemail" | "manual";
  status?: "new" | "in_progress" | "responded" | "closed";
  priority?: "low" | "normal" | "high" | "urgent";
  subject?: string | null;
  message?: string | null;
  transcript?: string | null;
  externalRef?: string | null;
  owner?: string | null;
  channelMetadata?: Record<string, unknown>;
  attribution?: Record<string, unknown>;
};

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  return phone.trim().replace(/\s+/g, "");
}

export async function upsertCrmContact(input: CrmContactInput): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (!email && !phone) return null;

  let existing: { id: string; metadata?: Record<string, unknown> | null } | null = null;

  if (email) {
    const { data } = await supabaseAdmin
      .from("crm_contacts")
      .select("id, metadata")
      .eq("email", email)
      .maybeSingle();
    existing = (data as typeof existing) ?? null;
  }

  if (!existing && phone) {
    const { data } = await supabaseAdmin
      .from("crm_contacts")
      .select("id, metadata")
      .eq("phone", phone)
      .maybeSingle();
    existing = (data as typeof existing) ?? null;
  }

  if (existing?.id) {
    const mergedMetadata = {
      ...(existing.metadata ?? {}),
      ...(input.metadata ?? {}),
    };

    await supabaseAdmin
      .from("crm_contacts")
      .update({
        email: email ?? undefined,
        phone: phone ?? undefined,
        full_name: input.fullName ?? undefined,
        company_name: input.companyName ?? undefined,
        primary_source: input.source ?? undefined,
        metadata: mergedMetadata,
      })
      .eq("id", existing.id);

    return existing.id;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_contacts")
    .insert({
      email,
      phone,
      full_name: input.fullName ?? null,
      company_name: input.companyName ?? null,
      primary_source: input.source ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) return null;
  return (data?.id as string) ?? null;
}

export async function createCrmInquiry(input: CrmInquiryInput): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("crm_inquiries")
    .insert({
      contact_id: input.contactId ?? null,
      source: input.source,
      status: input.status ?? "new",
      priority: input.priority ?? "normal",
      subject: input.subject ?? null,
      message: input.message ?? null,
      transcript: input.transcript ?? null,
      external_ref: input.externalRef ?? null,
      owner: input.owner ?? null,
      channel_metadata: input.channelMetadata ?? {},
      attribution: input.attribution ?? {},
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return null;
  return (data?.id as string) ?? null;
}

export async function findInquiryByExternalRef(
  source: "connect_form" | "quo_call" | "quo_voicemail" | "manual",
  externalRef?: string | null,
): Promise<string | null> {
  if (!supabaseAdmin || !externalRef) return null;

  const { data } = await supabaseAdmin
    .from("crm_inquiries")
    .select("id")
    .eq("source", source)
    .eq("external_ref", externalRef)
    .maybeSingle();

  return (data?.id as string) ?? null;
}

export async function createCrmActivity(params: {
  inquiryId?: string | null;
  contactId?: string | null;
  activityType: string;
  body?: string | null;
  payload?: Record<string, unknown>;
  createdBy?: string | null;
}) {
  if (!supabaseAdmin) return;

  await supabaseAdmin.from("crm_activities").insert({
    inquiry_id: params.inquiryId ?? null,
    contact_id: params.contactId ?? null,
    activity_type: params.activityType,
    body: params.body ?? null,
    payload: params.payload ?? {},
    created_by: params.createdBy ?? null,
  });

  if (params.inquiryId) {
    await supabaseAdmin
      .from("crm_inquiries")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", params.inquiryId);
  }
}

export async function createCrmTask(params: {
  inquiryId?: string | null;
  contactId?: string | null;
  title: string;
  dueAt?: string | null;
  assignedTo?: string | null;
}) {
  if (!supabaseAdmin || !params.inquiryId) return;

  await supabaseAdmin.from("crm_tasks").insert({
    inquiry_id: params.inquiryId,
    contact_id: params.contactId ?? null,
    title: params.title,
    status: "open",
    due_at: params.dueAt ?? null,
    assigned_to: params.assignedTo ?? null,
  });
}

export async function createDefaultCrmTaskForInquiry(params: {
  inquiryId?: string | null;
  contactId?: string | null;
  source: "connect_form" | "quo_call" | "quo_voicemail" | "manual";
}) {
  if (!supabaseAdmin || !params.inquiryId) return;

  const { data: existing } = await supabaseAdmin
    .from("crm_tasks")
    .select("id")
    .eq("inquiry_id", params.inquiryId)
    .eq("status", "open")
    .limit(1)
    .maybeSingle();

  if (existing?.id) return;

  const due = new Date();
  if (params.source === "quo_voicemail") due.setHours(due.getHours() + 4);
  else if (params.source === "quo_call") due.setHours(due.getHours() + 8);
  else due.setHours(due.getHours() + 24);

  const titleBySource: Record<typeof params.source, string> = {
    connect_form: "Respond to connect form inquiry",
    quo_call: "Follow up on inbound call",
    quo_voicemail: "Return inbound voicemail",
    manual: "Follow up on inbound inquiry",
  };

  await createCrmTask({
    inquiryId: params.inquiryId,
    contactId: params.contactId ?? null,
    title: titleBySource[params.source],
    dueAt: due.toISOString(),
  });
}

export async function createCrmSyncLog(params: {
  status: "success" | "failed";
  eventType: string;
  direction?: "outbound" | "inbound";
  contactId?: string | null;
  inquiryId?: string | null;
  errorMessage?: string | null;
  payload?: Record<string, unknown>;
}) {
  if (!supabaseAdmin) return;

  await supabaseAdmin.from("crm_sync_log").insert({
    provider: "activecampaign",
    direction: params.direction ?? "outbound",
    status: params.status,
    event_type: params.eventType,
    contact_id: params.contactId ?? null,
    inquiry_id: params.inquiryId ?? null,
    error_message: params.errorMessage ?? null,
    payload: params.payload ?? {},
  });
}
