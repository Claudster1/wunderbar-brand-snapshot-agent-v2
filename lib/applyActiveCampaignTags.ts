// lib/applyActiveCampaignTags.ts
// ActiveCampaign API v3 client — tags, custom fields, contact management, automations.

const AC_API_URL = process.env.ACTIVE_CAMPAIGN_API_URL!;
const AC_API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY!;

function acHeaders() {
  return {
    "Api-Token": AC_API_KEY,
    "Content-Type": "application/json",
  };
}

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// ─── Contacts ───

export async function getOrCreateContactId(email: string, extra?: { firstName?: string; lastName?: string; phone?: string }): Promise<string | null> {
  const contact: Record<string, string> = { email };
  if (extra?.firstName) contact.firstName = extra.firstName;
  if (extra?.lastName) contact.lastName = extra.lastName;
  if (extra?.phone) contact.phone = extra.phone;

  const { data } = await fetchJson(`${AC_API_URL}/api/3/contact/sync`, {
    method: "POST",
    headers: acHeaders(),
    body: JSON.stringify({ contact }),
  });

  return data.contact?.id ?? null;
}

// ─── Tags ───

async function getTagId(tag: string): Promise<string | null> {
  const { res, data } = await fetchJson(
    `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tag)}`,
    { method: "GET", headers: acHeaders() }
  );
  if (!res.ok || !data.tags?.length) return null;
  return data.tags[0].id;
}

export async function createTag(tag: string, tagType = "contact"): Promise<string | null> {
  const existing = await getTagId(tag);
  if (existing) return existing;

  const { data } = await fetchJson(`${AC_API_URL}/api/3/tags`, {
    method: "POST",
    headers: acHeaders(),
    body: JSON.stringify({ tag: { tag, tagType, description: "" } }),
  });
  return data.tag?.id ?? null;
}

export async function applyActiveCampaignTags({
  email,
  tags,
}: {
  email: string;
  tags: string[];
}) {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return;

  for (const tag of tags) {
    // Create-then-apply: getTagId only finds *existing* tags, so brand-new tag
    // families (e.g. Calendly session/MQL tags) would otherwise be silently
    // dropped the first time they're used. createTag is idempotent (it looks up
    // the tag first and only creates it if missing).
    const tagId = await createTag(tag);
    if (!tagId) continue;

    await fetch(`${AC_API_URL}/api/3/contactTags`, {
      method: "POST",
      headers: acHeaders(),
      body: JSON.stringify({
        contactTag: { contact: contactId, tag: tagId },
      }),
    });
  }
}

export async function removeActiveCampaignTags({
  email,
  tags,
}: {
  email: string;
  tags: string[];
}) {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return;

  for (const tag of tags) {
    const tagId = await getTagId(tag);
    if (!tagId) continue;

    const { data } = await fetchJson(
      `${AC_API_URL}/api/3/contactTags?contact=${contactId}&tag=${tagId}`,
      { method: "GET", headers: acHeaders() }
    );

    const contactTags = data.contactTags || [];
    for (const contactTag of contactTags) {
      if (!contactTag?.id) continue;
      await fetch(`${AC_API_URL}/api/3/contactTags/${contactTag.id}`, {
        method: "DELETE",
        headers: acHeaders(),
      });
    }
  }
}

// ─── Custom Fields ───

let _fieldCache: Map<string, string> | null = null;

async function getFieldMap(): Promise<Map<string, string>> {
  if (_fieldCache) return _fieldCache;

  const map = new Map<string, string>();
  let offset = 0;
  const limit = 100;

  while (true) {
    const { res, data } = await fetchJson(
      `${AC_API_URL}/api/3/fields?limit=${limit}&offset=${offset}`,
      { method: "GET", headers: acHeaders() }
    );
    if (!res.ok || !data.fields?.length) break;

    for (const f of data.fields) {
      map.set(f.title, f.id);
    }
    if (data.fields.length < limit) break;
    offset += limit;
  }

  _fieldCache = map;
  return map;
}

export async function createCustomField(title: string, type: "text" | "textarea" | "date" | "dropdown" | "hidden" = "text"): Promise<string | null> {
  const fields = await getFieldMap();
  const existing = fields.get(title);
  if (existing) return existing;

  const { data } = await fetchJson(`${AC_API_URL}/api/3/fields`, {
    method: "POST",
    headers: acHeaders(),
    body: JSON.stringify({
      field: {
        type,
        title,
        descript: "",
        visible: 1,
        ordernum: 0,
      },
    }),
  });

  const id = data.field?.id;
  if (id) {
    _fieldCache = null; // Bust cache
  }
  return id ?? null;
}

// Titles that hold long / prose values and should be created as textareas rather than
// single-line text fields when auto-created.
const LONG_TEXT_FIELD_TITLES = new Set<string>(["top_opportunities"]);

export async function setContactFields({
  email,
  fields,
  createMissing = true,
}: {
  email: string;
  fields: Record<string, string>;
  // Auto-create a custom field when no field with the given title exists yet. Mirrors the
  // create-then-apply behavior of applyActiveCampaignTags: without this, values for
  // not-yet-created fields are silently dropped (the same class of bug that once left
  // report_link / content_opt_in_choice empty), which quietly breaks email personalization.
  createMissing?: boolean;
}) {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return;

  const fieldMap = await getFieldMap();

  for (const [title, value] of Object.entries(fields)) {
    let fieldId = fieldMap.get(title);
    if (!fieldId && createMissing) {
      fieldId = (await createCustomField(
        title,
        LONG_TEXT_FIELD_TITLES.has(title) ? "textarea" : "text",
      )) ?? undefined;
    }
    if (!fieldId) continue;

    await fetch(`${AC_API_URL}/api/3/fieldValues`, {
      method: "POST",
      headers: acHeaders(),
      body: JSON.stringify({
        fieldValue: {
          contact: contactId,
          field: fieldId,
          value,
        },
      }),
    });
  }
}

// ─── SMS consent reader ───
//
// Returns the contact's stored mobile number + whether they've opted into SMS.
// Used by outreach triggers (abandoned checkout, no-show) to send Quo texts ONLY
// to people who consented. Reads the custom fields written by the results-page
// SMS opt-in / /api/sms/consent (phone_mobile, sms_opted_in).
export async function getContactSmsInfo(
  email: string,
): Promise<{ phone: string | null; optedIn: boolean }> {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return { phone: null, optedIn: false };

  const fieldMap = await getFieldMap();
  const phoneFieldId = fieldMap.get("phone_mobile");
  const optInFieldId = fieldMap.get("sms_opted_in");

  const { res, data } = await fetchJson(
    `${AC_API_URL}/api/3/contacts/${contactId}/fieldValues`,
    { method: "GET", headers: acHeaders() },
  );

  let phone: string | null = null;
  let optedIn = false;
  if (res.ok && Array.isArray(data.fieldValues)) {
    for (const fv of data.fieldValues as Array<{ field?: string; value?: string }>) {
      if (phoneFieldId && String(fv.field) === String(phoneFieldId) && fv.value) {
        phone = String(fv.value).trim();
      }
      if (optInFieldId && String(fv.field) === String(optInFieldId)) {
        optedIn = String(fv.value ?? "").toLowerCase() === "true";
      }
    }
  }
  return { phone, optedIn };
}

// ─── Lists ───
//
// AC contacts can exist without belonging to any list (the snapshot funnel ran in that mode
// for months — every list showed near-zero counts even though contacts were getting tagged).
// Subscribing leads to a canonical list is required for accurate deliverability reports,
// engagement metrics, and segment health in the AC dashboard.
//
// `status` values: 1 = active, 2 = unsubscribed. We always use 1 here — opt-out preferences
// are tracked separately via the `email:marketing-opted-out` tag, which marketing automations
// filter on.

export async function addContactToList({
  email,
  listId,
}: {
  email: string;
  listId: string | number;
}): Promise<boolean> {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return false;

  const { res } = await fetchJson(`${AC_API_URL}/api/3/contactLists`, {
    method: "POST",
    headers: acHeaders(),
    body: JSON.stringify({
      contactList: {
        list: String(listId),
        contact: contactId,
        status: 1,
      },
    }),
  });

  return res.ok;
}

// ─── Automations ───

export async function addContactToAutomation({
  email,
  automationId,
}: {
  email: string;
  automationId: string;
}) {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return;

  await fetch(`${AC_API_URL}/api/3/contactAutomations`, {
    method: "POST",
    headers: acHeaders(),
    body: JSON.stringify({
      contactAutomation: {
        contact: contactId,
        automation: automationId,
      },
    }),
  });
}

export async function listAutomations(): Promise<Array<{ id: string; name: string; status: string }>> {
  const automations: Array<{ id: string; name: string; status: string }> = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { res, data } = await fetchJson(
      `${AC_API_URL}/api/3/automations?limit=${limit}&offset=${offset}`,
      { method: "GET", headers: acHeaders() }
    );
    if (!res.ok || !data.automations?.length) break;

    for (const a of data.automations) {
      automations.push({ id: a.id, name: a.name, status: a.status });
    }
    if (data.automations.length < limit) break;
    offset += limit;
  }

  return automations;
}
