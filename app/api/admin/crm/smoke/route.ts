import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApi } from "@/lib/auth/adminSession";

type CheckResult = {
  ok: boolean;
  detail?: string;
};

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const checks: Record<string, CheckResult> = {};

  // DB existence/readability checks (no side effects).
  try {
    const [inquiries, tasks, activities, syncLog] = await Promise.all([
      supabaseAdmin.from("crm_inquiries").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("crm_tasks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("crm_activities").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("crm_sync_log").select("id", { count: "exact", head: true }),
    ]);

    checks.db_crm_inquiries = inquiries.error
      ? { ok: false, detail: inquiries.error.message }
      : { ok: true, detail: `count=${inquiries.count ?? 0}` };
    checks.db_crm_tasks = tasks.error
      ? { ok: false, detail: tasks.error.message }
      : { ok: true, detail: `count=${tasks.count ?? 0}` };
    checks.db_crm_activities = activities.error
      ? { ok: false, detail: activities.error.message }
      : { ok: true, detail: `count=${activities.count ?? 0}` };
    checks.db_crm_sync_log = syncLog.error
      ? { ok: false, detail: syncLog.error.message }
      : { ok: true, detail: `count=${syncLog.count ?? 0}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.db = { ok: false, detail: msg };
  }

  // Env/config checks used by CRM automation and Slack workflow.
  checks.auth_supabase_service_role = {
    ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing",
  };
  checks.env_cron_secret = {
    ok: !!process.env.CRON_SECRET,
    detail: process.env.CRON_SECRET ? "present" : "missing",
  };
  checks.env_slack_signing_secret = {
    ok: !!process.env.SLACK_SIGNING_SECRET,
    detail: process.env.SLACK_SIGNING_SECRET ? "present" : "missing",
  };
  checks.env_slack_crm_webhook = {
    ok: !!(process.env.SLACK_CRM_WEBHOOK || process.env.SLACK_ALERT_WEBHOOK),
    detail: process.env.SLACK_CRM_WEBHOOK
      ? "SLACK_CRM_WEBHOOK"
      : process.env.SLACK_ALERT_WEBHOOK
        ? "fallback: SLACK_ALERT_WEBHOOK"
        : "missing",
  };
  checks.env_base_url = {
    ok: !!(process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL),
    detail: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "missing",
  };

  const ok = Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      checks,
      notes: [
        "Smoke endpoint is read-only and does not mutate CRM state.",
        "Use this alongside /api/cron/crm-stale-reminders and Slack interactivity tests.",
      ],
    },
    { status: ok ? 200 : 503 },
  );
}
