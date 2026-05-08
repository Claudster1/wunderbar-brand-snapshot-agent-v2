import { NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";
import { checkReportAccess, getUserEmailFromRequest } from "@/lib/reportAccess";

type Row = {
  Week: number;
  Channel: string;
  "Content Type": string;
  "Audience Segment": string;
  "Funnel Stage": string;
  "Message Pillar": string;
  "Asset / Topic": string;
  "Primary CTA": string;
  Owner: string;
  Status: string;
  "Due Date": string;
  "KPI Target": string;
  Result: string;
};

function dateLabel(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function buildRows({
  recommendations,
  messagePillars,
  startDate,
}: {
  recommendations: string[];
  messagePillars: string[];
  startDate: Date;
}): Row[] {
  const channels = ["Email", "Social", "SEO", "Website", "Sales", "PR"];
  const funnelStages = ["Problem-Aware", "Solution-Aware", "Product-Aware", "Customer"];
  const contentTypes = ["Email", "Post", "Article", "Landing Page", "Script", "Outline"];
  const rows: Row[] = [];

  for (let week = 1; week <= 13; week += 1) {
    const channel = channels[(week - 1) % channels.length];
    const pillar = messagePillars[(week - 1) % Math.max(messagePillars.length, 1)] ?? "Core Message";
    const recommendation =
      recommendations[week - 1] ??
      `Execute ${pillar} through ${channel} with a clear CTA and measurable outcome.`;

    rows.push({
      Week: week,
      Channel: channel,
      "Content Type": contentTypes[(week - 1) % contentTypes.length],
      "Audience Segment": "Primary Audience",
      "Funnel Stage": funnelStages[(week - 1) % funnelStages.length],
      "Message Pillar": pillar,
      "Asset / Topic": recommendation,
      "Primary CTA": "Book a strategy call",
      Owner: week <= 4 ? "Assign owner" : "",
      Status: "Not Started",
      "Due Date": dateLabel(addDays(startDate, week * 7)),
      "KPI Target": "Set KPI",
      Result: "",
    });
  }

  return rows;
}

/** Column order and widths for the activation schedule export. */
const ROW_KEYS: (keyof Row)[] = [
  "Week",
  "Channel",
  "Content Type",
  "Audience Segment",
  "Funnel Stage",
  "Message Pillar",
  "Asset / Topic",
  "Primary CTA",
  "Owner",
  "Status",
  "Due Date",
  "KPI Target",
  "Result",
];

const COLUMN_WIDTHS = [8, 12, 14, 18, 16, 18, 42, 18, 14, 12, 12, 14, 12];

export async function GET(req: Request) {
  const guard = apiGuard(req, {
    routeId: "results-activation-schedule",
    rateLimit: GENERAL_RATE_LIMIT,
  });
  if (!guard.passed) return guard.errorResponse;

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin client not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("brand_snapshot_reports")
    .select("report_id, company_name, user_email, recommendations, created_at, full_report, pillar_insights")
    .eq("report_id", reportId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const userEmail = getUserEmailFromRequest(req);
  const access = checkReportAccess(userEmail, (data as { user_email?: string }).user_email);
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const recommendationsRaw = (data as { recommendations?: unknown }).recommendations;
  const recommendations = Array.isArray(recommendationsRaw)
    ? recommendationsRaw.filter((item): item is string => typeof item === "string")
    : recommendationsRaw && typeof recommendationsRaw === "object"
      ? Object.values(recommendationsRaw).filter((item): item is string => typeof item === "string")
      : [];

  const answers = ((data as { full_report?: { answers?: unknown } }).full_report?.answers ??
    {}) as Record<string, unknown>;
  const messagePillars = toStringArray(answers.messagePillars);
  const startDate = new Date(
    typeof (data as { created_at?: string }).created_at === "string"
      ? (data as { created_at: string }).created_at
      : Date.now(),
  );

  const rows = buildRows({ recommendations, messagePillars, startDate });
  const headerRow = ROW_KEYS.map((k) => k);
  const dataRows = rows.map((r) => ROW_KEYS.map((k) => r[k]));
  const sheetData = [headerRow, ...dataRows];
  const output = writeXlsxFile(sheetData, {
    sheet: "Activation Schedule",
    columns: COLUMN_WIDTHS.map((width) => ({ width })),
  });
  const buffer = await output.toBuffer();

  const company = (data as { company_name?: string }).company_name || "brand";
  const safeCompany = company.replace(/[^a-z0-9-_]+/gi, "_");
  const filename = `${safeCompany}_activation_schedule.xlsx`;

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
