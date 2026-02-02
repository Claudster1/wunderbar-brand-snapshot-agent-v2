const AC_API_URL = process.env.ACTIVE_CAMPAIGN_API_URL!;
const AC_API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY!;

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function getOrCreateContactId(email: string): Promise<string> {
  const { data } = await fetchJson(`${AC_API_URL}/api/3/contact/sync`, {
    method: "POST",
    headers: {
      "Api-Token": AC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contact: { email },
    }),
  });

  return data.contact?.id;
}

async function getTagId(tag: string): Promise<string | null> {
  const { res, data } = await fetchJson(
    `${AC_API_URL}/api/3/tags?search=${encodeURIComponent(tag)}`,
    {
      method: "GET",
      headers: {
        "Api-Token": AC_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok || !data.tags?.length) return null;
  return data.tags[0].id;
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
      headers: {
        "Api-Token": AC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tagId,
        },
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
      {
        method: "GET",
        headers: {
          "Api-Token": AC_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const contactTags = data.contactTags || [];
    for (const contactTag of contactTags) {
      if (!contactTag?.id) continue;
      await fetch(`${AC_API_URL}/api/3/contactTags/${contactTag.id}`, {
        method: "DELETE",
        headers: {
          "Api-Token": AC_API_KEY,
          "Content-Type": "application/json",
        },
      });
    }
  }
}
