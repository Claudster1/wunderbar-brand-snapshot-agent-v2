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
    const tagId = await getTagId(tag);
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

export async function setContactFields({
  email,
  fields,
}: {
  email: string;
  fields: Record<string, string>;
}) {
  const contactId = await getOrCreateContactId(email);
  if (!contactId) return;

  const fieldMap = await getFieldMap();

  for (const [title, value] of Object.entries(fields)) {
    const fieldId = fieldMap.get(title);
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
