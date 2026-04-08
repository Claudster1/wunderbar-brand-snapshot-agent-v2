export type ExecutionScheduleRow = {
  week: number;
  channel: string;
  assetTopic: string;
  owner: string;
  status: "Not Started" | "In Progress" | "Done" | "Skipped";
  dueDate: string;
};

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateLabel(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function buildExecutionScheduleRows({
  recommendations,
  messagePillars,
  completionDate,
}: {
  recommendations: string[];
  messagePillars: string[];
  completionDate?: string | null;
}): ExecutionScheduleRow[] {
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
