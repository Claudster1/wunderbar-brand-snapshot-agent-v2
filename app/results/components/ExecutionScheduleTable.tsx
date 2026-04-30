type ExecutionScheduleRow = {
  week: number;
  channel: string;
  assetTopic: string;
  owner: string;
  status: "Not Started" | "In Progress" | "Done" | "Skipped";
  dueDate: string;
};

type Props = {
  recommendations: string[];
  messagePillars: string[];
  completionDate?: string | null;
};

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateLabel(date: Date): string {
  return date.toISOString().split("T")[0];
}

function buildRows({
  recommendations,
  messagePillars,
  completionDate,
}: Props): ExecutionScheduleRow[] {
  const baseDate = completionDate ? new Date(completionDate) : new Date();
  const channels = ["Email", "Social", "Website", "SEO", "Sales", "PR"];

  const rows: ExecutionScheduleRow[] = [];
  for (let week = 1; week <= 12; week += 1) {
    const recommendation =
      recommendations[week - 1] ??
      `Activate ${
        messagePillars[(week - 1) % Math.max(messagePillars.length, 1)] ?? "core message pillar"
      } through ${channels[(week - 1) % channels.length]} touchpoints.`;
    rows.push({
      week,
      channel: channels[(week - 1) % channels.length],
      assetTopic: recommendation,
      owner: week <= 4 ? "Assign owner" : "",
      status: "Not Started",
      dueDate: toDateLabel(addDays(baseDate, week * 7)),
    });
  }

  return rows;
}

export function ExecutionScheduleTable(props: Props) {
  const rows = buildRows(props);

  return (
    <section className="bs-card rounded-xl p-5 sm:p-6 border border-brand-border overflow-x-auto">
      <p className="text-xs font-bold tracking-[0.04em] text-brand-muted mb-2">
        Activation Schedule
      </p>
      <h3 className="bs-h3 mb-3">90-day implementation view</h3>
      <p className="bs-body-sm text-brand-muted mb-4">
        Condensed schedule view. Full schema (content type, audience segment, funnel stage, CTA, KPI,
        and result fields) is available in workbook editing flows.
      </p>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b border-brand-border">
            <th className="py-2 pr-4 font-semibold text-brand-navy">Week</th>
            <th className="py-2 pr-4 font-semibold text-brand-navy">Channel</th>
            <th className="py-2 pr-4 font-semibold text-brand-navy">Asset / Topic</th>
            <th className="py-2 pr-4 font-semibold text-brand-navy">Owner</th>
            <th className="py-2 pr-4 font-semibold text-brand-navy">Status</th>
            <th className="py-2 pr-0 font-semibold text-brand-navy">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`execution-week-${row.week}`} className="border-b border-brand-border/60 align-top">
              <td className="py-2 pr-4 text-brand-midnight">{row.week}</td>
              <td className="py-2 pr-4 text-brand-midnight">{row.channel}</td>
              <td className="py-2 pr-4 text-brand-midnight">{row.assetTopic}</td>
              <td className="py-2 pr-4 text-brand-muted">{row.owner || "—"}</td>
              <td className="py-2 pr-4 text-brand-muted">{row.status}</td>
              <td className="py-2 pr-0 text-brand-muted">{row.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
