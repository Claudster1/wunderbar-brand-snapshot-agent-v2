import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCrmTask } from "@/lib/crm/inbound";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

type StaleInquiry = {
  id: string;
  source: string;
  status: string;
  priority: "low" | "normal" | "high" | "urgent";
  contact_id: string | null;
  subject: string | null;
  owner: string | null;
  last_activity_at: string | null;
  crm_contacts:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

function getContact(inquiry: StaleInquiry) {
  if (!inquiry.crm_contacts) return null;
  if (Array.isArray(inquiry.crm_contacts)) return inquiry.crm_contacts[0] ?? null;
  return inquiry.crm_contacts;
}

function normalizeOwnerKey(owner?: string | null): string {
  return (owner || "").trim().toLowerCase();
}

function parseOwnerSlackMap(): Record<string, string> {
  const raw = process.env.CRM_OWNER_SLACK_MAP_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const ownerKey = normalizeOwnerKey(key);
      const userId = (value || "").trim();
      if (ownerKey && userId) normalized[ownerKey] = userId;
    }
    return normalized;
  } catch {
    return {};
  }
}

function getSlackOwnerMention(
  owner: string | null,
  map: Record<string, string>,
  unassignedSlackUserId?: string | null,
): string {
  if (!owner) {
    return unassignedSlackUserId ? `<@${unassignedSlackUserId}>` : "unassigned";
  }
  const ownerKey = normalizeOwnerKey(owner);
  const userId = map[ownerKey];
  if (!userId) return owner;
  return `<@${userId}>`;
}

async function sendSlackReminder(lines: string[]) {
  const slackUrl = process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK;
  if (!slackUrl || lines.length === 0) return;

  const preview = lines.slice(0, 10);
  const text =
    "⚠️ *CRM Stale Inquiry Reminder*\n" +
    "These inquiries are open and stale:\n\n" +
    preview.join("\n");

  await fetch(slackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "CRM Stale Inquiry Reminder",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "Use the action buttons to update status directly in CRM.\n" +
              preview.join("\n"),
          },
        },
        ...(lines.length > 10
          ? [
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `Showing 10 of ${lines.length} stale inquiries.`,
                  },
                ],
              },
            ]
          : []),
      ],
    }),
  });
}

function getHoursSince(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

function priorityRank(priority: StaleInquiry["priority"]): number {
  if (priority === "urgent") return 4;
  if (priority === "high") return 3;
  if (priority === "normal") return 2;
  return 1;
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const ownerSlackMap = parseOwnerSlackMap();
    const unassignedSlackUserId = process.env.CRM_UNASSIGNED_SLACK_USER_ID?.trim() || null;
    const staleHours = Number(process.env.CRM_STALE_REMINDER_HOURS || 24);
    const escalateHighHours = Number(process.env.CRM_ESCALATE_HIGH_HOURS || 48);
    const escalateUrgentHours = Number(process.env.CRM_ESCALATE_URGENT_HOURS || 72);
    const staleCutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000).toISOString();
    const recentReminderCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("crm_inquiries")
      .select(
        `
        id,
        source,
        status,
        priority,
        contact_id,
        subject,
        owner,
        last_activity_at,
        crm_contacts (
          full_name,
          email
        )
      `,
      )
      .in("status", ["new", "in_progress"])
      .lt("last_activity_at", staleCutoff)
      .order("last_activity_at", { ascending: true })
      .limit(50);

    if (error) throw error;

    const staleInquiries = (data ?? []) as StaleInquiry[];
    const reminderLines: string[] = [];
    const reminderBlocks: Array<{
      inquiryId: string;
      text: string;
    }> = [];
    let remindedCount = 0;
    let highEscalations = 0;
    let urgentEscalations = 0;
    let escalationTasksCreated = 0;

    for (const inquiry of staleInquiries) {
      const hoursStale = getHoursSince(inquiry.last_activity_at);
      const targetPriority: StaleInquiry["priority"] | null =
        hoursStale >= escalateUrgentHours
          ? "urgent"
          : hoursStale >= escalateHighHours
            ? "high"
            : null;

      const { data: recentReminder } = await supabaseAdmin
        .from("crm_activities")
        .select("id")
        .eq("inquiry_id", inquiry.id)
        .eq("activity_type", "stale_reminder_sent")
        .gte("created_at", recentReminderCutoff)
        .limit(1)
        .maybeSingle();

      if (recentReminder?.id) continue;

      await supabaseAdmin.from("crm_activities").insert({
        inquiry_id: inquiry.id,
        activity_type: "stale_reminder_sent",
        body: "Stale inquiry reminder triggered by cron.",
        payload: { stale_cutoff: staleCutoff },
        created_by: "system",
      });

      const contact = getContact(inquiry);
      const identity = contact?.full_name || contact?.email || "Unknown contact";
      const ownerLabel = getSlackOwnerMention(
        inquiry.owner,
        ownerSlackMap,
        unassignedSlackUserId,
      );
      let line = `• ${inquiry.subject || "Inbound inquiry"} (${inquiry.source}) — ${identity} — owner: ${
        ownerLabel
      } — stale: ${hoursStale}h`;

      if (targetPriority && priorityRank(inquiry.priority) < priorityRank(targetPriority)) {
        await supabaseAdmin
          .from("crm_inquiries")
          .update({ priority: targetPriority, updated_at: new Date().toISOString() })
          .eq("id", inquiry.id);

        const escalationType =
          targetPriority === "urgent" ? "sla_escalated_urgent" : "sla_escalated_high";

        const { data: existingEscalation } = await supabaseAdmin
          .from("crm_activities")
          .select("id")
          .eq("inquiry_id", inquiry.id)
          .eq("activity_type", escalationType)
          .limit(1)
          .maybeSingle();

        if (!existingEscalation?.id) {
          await supabaseAdmin.from("crm_activities").insert({
            inquiry_id: inquiry.id,
            contact_id: inquiry.contact_id,
            activity_type: escalationType,
            body: `SLA escalation: priority raised to ${targetPriority}.`,
            payload: {
              hours_stale: hoursStale,
              from_priority: inquiry.priority,
              to_priority: targetPriority,
            },
            created_by: "system",
          });

          if (targetPriority === "urgent") urgentEscalations += 1;
          else highEscalations += 1;
        }

        const taskTitle =
          targetPriority === "urgent"
            ? "URGENT: immediate inbound follow-up required"
            : "High priority: stale inbound follow-up required";
        const due = new Date();
        due.setHours(due.getHours() + (targetPriority === "urgent" ? 1 : 4));

        const { data: existingOpenTask } = await supabaseAdmin
          .from("crm_tasks")
          .select("id")
          .eq("inquiry_id", inquiry.id)
          .eq("status", "open")
          .limit(1)
          .maybeSingle();

        if (!existingOpenTask?.id) {
          await createCrmTask({
            inquiryId: inquiry.id,
            contactId: inquiry.contact_id,
            title: taskTitle,
            dueAt: due.toISOString(),
            assignedTo: inquiry.owner,
          });
          escalationTasksCreated += 1;
        }

        line += ` — escalated: ${targetPriority.toUpperCase()}`;
      }

      reminderLines.push(line);
      reminderBlocks.push({
        inquiryId: inquiry.id,
        text: line.replace(/^•\s*/, ""),
      });
      remindedCount += 1;
    }

    if (reminderBlocks.length > 0) {
      const slackUrl = process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK;
      if (slackUrl) {
        const top = reminderBlocks.slice(0, 10);
        const blocks: Array<Record<string, unknown>> = [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "CRM Stale Inquiry Reminder",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Use the buttons below to update inquiry status from Slack.",
            },
          },
        ];

        for (const item of top) {
          blocks.push(
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: item.text,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "In Progress" },
                  style: "primary",
                  action_id: "crm_set_in_progress",
                  value: item.inquiryId,
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "Responded" },
                  action_id: "crm_set_responded",
                  value: item.inquiryId,
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "Close" },
                  style: "danger",
                  action_id: "crm_set_closed",
                  value: item.inquiryId,
                },
              ],
            },
          );
        }

        if (reminderBlocks.length > 10) {
          blocks.push({
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Showing 10 of ${reminderBlocks.length} stale inquiries.`,
              },
            ],
          });
        }

        const fallbackText =
          "⚠️ *CRM Stale Inquiry Reminder*\n" +
          reminderBlocks
            .slice(0, 10)
            .map((i) => `• ${i.text}`)
            .join("\n");

        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: fallbackText,
            blocks,
          }),
        });
      } else {
        await sendSlackReminder(reminderLines);
      }
    }

    logger.info("[CRM Stale Reminder] Complete", {
      scanned: staleInquiries.length,
      reminded: remindedCount,
      highEscalations,
      urgentEscalations,
      escalationTasksCreated,
    });

    return NextResponse.json({
      ok: true,
      scanned: staleInquiries.length,
      reminded: remindedCount,
      highEscalations,
      urgentEscalations,
      escalationTasksCreated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[CRM Stale Reminder] Failed", { error: msg });
    return NextResponse.json({ error: "Failed to run stale reminder" }, { status: 500 });
  }
}
