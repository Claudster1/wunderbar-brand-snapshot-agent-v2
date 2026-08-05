import type { PnLSummary } from "@/lib/admin/computePnL";

export function formatPnLSlackDigest(summary: PnLSummary, appBaseUrl: string): {
  text: string;
  blocks: Record<string, unknown>[];
} {
  const o = summary.overview;
  const money = (n: number | null | undefined, d = 2) =>
    n == null || Number.isNaN(n)
      ? "—"
      : `$${n.toLocaleString("en-US", {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        })}`;
  const pct = (n: number | null) =>
    n == null || Number.isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`;

  const productLines =
    summary.byProduct.length > 0
      ? summary.byProduct
          .slice(0, 6)
          .map((p) => `• *${p.sku}*: ${p.count} orders · ${money(p.revenueUsd)}`)
          .join("\n")
      : "_No paid purchases in this window._";

  const providerLines =
    summary.byProvider.length > 0
      ? summary.byProvider
          .slice(0, 5)
          .map((p) => `• *${p.key}*: ${money(p.costUsd, 4)} · ${p.calls} calls`)
          .join("\n")
      : "_No AI usage logged yet._";

  const header = `📊 *WunderBrand weekly P&L* (last ${summary.days} days)`;
  const body = [
    `*Revenue:* ${money(o.revenueUsd)}`,
    `*AI cost (est.):* ${money(o.aiCostUsd, 4)}`,
    `*Gross after AI:* ${money(o.grossAfterAiUsd, 4)}`,
    `*Free Snapshot completions:* ${o.freeSnapshotCompletions}`,
    `*Paid conversions:* ${o.paidConversions} (${pct(o.conversionRate)})`,
    `*AI $ / free Snapshot:* ${money(o.aiCostPerFreeCompletionUsd, 4)}`,
    `*AI $ / paid conversion:* ${money(o.aiCostPerPaidConversionUsd, 4)}`,
    "",
    "*Revenue by product*",
    productLines,
    "",
    "*AI spend by provider*",
    providerLines,
  ].join("\n");

  if (summary.migrationRequired) {
    return {
      text: `${header}\n⚠️ ${summary.message || "AI usage table missing."}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${header}\n⚠️ ${summary.message || "AI usage table missing."}`,
          },
        },
      ],
    };
  }

  return {
    text: `${header}\n${body}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `WunderBrand weekly P&L (${summary.days}d)` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: body },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "_AI $ is estimated from tokens × list rates — reconcile to vendor invoices._",
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Open Admin P&L" },
            url: `${appBaseUrl.replace(/\/$/, "")}/admin/pnl`,
          },
        ],
      },
    ],
  };
}
