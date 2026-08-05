"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";

type PnLResponse = {
  days: number;
  since: string;
  migrationRequired?: boolean;
  message?: string;
  overview: {
    revenueUsd: number;
    aiCostUsd: number;
    grossAfterAiUsd: number;
    aiCalls: number;
    inputTokens: number;
    outputTokens: number;
    freeSnapshotCompletions: number;
    paidConversions: number;
    conversionRate: number | null;
    aiCostPerFreeCompletionUsd: number | null;
    aiCostPerPaidConversionUsd: number | null;
    note?: string;
  };
  byProduct?: Array<{ sku: string; revenueUsd: number; count: number; avgUsd: number }>;
  byProvider?: Array<{ key: string; costUsd: number; calls: number; tokens: number }>;
  byUseCase?: Array<{ key: string; costUsd: number; calls: number; tokens: number }>;
  byModel?: Array<{ key: string; costUsd: number; calls: number; tokens: number }>;
};

function money(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export default function AdminPnLPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<PnLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pnl?days=${days}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const o = data?.overview;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, color: NAVY, fontSize: 28, fontWeight: 900 }}>P&amp;L / unit economics</h1>
          <p style={{ margin: "8px 0 0", color: SUB, fontSize: 14, maxWidth: 640 }}>
            Stripe revenue vs estimated AI spend, free Snapshot volume, and paid conversions.
            AI $ uses token logs × list rates — reconcile to vendor invoices for accounting.
          </p>
        </div>
        <label style={{ color: SUB, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          Window
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              border: "1px solid #D5DEEA",
              borderRadius: 8,
              padding: "8px 10px",
              color: NAVY,
              background: "#fff",
            }}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </div>

      {loading && <p style={{ color: SUB, marginTop: 24 }}>Loading…</p>}
      {error && (
        <p style={{ color: "#B91C1C", marginTop: 24, fontWeight: 600 }}>{error}</p>
      )}

      {data?.migrationRequired && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: "#FFF7ED",
            border: "1px solid #FDBA74",
            color: "#9A3412",
            fontSize: 14,
          }}
        >
          {data.message || "Apply migration_ai_usage_events.sql in Supabase to start logging AI spend."}
        </div>
      )}

      {o && !loading && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginTop: 24,
            }}
          >
            <Stat label="Revenue" value={money(o.revenueUsd)} />
            <Stat label="AI cost (est.)" value={money(o.aiCostUsd, 4)} />
            <Stat
              label="Gross after AI"
              value={money(o.grossAfterAiUsd, 4)}
              accent={o.grossAfterAiUsd >= 0 ? "#15803D" : "#B91C1C"}
            />
            <Stat label="Free completions" value={String(o.freeSnapshotCompletions)} />
            <Stat label="Paid conversions" value={String(o.paidConversions)} />
            <Stat label="Conv. rate" value={pct(o.conversionRate)} />
            <Stat label="AI $ / free Snapshot" value={money(o.aiCostPerFreeCompletionUsd, 4)} />
            <Stat label="AI $ / paid conversion" value={money(o.aiCostPerPaidConversionUsd, 4)} />
          </div>

          {o.note && (
            <p style={{ marginTop: 12, color: SUB, fontSize: 12 }}>{o.note}</p>
          )}

          <Section title="Revenue by product">
            <Table
              headers={["SKU", "Orders", "Revenue", "Avg order"]}
              rows={(data.byProduct || []).map((r) => [
                r.sku,
                String(r.count),
                money(r.revenueUsd),
                money(r.avgUsd),
              ])}
              empty="No paid purchases in this window."
            />
          </Section>

          <Section title="AI spend by provider">
            <Table
              headers={["Provider", "Calls", "Tokens", "Est. cost"]}
              rows={(data.byProvider || []).map((r) => [
                r.key,
                String(r.calls),
                r.tokens.toLocaleString(),
                money(r.costUsd, 4),
              ])}
              empty="No AI usage logged yet."
            />
          </Section>

          <Section title="AI spend by use case">
            <Table
              headers={["Use case", "Calls", "Tokens", "Est. cost"]}
              rows={(data.byUseCase || []).map((r) => [
                r.key,
                String(r.calls),
                r.tokens.toLocaleString(),
                money(r.costUsd, 4),
              ])}
              empty="No AI usage logged yet."
            />
          </Section>

          <Section title="AI spend by model">
            <Table
              headers={["Model", "Calls", "Tokens", "Est. cost"]}
              rows={(data.byModel || []).map((r) => [
                r.key,
                String(r.calls),
                r.tokens.toLocaleString(),
                money(r.costUsd, 4),
              ])}
              empty="No AI usage logged yet."
            />
          </Section>
        </>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2EAF4",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: accent || NAVY }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ margin: "0 0 12px", color: NAVY, fontSize: 18, fontWeight: 800 }}>{title}</h2>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p style={{ color: SUB, fontSize: 14 }}>{empty}</p>;
  }
  return (
    <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #E2EAF4", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  color: SUB,
                  borderBottom: "1px solid #E2EAF4",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #F0F4F8",
                    color: NAVY,
                    fontWeight: j === 0 ? 700 : 500,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${BLUE}, transparent)` }} />
    </div>
  );
}
