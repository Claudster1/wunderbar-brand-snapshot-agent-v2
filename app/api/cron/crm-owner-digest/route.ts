import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

type OwnerRow = {
  owner: string;
  openInquiries: number;
  staleInquiries: number;
  overdueTasks: number;
};

async function sendOwnerDigest(rows: OwnerRow[]) {
  const slackUrl = process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK;
  if (!slackUrl || rows.length === 0) return;

  const sorted = [...rows].sort(
    (a, b) =>
      b.openInquiries + b.staleInquiries + b.overdueTasks -
      (a.openInquiries + a.staleInquiries + a.overdueTasks),
  );

  const lines = sorted.map(
    (r) =>
      `• *${r.owner}* — open: ${r.openInquiries}, stale: ${r.staleInquiries}, overdue tasks: ${r.overdueTasks}`,
  );

  const appBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "https://app.wunderbrand.ai";

  await fetch(slackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `📋 CRM Daily Owner Digest\n${lines.join("\n")}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "CRM Daily Owner Digest" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: lines.join("\n"),
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Inbound Inbox" },
              url: `${appBaseUrl}/admin/inbound`,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Open CRM Analytics" },
              url: `${appBaseUrl}/admin/analytics`,
            },
          ],
        },
      ],
    }),
  });
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const owners: Record<string, OwnerRow> = {};
  const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: inquiries }, { data: tasks }] = await Promise.all([
    supabaseAdmin
      .from("crm_inquiries")
      .select("id, owner, status, last_activity_at")
      .in("status", ["new", "in_progress"])
      .limit(2000),
    supabaseAdmin
      .from("crm_tasks")
      .select("id, assigned_to, status, due_at")
      .eq("status", "open")
      .limit(2000),
  ]);

  for (const inquiry of inquiries || []) {
    const key = (inquiry.owner || "unassigned").trim() || "unassigned";
    if (!owners[key]) {
      owners[key] = { owner: key, openInquiries: 0, staleInquiries: 0, overdueTasks: 0 };
    }
    owners[key].openInquiries += 1;
    if (inquiry.last_activity_at && inquiry.last_activity_at < staleCutoff) {
      owners[key].staleInquiries += 1;
    }
  }

  for (const task of tasks || []) {
    const key = (task.assigned_to || "unassigned").trim() || "unassigned";
    if (!owners[key]) {
      owners[key] = { owner: key, openInquiries: 0, staleInquiries: 0, overdueTasks: 0 };
    }
    if (task.due_at && new Date(task.due_at).getTime() < Date.now()) {
      owners[key].overdueTasks += 1;
    }
  }

  const rows = Object.values(owners);
  if (rows.length > 0) {
    await sendOwnerDigest(rows);
  }

  return NextResponse.json({
    ok: true,
    owners: rows.length,
    timestamp: new Date().toISOString(),
  });
}
