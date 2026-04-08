"use client";

import { useCallback, useEffect, useState } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const GREEN = "#16A34A";
const AMBER = "#D97706";

type Payload = {
  source: string;
  minSampleSizeForPublicPeerStats: number;
  totalRows: number;
  byAudience: Record<string, number>;
  byRevenue: Record<string, number>;
  byGeo: Record<string, number>;
  byAudienceRevenue: Record<string, number>;
  tripleSegments: Array<{ key: string; n: number; publicReady: boolean }>;
  tripleSummary: {
    segmentCount: number;
    readyForPublicPeerStats: number;
    thinCohorts: number;
  };
  industryTop: Array<{ industry: string; n: number }>;
  warning?: string;
};

function sortEntries(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

export default function BenchmarkCohortsAdminPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/benchmark-cohorts", { credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error || `HTTP ${res.status}`);
        setData(null);
        return;
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const minN = data?.minSampleSizeForPublicPeerStats ?? 20;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 18px 48px" }}>
      <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
        Benchmark cohorts (internal)
      </h1>
      <p style={{ color: SUB, fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", maxWidth: 720 }}>
        Anonymized counts from <code style={{ fontSize: 13 }}>benchmark_data</code>. Use this to
        see when peer segments have enough volume to show percentiles publicly (current engine
        threshold: <strong>{minN}+</strong> assessments per segment). Not visible to customers.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          style={{
            background: BLUE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        {data?.source === "rpc" && (
          <span style={{ fontSize: 13, color: GREEN, fontWeight: 700, alignSelf: "center" }}>
            Full-table rollup (SQL)
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
            background: "#FEF2F2",
            color: "#991B1B",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {data?.warning && (
        <div
          style={{
            border: `1px solid ${AMBER}`,
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
            background: "#FFFBEB",
            color: "#92400E",
            fontSize: 14,
          }}
        >
          {data.warning}
        </div>
      )}

      {data && !loading && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatCard label="Total benchmark rows" value={data.totalRows} />
            <StatCard
              label={`Segments ≥ ${minN} (public-ready)`}
              value={data.tripleSummary.readyForPublicPeerStats}
              accent={GREEN}
            />
            <StatCard
              label="Thin segments (&lt; threshold)"
              value={data.tripleSummary.thinCohorts}
              accent={AMBER}
            />
            <StatCard label="Distinct triples (aud·rev·geo)" value={data.tripleSummary.segmentCount} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <KeyValueTable title="By audience" rows={sortEntries(data.byAudience)} />
            <KeyValueTable title="By revenue band" rows={sortEntries(data.byRevenue)} />
            <KeyValueTable title="By geographic scope" rows={sortEntries(data.byGeo)} />
            <KeyValueTable
              title="By audience · revenue"
              rows={sortEntries(data.byAudienceRevenue)}
            />
          </div>

          <h2 style={{ color: NAVY, fontSize: 16, fontWeight: 800, margin: "28px 0 10px" }}>
            Triple segments (audience · revenue · geo)
          </h2>
          <p style={{ color: SUB, fontSize: 13, margin: "0 0 12px" }}>
            Audience · revenue · geo combinations. Production peer queries also apply an industry
            filter (ILIKE), so segments can be <em>smaller</em> than <code>n</code> here when
            industry is narrow. <strong>Public-ready</strong> means {minN}+ rows in this triple
            slice.
          </p>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              overflow: "auto",
              maxHeight: 420,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F1F5F9", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: NAVY }}>Segment</th>
                  <th style={{ padding: "10px 12px", color: NAVY }}>n</th>
                  <th style={{ padding: "10px 12px", color: NAVY }}>Public-ready</th>
                </tr>
              </thead>
              <tbody>
                {data.tripleSegments.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: SUB }}>
                      No rows (empty table or migration not applied).
                    </td>
                  </tr>
                ) : (
                  data.tripleSegments.map((row) => (
                    <tr key={row.key} style={{ borderTop: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "8px 12px", color: NAVY }}>{row.key}</td>
                      <td style={{ padding: "8px 12px", fontVariantNumeric: "tabular-nums" }}>
                        {row.n}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        {row.publicReady ? (
                          <span style={{ color: GREEN, fontWeight: 700 }}>Yes</span>
                        ) : (
                          <span style={{ color: AMBER, fontWeight: 700 }}>Not yet</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 style={{ color: NAVY, fontSize: 16, fontWeight: 800, margin: "28px 0 10px" }}>
            Top industries (raw text buckets)
          </h2>
          <p style={{ color: SUB, fontSize: 13, margin: "0 0 12px" }}>
            Free-text <code>industry</code> is noisy; use for directional volume only. Tight peer
            matching still needs normalized industry tags later.
          </p>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              overflow: "auto",
              maxHeight: 320,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F1F5F9", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: NAVY }}>Industry (as stored)</th>
                  <th style={{ padding: "10px 12px", color: NAVY }}>n</th>
                </tr>
              </thead>
              <tbody>
                {data.industryTop.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: 16, color: SUB }}>
                      No data.
                    </td>
                  </tr>
                ) : (
                  data.industryTop.map((row) => (
                    <tr
                      key={`${row.industry}-${row.n}`}
                      style={{ borderTop: `1px solid ${BORDER}` }}
                    >
                      <td style={{ padding: "8px 12px", color: NAVY }}>{row.industry}</td>
                      <td style={{ padding: "8px 12px", fontVariantNumeric: "tabular-nums" }}>
                        {row.n}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #D6DFE8",
        borderRadius: 10,
        padding: "14px 16px",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: SUB, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || NAVY, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function KeyValueTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 12px", background: "#F1F5F9", fontWeight: 800, color: NAVY, fontSize: 14 }}>
        {title}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td style={{ padding: 12, color: SUB }}>No data</td>
            </tr>
          ) : (
            rows.map(([k, v]) => (
              <tr key={k} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: "8px 12px", color: NAVY }}>{k}</td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {v.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
