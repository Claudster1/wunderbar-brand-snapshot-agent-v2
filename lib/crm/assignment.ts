import { supabaseAdmin } from "@/lib/supabase-admin";

type InquirySource = "connect_form" | "quo_call" | "quo_voicemail" | "manual";

function normalizeOwnerName(value: string): string {
  return value.trim();
}

function parseSourceMap(): Record<string, string> {
  const raw = process.env.CRM_AUTO_ASSIGN_SOURCE_MAP_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const owner = normalizeOwnerName(value || "");
      if (owner) out[key.trim()] = owner;
    }
    return out;
  } catch {
    return {};
  }
}

function parseOwners(): string[] {
  const rawOwners = (process.env.CRM_AUTO_ASSIGN_OWNERS || "")
    .split(",")
    .map((v) => normalizeOwnerName(v))
    .filter(Boolean);
  if (rawOwners.length > 0) return Array.from(new Set(rawOwners));

  // Fallback to keys from slack owner map.
  const slackMapRaw = process.env.CRM_OWNER_SLACK_MAP_JSON?.trim();
  if (!slackMapRaw) return [];
  try {
    const parsed = JSON.parse(slackMapRaw) as Record<string, string>;
    return Array.from(
      new Set(
        Object.keys(parsed)
          .map((v) => normalizeOwnerName(v))
          .filter(Boolean),
      ),
    );
  } catch {
    return [];
  }
}

export async function resolveAutoAssignedOwner(params: {
  source: InquirySource;
}): Promise<{ owner: string | null; reason: string }> {
  const enabled = (process.env.CRM_AUTO_ASSIGN_ENABLED || "true").toLowerCase() !== "false";
  if (!enabled) return { owner: null, reason: "auto_assign_disabled" };
  if (!supabaseAdmin) return { owner: null, reason: "database_unavailable" };

  const sourceMap = parseSourceMap();
  if (sourceMap[params.source]) {
    return { owner: sourceMap[params.source], reason: `source_map:${params.source}` };
  }

  const owners = parseOwners();
  if (owners.length === 0) return { owner: null, reason: "no_owner_pool" };

  // Stateless round-robin based on current inquiry count for this source.
  const { count } = await supabaseAdmin
    .from("crm_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("source", params.source);

  const idx = (count ?? 0) % owners.length;
  return { owner: owners[idx], reason: `round_robin:${owners.length}` };
}
