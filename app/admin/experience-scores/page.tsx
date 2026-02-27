"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Brand tokens ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const RED = "#EF4444";
const PURPLE = "#8B5CF6";

/* ─── Types ─── */
interface Overview {
  totalResponses: number;
  averageScore: number;
  netScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPct: number;
  passivePct: number;
  detractorPct: number;
}

interface TierRow {
  tier: string;
  label: string;
  count: number;
  averageScore: number;
  netScore: number;
  promoters: number;
  passives: number;
  detractors: number;
}

interface ResponseRow {
  id: string;
  report_id: string;
  user_email: string;
  product_tier: string;
  score: number;
  reason: string | null;
  created_at: string;
  category: "promoter" | "passive" | "detractor";
  tierLabel: string;
}

interface TestimonialRow {
  id: string;
  user_email: string;
  product_tier: string;
  experience_score: number | null;
  testimonial: string;
  display_name: string | null;
  company_name: string | null;
  role_title: string | null;
  permission_to_publish: boolean;
  case_study_interest: boolean;
  status: string;
  created_at: string;
  tierLabel: string;
}

interface TrendPoint {
  month: string;
  averageScore: number;
  netScore: number;
  count: number;
}

type TabId = "overview" | "responses" | "testimonials";

/* ─── Helpers ─── */
function categoryColor(cat: string): string {
  if (cat === "promoter") return GREEN;
  if (cat === "passive") return YELLOW;
  return RED;
}

function categoryBg(cat: string): string {
  if (cat === "promoter") return "#F0FDF4";
  if (cat === "passive") return "#FEFCE8";
  return "#FEF2F2";
}

function scoreColor(score: number): string {
  if (score >= 9) return GREEN;
  if (score >= 7) return YELLOW;
  return RED;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1]} ${y}`;
}

/* ═══════════════════════════════════════════ */
/*  MAIN PAGE                                  */
/* ═══════════════════════════════════════════ */
export default function ExperienceScoresDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [byTier, setByTier] = useState<TierRow[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);

  const fetchData = useCallback(
    async (currentTab: TabId) => {
      setLoading(true);
      try {
        const base = `/api/admin/experience-scores`;

        if (currentTab === "overview") {
          const [ovRes, tierRes, trendRes] = await Promise.all([
            fetch(`${base}?view=overview&days=${days}`),
            fetch(`${base}?view=by-tier&days=${days}`),
            fetch(`${base}?view=trend`),
          ]);

          if (ovRes.status === 401 || tierRes.status === 401 || trendRes.status === 401) {
            router.replace("/admin-login");
            return;
          }

          const ovJson = await ovRes.json();
          const tierJson = await tierRes.json();
          const trendJson = await trendRes.json();

          setOverview(ovJson.overview || null);
          setByTier(tierJson.byTier || []);
          setTrend(trendJson.trend || []);
        }

        if (currentTab === "responses") {
          const res = await fetch(`${base}?view=responses&days=${days}&limit=100`);
          if (res.status === 401) {
            router.replace("/admin-login");
            return;
          }
          const json = await res.json();
          setResponses(json.responses || []);
        }

        if (currentTab === "testimonials") {
          const res = await fetch(`${base}?view=testimonials&days=${days}&limit=50`);
          if (res.status === 401) {
            router.replace("/admin-login");
            return;
          }
          const json = await res.json();
          setTestimonials(json.testimonials || []);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    },
    [days, router],
  );

  useEffect(() => {
    fetchData(tab);
  }, [tab, days, fetchData]);

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
      <header
        style={{
          background: NAVY,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ color: WHITE, fontSize: 20, fontWeight: 700, margin: 0 }}>
            WunderBrand Experience Score™
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "2px 0 0" }}>
            Survey results dashboard
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              background: "rgba(255,255,255,0.12)",
              color: WHITE,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </header>

      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          gap: 0,
          background: WHITE,
          borderBottom: `1px solid ${BORDER}`,
          padding: "0 32px",
        }}
      >
        {(
          [
            { id: "overview" as TabId, label: "Overview" },
            { id: "responses" as TabId, label: "Responses" },
            { id: "testimonials" as TabId, label: "Testimonials" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? NAVY : SUB,
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? `3px solid ${BLUE}` : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
        {loading && (
          <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12, color: SUB }}>
            Loading…
          </span>
        )}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 80px" }}>
        {tab === "overview" && <OverviewTab overview={overview} byTier={byTier} trend={trend} />}
        {tab === "responses" && <ResponsesTab responses={responses} />}
        {tab === "testimonials" && <TestimonialsTab testimonials={testimonials} />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  OVERVIEW TAB                               */
/* ═══════════════════════════════════════════ */
function OverviewTab({
  overview,
  byTier,
  trend,
}: {
  overview: Overview | null;
  byTier: TierRow[];
  trend: TrendPoint[];
}) {
  if (!overview) {
    return <EmptyState message="No experience score data available for this period." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <KpiCard label="Total Responses" value={String(overview.totalResponses)} color={NAVY} />
        <KpiCard
          label="Average Score"
          value={overview.averageScore.toFixed(1)}
          sub="/10"
          color={scoreColor(overview.averageScore)}
        />
        <KpiCard
          label="Net Score"
          value={`${overview.netScore > 0 ? "+" : ""}${overview.netScore}`}
          color={overview.netScore >= 50 ? GREEN : overview.netScore >= 0 ? YELLOW : RED}
        />
        <KpiCard
          label="Promoters"
          value={`${overview.promoterPct}%`}
          sub={`(${overview.promoters})`}
          color={GREEN}
        />
      </div>

      {/* Category Breakdown */}
      <Card title="Category Breakdown">
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <CategoryPill label="Promoters (9–10)" count={overview.promoters} pct={overview.promoterPct} color={GREEN} />
          <CategoryPill label="Passives (7–8)" count={overview.passives} pct={overview.passivePct} color={YELLOW} />
          <CategoryPill label="Detractors (0–6)" count={overview.detractors} pct={overview.detractorPct} color={RED} />
        </div>
        <StackedBar
          segments={[
            { pct: overview.promoterPct, color: GREEN },
            { pct: overview.passivePct, color: YELLOW },
            { pct: overview.detractorPct, color: RED },
          ]}
        />
      </Card>

      {/* Score by Tier */}
      {byTier.length > 0 && (
        <Card title="Score by Product Tier">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {byTier.map((t) => (
              <TierCard key={t.tier} tier={t} />
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Trend */}
      {trend.length > 1 && (
        <Card title="Monthly Trend (6 months)">
          <TrendChart data={trend} />
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  RESPONSES TAB                              */
/* ═══════════════════════════════════════════ */
function ResponsesTab({ responses }: { responses: ResponseRow[] }) {
  if (responses.length === 0) {
    return <EmptyState message="No responses found for this period." />;
  }

  return (
    <Card title={`Recent Responses (${responses.length})`}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
              {["Date", "Email", "Tier", "Score", "Category", "Reason"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    fontWeight: 600,
                    color: NAVY,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: "10px 12px", color: SUB, whiteSpace: "nowrap" }}>{formatDate(r.created_at)}</td>
                <td style={{ padding: "10px 12px", color: NAVY, fontWeight: 500 }}>{r.user_email}</td>
                <td style={{ padding: "10px 12px", color: SUB }}>{r.tierLabel}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 28,
                      textAlign: "center",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 13,
                      color: WHITE,
                      background: scoreColor(r.score),
                    }}
                  >
                    {r.score}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      color: categoryColor(r.category),
                      background: categoryBg(r.category),
                    }}
                  >
                    {r.category}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: SUB,
                    maxWidth: 300,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={r.reason || ""}
                >
                  {r.reason || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════ */
/*  TESTIMONIALS TAB                           */
/* ═══════════════════════════════════════════ */
function TestimonialsTab({ testimonials }: { testimonials: TestimonialRow[] }) {
  if (testimonials.length === 0) {
    return <EmptyState message="No testimonials collected yet." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: SUB, margin: 0 }}>
        {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""} collected
      </p>
      {testimonials.map((t) => (
        <div
          key={t.id}
          style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: "20px 24px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <span style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}>
                {t.display_name || t.user_email}
              </span>
              {t.role_title && t.company_name && (
                <span style={{ color: SUB, fontSize: 12, marginLeft: 8 }}>
                  {t.role_title}, {t.company_name}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {t.experience_score != null && (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: WHITE,
                    background: scoreColor(t.experience_score),
                  }}
                >
                  {t.experience_score}/10
                </span>
              )}
              <StatusBadge status={t.status} />
            </div>
          </div>
          <blockquote
            style={{
              margin: 0,
              padding: "0 0 0 16px",
              borderLeft: `3px solid ${BLUE}`,
              color: NAVY,
              fontSize: 14,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &ldquo;{t.testimonial}&rdquo;
          </blockquote>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: SUB }}>
            <span>{t.tierLabel}</span>
            <span>{formatDate(t.created_at)}</span>
            {t.permission_to_publish && (
              <span style={{ color: GREEN, fontWeight: 600 }}>Publish OK</span>
            )}
            {t.case_study_interest && (
              <span style={{ color: PURPLE, fontWeight: 600 }}>Case Study Interest</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  REUSABLE COMPONENTS                        */
/* ═══════════════════════════════════════════ */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "20px 24px",
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>{title}</h2>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "20px 24px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 12, color: SUB, margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
        {value}
        {sub && <span style={{ fontSize: 14, fontWeight: 500, color: SUB }}>{sub}</span>}
      </p>
    </div>
  );
}

function CategoryPill({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>
        {label}: <strong>{pct}%</strong>{" "}
        <span style={{ color: SUB, fontWeight: 400 }}>({count})</span>
      </span>
    </div>
  );
}

function StackedBar({ segments }: { segments: Array<{ pct: number; color: string }> }) {
  return (
    <div
      style={{
        display: "flex",
        height: 24,
        borderRadius: 12,
        overflow: "hidden",
        background: LIGHT_BG,
      }}
    >
      {segments.map((s, i) =>
        s.pct > 0 ? (
          <div
            key={i}
            style={{
              width: `${s.pct}%`,
              background: s.color,
              transition: "width 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {s.pct >= 10 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: WHITE }}>{s.pct}%</span>
            )}
          </div>
        ) : null,
      )}
    </div>
  );
}

function TierCard({ tier }: { tier: TierRow }) {
  const total = tier.promoters + tier.passives + tier.detractors;
  return (
    <div
      style={{
        background: LIGHT_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>{tier.label}</p>
      <p style={{ fontSize: 11, color: SUB, margin: "0 0 12px" }}>{tier.count} responses</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: scoreColor(tier.averageScore), margin: 0 }}>
            {tier.averageScore.toFixed(1)}
          </p>
          <p style={{ fontSize: 10, color: SUB, margin: 0 }}>Avg Score</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: tier.netScore >= 50 ? GREEN : tier.netScore >= 0 ? YELLOW : RED,
              margin: 0,
            }}
          >
            {tier.netScore > 0 ? "+" : ""}
            {tier.netScore}
          </p>
          <p style={{ fontSize: 10, color: SUB, margin: 0 }}>Net Score</p>
        </div>
      </div>
      {total > 0 && (
        <StackedBar
          segments={[
            { pct: Math.round((tier.promoters / total) * 100), color: GREEN },
            { pct: Math.round((tier.passives / total) * 100), color: YELLOW },
            { pct: Math.round((tier.detractors / total) * 100), color: RED },
          ]}
        />
      )}
    </div>
  );
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return null;

  const maxScore = 10;
  const chartH = 180;
  const barW = Math.min(60, Math.floor(700 / data.length));

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: chartH + 40,
          padding: "0 4px",
        }}
      >
        {data.map((d) => {
          const h = (d.averageScore / maxScore) * chartH;
          return (
            <div
              key={d.month}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: barW,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(d.averageScore) }}>
                {d.averageScore.toFixed(1)}
              </span>
              <div
                style={{
                  width: barW - 8,
                  height: h,
                  borderRadius: "6px 6px 2px 2px",
                  background: `linear-gradient(180deg, ${scoreColor(d.averageScore)}dd, ${scoreColor(d.averageScore)}88)`,
                  transition: "height 0.3s ease",
                }}
              />
              <span style={{ fontSize: 10, color: SUB, whiteSpace: "nowrap" }}>{formatMonth(d.month)}</span>
              <span style={{ fontSize: 9, color: SUB }}>{d.count} resp</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#FEF3C7", text: YELLOW },
    approved: { bg: "#D1FAE5", text: GREEN },
    featured: { bg: "#EDE9FE", text: PURPLE },
    declined: { bg: "#FEE2E2", text: RED },
  };
  const c = colors[status] || { bg: LIGHT_BG, text: SUB };
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "capitalize",
        color: c.text,
        background: c.bg,
      }}
    >
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: SUB,
        fontSize: 14,
      }}
    >
      <p style={{ fontSize: 40, margin: "0 0 12px" }}>📊</p>
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
