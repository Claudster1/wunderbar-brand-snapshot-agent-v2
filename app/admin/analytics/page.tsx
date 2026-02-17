"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Brand tokens (matches follow-ups dashboard) ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const RED = "#EF4444";

type TabId = "funnel" | "ai-traffic" | "attribution" | "events";

interface FunnelData {
  totalEvents: Record<string, number>;
  uniqueVisitors: Record<string, number>;
}

interface AiTrafficData {
  totalSessions: number;
  aiSessions: number;
  bySource: Record<string, number>;
  aiConversions: number;
  recentAiVisitors: Array<{
    ai_source: string;
    user_email: string | null;
    landing_page: string | null;
    created_at: string;
  }>;
}

interface AttributionData {
  totalSessions: number;
  topSources: Array<{
    source: string;
    count: number;
    withEmail: number;
    withReport: number;
  }>;
  byCampaign: Record<string, number>;
}

interface EventRow {
  id: string;
  event_name: string;
  event_category: string;
  user_email: string | null;
  anonymous_id: string | null;
  is_ai_referral: boolean;
  ai_source: string | null;
  utm_source: string | null;
  ab_test_id: string | null;
  ab_variant: string | null;
  page_path: string | null;
  created_at: string;
}

const FUNNEL_STAGES = [
  { key: "SNAPSHOT_STARTED", label: "Snapshot Started", color: BLUE },
  { key: "SNAPSHOT_COMPLETED", label: "Snapshot Completed", color: "#6366F1" },
  { key: "RESULTS_VIEWED", label: "Results Viewed", color: "#8B5CF6" },
  { key: "UPGRADE_CLICKED", label: "Upgrade Clicked", color: "#A855F7" },
  { key: "UPGRADE_NUDGE_CLICKED", label: "Nudge Clicked", color: YELLOW },
  { key: "PDF_DOWNLOADED", label: "PDF Downloaded", color: GREEN },
  { key: "BLUEPRINT_STARTED", label: "Blueprint Started", color: "#14B8A6" },
  { key: "BLUEPRINT_COMPLETED", label: "Blueprint Completed", color: "#059669" },
];

const EVENT_COLORS: Record<string, string> = {
  product: BLUE,
  engagement: "#6366F1",
  conversion: GREEN,
  system: SUB,
};

/* ═══════════════════════════════════════════ */
/*  MAIN PAGE                                  */
/* ═══════════════════════════════════════════ */
export default function AnalyticsDashboardPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<TabId>("funnel");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  // Data states
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [aiData, setAiData] = useState<AiTrafficData | null>(null);
  const [attrData, setAttrData] = useState<AttributionData | null>(null);
  const [eventsData, setEventsData] = useState<EventRow[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }
  }, []);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    [apiKey],
  );

  const fetchTab = useCallback(
    async (view: TabId) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/analytics?view=${view}&days=${days}&limit=200`,
          { headers: headers() },
        );
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem("admin_api_key");
          return;
        }
        const json = await res.json();
        if (view === "funnel") setFunnelData(json.funnel);
        if (view === "ai-traffic") setAiData(json.aiTraffic);
        if (view === "attribution") setAttrData(json.attribution);
        if (view === "events") setEventsData(json.events || []);
      } catch {
        /* toast could go here */
      } finally {
        setLoading(false);
      }
    },
    [days, headers],
  );

  useEffect(() => {
    if (authenticated) fetchTab(tab);
  }, [authenticated, tab, days, fetchTab]);

  const handleLogin = () => {
    sessionStorage.setItem("admin_api_key", apiKey);
    setAuthenticated(true);
  };

  /* ═══ LOGIN ═══ */
  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: LIGHT_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Lato', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: WHITE,
            borderRadius: 12,
            padding: "40px 36px",
            boxShadow: "0 8px 32px rgba(2,24,89,0.1)",
            maxWidth: 400,
            width: "100%",
            border: `1px solid ${BORDER}`,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: NAVY,
              margin: "0 0 6px",
              textAlign: "center",
            }}
          >
            Analytics Dashboard
          </h1>
          <p
            style={{
              fontSize: 13,
              color: SUB,
              textAlign: "center",
              margin: "0 0 24px",
            }}
          >
            Enter your admin API key to access
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API key"
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 14,
              border: `1.5px solid ${BORDER}`,
              borderRadius: 8,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 12,
              color: NAVY,
              fontFamily: "'SF Mono', Monaco, monospace",
            }}
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!apiKey.trim()}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 14,
              fontWeight: 700,
              background: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              cursor: apiKey.trim() ? "pointer" : "not-allowed",
              opacity: apiKey.trim() ? 1 : 0.5,
              fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  /* ═══ DASHBOARD ═══ */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: LIGHT_BG,
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: NAVY,
          color: WHITE,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Product Analytics
          </h1>
          <p style={{ fontSize: 13, color: "#8BA3CF", margin: 0 }}>
            First-party event log, funnel, AI traffic &amp; attribution
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Date range selector */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(255,255,255,0.1)",
              color: WHITE,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            <option value={7} style={{ color: NAVY }}>Last 7 days</option>
            <option value={14} style={{ color: NAVY }}>Last 14 days</option>
            <option value={30} style={{ color: NAVY }}>Last 30 days</option>
            <option value={60} style={{ color: NAVY }}>Last 60 days</option>
            <option value={90} style={{ color: NAVY }}>Last 90 days</option>
          </select>
          <button
            onClick={() => fetchTab(tab)}
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "rgba(255,255,255,0.1)",
              color: WHITE,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            Refresh
          </button>
          <a
            href="/admin/followups"
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "#8BA3CF",
              textDecoration: "none",
            }}
          >
            Follow-ups
          </a>
          <button
            onClick={() => {
              setAuthenticated(false);
              sessionStorage.removeItem("admin_api_key");
            }}
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "transparent",
              color: "#8BA3CF",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: WHITE,
          borderBottom: `1px solid ${BORDER}`,
          padding: "0 24px",
          overflowX: "auto",
        }}
      >
        {(
          [
            { key: "funnel" as const, label: "Funnel" },
            { key: "ai-traffic" as const, label: "AI Traffic" },
            { key: "attribution" as const, label: "Attribution" },
            { key: "events" as const, label: "Event Log" },
          ] as const
        ).map(({ key, label }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? `3px solid ${BLUE}`
                  : "3px solid transparent",
                color: isActive ? NAVY : SUB,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontFamily: "'Lato', system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: SUB,
              fontSize: 14,
            }}
          >
            Loading...
          </div>
        )}

        {!loading && tab === "funnel" && funnelData && (
          <FunnelView data={funnelData} />
        )}
        {!loading && tab === "ai-traffic" && aiData && (
          <AiTrafficView data={aiData} />
        )}
        {!loading && tab === "attribution" && attrData && (
          <AttributionView data={attrData} />
        )}
        {!loading && tab === "events" && (
          <EventLogView events={eventsData} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  FUNNEL VIEW                                */
/* ═══════════════════════════════════════════ */
function FunnelView({ data }: { data: FunnelData }) {
  const maxEvents = Math.max(...Object.values(data.totalEvents), 1);
  const maxUnique = Math.max(...Object.values(data.uniqueVisitors), 1);

  return (
    <div>
      <SectionTitle>Product Funnel</SectionTitle>
      <p style={{ fontSize: 13, color: SUB, margin: "0 0 20px" }}>
        Each stage shows total events and unique visitors.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {FUNNEL_STAGES.map((stage, i) => {
          const total = data.totalEvents[stage.key] || 0;
          const unique = data.uniqueVisitors[stage.key] || 0;
          const prevUnique =
            i > 0
              ? data.uniqueVisitors[FUNNEL_STAGES[i - 1].key] || 0
              : 0;
          const dropoff =
            i > 0 && prevUnique > 0
              ? Math.round(((prevUnique - unique) / prevUnique) * 100)
              : null;

          return (
            <div
              key={stage.key}
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Stage number */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: stage.color,
                  color: WHITE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* Label + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: NAVY }}
                  >
                    {stage.label}
                  </span>
                  <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                    <span style={{ color: SUB }}>
                      <strong style={{ color: NAVY }}>{total}</strong> events
                    </span>
                    <span style={{ color: SUB }}>
                      <strong style={{ color: NAVY }}>{unique}</strong> unique
                    </span>
                    {dropoff !== null && (
                      <span
                        style={{
                          color: dropoff > 50 ? RED : dropoff > 30 ? YELLOW : GREEN,
                          fontWeight: 600,
                        }}
                      >
                        {dropoff}% drop
                      </span>
                    )}
                  </div>
                </div>

                {/* Total events bar */}
                <div
                  style={{
                    height: 6,
                    background: `${BORDER}60`,
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(total / maxEvents) * 100}%`,
                      background: stage.color,
                      borderRadius: 3,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {/* Unique visitors bar (lighter) */}
                <div
                  style={{
                    height: 4,
                    background: `${BORDER}40`,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(unique / maxUnique) * 100}%`,
                      background: `${stage.color}80`,
                      borderRadius: 2,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  AI TRAFFIC VIEW                            */
/* ═══════════════════════════════════════════ */
function AiTrafficView({ data }: { data: AiTrafficData }) {
  const aiPct =
    data.totalSessions > 0
      ? ((data.aiSessions / data.totalSessions) * 100).toFixed(1)
      : "0";

  const sourceEntries = Object.entries(data.bySource).sort(
    (a, b) => b[1] - a[1],
  );

  const SOURCE_LABELS: Record<string, string> = {
    chatgpt: "ChatGPT",
    perplexity: "Perplexity",
    gemini: "Gemini",
    claude: "Claude",
    copilot: "Copilot",
    you: "You.com",
    poe: "Poe",
    phind: "Phind",
  };

  return (
    <div>
      <SectionTitle>AI Referral Traffic</SectionTitle>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Sessions" value={data.totalSessions} />
        <StatCard label="AI Sessions" value={data.aiSessions} accent={BLUE} />
        <StatCard label="AI Share" value={`${aiPct}%`} accent="#6366F1" />
        <StatCard label="AI Conversions" value={data.aiConversions} accent={GREEN} />
      </div>

      {/* By source */}
      {sourceEntries.length > 0 && (
        <>
          <SubTitle>By Source</SubTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {sourceEntries.map(([src, count]) => (
              <div
                key={src}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 4,
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: SUB,
                  }}
                >
                  {SOURCE_LABELS[src] || src}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent AI visitors */}
      {data.recentAiVisitors.length > 0 && (
        <>
          <SubTitle>Recent AI Visitors</SubTitle>
          <TableWrapper>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Source</Th>
                  <Th>Landing Page</Th>
                  <Th>Email</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentAiVisitors.map((v, i) => (
                  <tr key={i}>
                    <Td>
                      <Badge color={BLUE}>
                        {SOURCE_LABELS[v.ai_source] || v.ai_source}
                      </Badge>
                    </Td>
                    <Td mono>{v.landing_page || "—"}</Td>
                    <Td>{v.user_email || "—"}</Td>
                    <Td>
                      {new Date(v.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </>
      )}

      {data.aiSessions === 0 && (
        <EmptyState message="No AI referral traffic detected yet. As visitors arrive from ChatGPT, Perplexity, Claude, etc., they'll appear here." />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  ATTRIBUTION VIEW                           */
/* ═══════════════════════════════════════════ */
function AttributionView({ data }: { data: AttributionData }) {
  const campaignEntries = Object.entries(data.byCampaign)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return (
    <div>
      <SectionTitle>Traffic Attribution</SectionTitle>

      <StatCard
        label="Total Tracked Sessions"
        value={data.totalSessions}
        style={{ marginBottom: 20, maxWidth: 220 }}
      />

      {/* Top sources table */}
      {data.topSources.length > 0 && (
        <>
          <SubTitle>Top Sources</SubTitle>
          <TableWrapper>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Source</Th>
                  <Th align="right">Sessions</Th>
                  <Th align="right">With Email</Th>
                  <Th align="right">With Report</Th>
                  <Th align="right">Conversion</Th>
                </tr>
              </thead>
              <tbody>
                {data.topSources.map((row) => {
                  const convPct =
                    row.count > 0
                      ? Math.round((row.withReport / row.count) * 100)
                      : 0;
                  return (
                    <tr key={row.source}>
                      <Td bold>{row.source}</Td>
                      <Td align="right">{row.count}</Td>
                      <Td align="right">{row.withEmail}</Td>
                      <Td align="right">{row.withReport}</Td>
                      <Td align="right">
                        <span
                          style={{
                            color:
                              convPct > 20
                                ? GREEN
                                : convPct > 5
                                  ? YELLOW
                                  : SUB,
                            fontWeight: 600,
                          }}
                        >
                          {convPct}%
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrapper>
        </>
      )}

      {/* UTM campaigns */}
      {campaignEntries.length > 0 && (
        <>
          <SubTitle style={{ marginTop: 28 }}>UTM Campaigns</SubTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            {campaignEntries.map(([campaign, count]) => (
              <div
                key={campaign}
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 2,
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: SUB,
                    fontWeight: 500,
                    wordBreak: "break-all",
                  }}
                >
                  {campaign}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data.topSources.length === 0 && (
        <EmptyState message="No attribution data yet. As visitors arrive with UTM parameters or from external referrers, sources will appear here." />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  EVENT LOG VIEW                             */
/* ═══════════════════════════════════════════ */
function EventLogView({ events }: { events: EventRow[] }) {
  return (
    <div>
      <SectionTitle>
        Event Log{" "}
        <span style={{ fontSize: 13, fontWeight: 400, color: SUB }}>
          ({events.length} events)
        </span>
      </SectionTitle>

      {events.length === 0 && (
        <EmptyState message="No events recorded yet. Events will appear here as users interact with the product." />
      )}

      {events.length > 0 && (
        <TableWrapper>
          <table style={tableStyle}>
            <thead>
              <tr>
                <Th>Event</Th>
                <Th>Category</Th>
                <Th>User</Th>
                <Th>Source</Th>
                <Th>Page</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <Td bold>{e.event_name}</Td>
                  <Td>
                    <Badge color={EVENT_COLORS[e.event_category] || SUB}>
                      {e.event_category}
                    </Badge>
                  </Td>
                  <Td>{e.user_email || e.anonymous_id?.slice(0, 12) || "—"}</Td>
                  <Td>
                    {e.is_ai_referral ? (
                      <Badge color="#6366F1">{e.ai_source || "AI"}</Badge>
                    ) : e.utm_source ? (
                      <span style={{ fontSize: 12, color: SUB }}>
                        {e.utm_source}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td mono>{e.page_path || "—"}</Td>
                  <Td>
                    {new Date(e.created_at).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  SHARED UI COMPONENTS                       */
/* ═══════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 17,
        fontWeight: 700,
        color: NAVY,
        margin: "0 0 12px",
      }}
    >
      {children}
    </h2>
  );
}

function SubTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <h3
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: SUB,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        margin: "0 0 10px",
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

function StatCard({
  label,
  value,
  accent,
  style,
}: {
  label: string;
  value: number | string;
  accent?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "16px 18px",
        borderLeft: accent ? `4px solid ${accent}` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: accent || NAVY,
          marginBottom: 2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: SUB, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        background: `${color}15`,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        background: WHITE,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ fontSize: 14, color: SUB, lineHeight: 1.6 }}>
        {message}
      </div>
    </div>
  );
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      style={{
        textAlign: align || "left",
        padding: "10px 14px",
        fontSize: 11,
        fontWeight: 700,
        color: SUB,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: `1px solid ${BORDER}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  bold,
  mono,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: align || "left",
        padding: "10px 14px",
        color: bold ? NAVY : SUB,
        fontWeight: bold ? 600 : 400,
        borderBottom: `1px solid ${BORDER}20`,
        fontFamily: mono ? "'SF Mono', Monaco, monospace" : "inherit",
        fontSize: mono ? 11 : 13,
        whiteSpace: "nowrap",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </td>
  );
}
