"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";
import { ShareButton } from "@/components/share/ShareButton";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const PURPLE = "#6D28D9";

type HistoryItem = {
  id: string;
  businessName: string;
  brandAlignmentScore: number;
  primaryPillar: string | null;
  createdAt: string;
  tier: "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus";
  completed: boolean;
  pdfUrl: string;
  reportUrl: string;
};

type BrandSummary = {
  brandName: string;
  latestScore: number;
  reportCount: number;
  tiers: Set<string>;
  hasSnapshotPlus: boolean;
  hasBlueprint: boolean;
  hasBlueprintPlus: boolean;
};

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#4ADE80";
  if (score >= 40) return "#EAB308";
  if (score >= 20) return "#F97316";
  return "#EF4444";
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  snapshot: { label: "Snapshot", color: "#5A6B7E", bg: "#F0F2F5" },
  snapshot_plus: { label: "Snapshot+", color: "#07B0F2", bg: "#E8F7FE" },
  blueprint: { label: "Blueprint", color: "#021859", bg: "#E6EAF2" },
  blueprint_plus: { label: "Blueprint+", color: "#6D28D9", bg: "#EDE9FE" },
};

function TierBadge({ tier }: { tier: string }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.snapshot;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        color: config.color,
        background: config.bg,
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}

type Deliverable = {
  type: string;
  label: string;
  description: string;
  audience: string;
  pages: string;
};

const BLUEPRINT_DELIVERABLES: Deliverable[] = [
  { type: "complete", label: "Complete WunderBrand Blueprint\u2122", description: "Full brand operating system", audience: "Everyone", pages: "60\u201380 pages" },
  { type: "executive", label: "Executive Summary", description: "Score, pillars, priorities, and top actions", audience: "Leadership", pages: "2\u20134 pages" },
  { type: "messaging", label: "Brand Messaging Playbook", description: "Messaging pillars, content pillars, taglines, tone guide", audience: "Marketing", pages: "10\u201315 pages" },
  { type: "prompts", label: "AI Prompt Library", description: "Custom prompts calibrated to your brand", audience: "AI Users", pages: "12\u201316 pages" },
];

const BLUEPRINT_PLUS_DELIVERABLES: Deliverable[] = [
  ...BLUEPRINT_DELIVERABLES,
  { type: "activation", label: "90-Day Activation Plan", description: "Week-by-week roadmap, KPIs, guardrails", audience: "Implementation", pages: "12\u201318 pages" },
  { type: "digital", label: "Digital Marketing Strategy", description: "Journey, SEO/AEO, email, social, content calendar", audience: "Digital Marketing", pages: "18\u201324 pages" },
  { type: "competitive", label: "Competitive Intelligence Brief", description: "Positioning, trade-offs, pricing, sales scripts", audience: "Sales & BD", pages: "14\u201318 pages" },
  { type: "standards", label: "Brand Standards Guide", description: "Logo, visual identity, writing rules, governance", audience: "Designers & Agencies", pages: "20\u201330 pages" },
];

function getDeliverables(tier: string): Deliverable[] {
  if (tier === "blueprint_plus") return BLUEPRINT_PLUS_DELIVERABLES;
  if (tier === "blueprint") return BLUEPRINT_DELIVERABLES;
  return [];
}

function DeliverableRow({ d, reportId, tier }: { d: Deliverable; reportId: string; tier: string }) {
  const apiTier = tier === "blueprint_plus" ? "blueprint-plus" : "blueprint";
  const url = `/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=${d.type}&tier=${apiTier}`;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 6,
        background: "#FAFBFF",
        border: `1px solid ${BORDER}`,
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 0%", minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, wordBreak: "break-word" }}>{d.label}</div>
        <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>
          {d.pages}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <ShareButton
          reportId={reportId}
          documentType={d.type}
          tier={tier}
          label={d.label}
          variant="text"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 12px",
            borderRadius: 5,
            border: `1px solid ${BORDER}`,
            background: WHITE,
            color: NAVY,
            fontWeight: 600,
            fontSize: 12,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13 }}>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          PDF
        </a>
      </div>
    </div>
  );
}

function AccessBadges({ summary }: { summary: BrandSummary }) {
  const badges: { label: string; active: boolean }[] = [
    { label: "Snapshot+", active: summary.hasSnapshotPlus },
    { label: "Blueprint", active: summary.hasBlueprint },
    { label: "Blueprint+", active: summary.hasBlueprintPlus },
  ];
  const activeBadges = badges.filter((b) => b.active);
  if (activeBadges.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
      {activeBadges.map((b) => (
        <span
          key={b.label}
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 3,
            background: "#E8F7FE",
            color: BLUE,
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

function ReportCard({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const color = scoreColor(item.brandAlignmentScore);
  const deliverables = getDeliverables(item.tier);
  const hasDeliverables = deliverables.length > 0;

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "16px 16px",
        background: WHITE,
        transition: "box-shadow 0.2s ease",
      }}
      className="report-card"
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: "1 1 0%", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: NAVY, wordBreak: "break-word" }}>
              {item.businessName}
            </span>
            <TierBadge tier={item.tier} />
            {hasDeliverables && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: PURPLE,
                  background: "#F0EAFF",
                  padding: "2px 8px",
                  borderRadius: 10,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                {deliverables.length} deliverables
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13, color: SUB }}>
            <span>
              WunderBrand Score\u2122:{" "}
              <strong style={{ color }}>{item.brandAlignmentScore}</strong>
            </span>
            {item.primaryPillar && (
              <span>
                Primary focus: <strong style={{ color: NAVY }}>{item.primaryPillar}</strong>
              </span>
            )}
            {item.createdAt && (
              <span>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, width: "auto" }} className="report-card-actions">
          <ShareButton
            reportId={item.id}
            tier={item.tier}
            label={`${item.businessName} — ${TIER_CONFIG[item.tier]?.label || "Report"}`}
          />
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Download PDF"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 6,
              border: `1.5px solid ${BORDER}`,
              background: WHITE,
              color: SUB,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href={item.reportUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 6,
              border: `1.5px solid ${BLUE}`,
              background: `${BLUE}08`,
              color: BLUE,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            View Report \u2192
          </a>
        </div>
      </div>

      {/* Expandable deliverables panel for Blueprint / Blueprint+ */}
      {hasDeliverables && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${expanded ? PURPLE : BORDER}`,
              background: expanded ? "#F0EAFF" : "#FAFBFF",
              color: expanded ? PURPLE : SUB,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{
                width: 14,
                height: 14,
                transition: "transform 0.2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {expanded ? "Hide" : "View"} deliverables ({deliverables.length})
          </button>

          {expanded && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                paddingLeft: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Included Deliverables
                </span>
                <span style={{ fontSize: 11, color: SUB }}>
                  {item.tier === "blueprint_plus" ? "Blueprint+\u2122" : "Blueprint\u2122"} package
                </span>
              </div>
              {deliverables.map((d) => (
                <DeliverableRow key={d.type} d={d} reportId={item.id} tier={item.tier} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const email = getPersistedEmail();

  const fetchHistory = useCallback((emailAddr: string, signal?: AbortSignal) => {
    fetch(`/api/history?email=${encodeURIComponent(emailAddr)}`, { signal })
      .then((res) => res.json())
      .then((data) => {
        if (signal?.aborted) return;
        setHistory(data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (signal?.aborted) return;
        console.error("[DashboardHistory] Error:", err);
        setError("We couldn\u2019t load your reports. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetchHistory(email, controller.signal);
    return () => controller.abort();
  }, [email, fetchHistory]);

  // Derive brand summaries from history
  const brandSummaries = useMemo(() => {
    const map = new Map<string, BrandSummary>();
    for (const item of history) {
      const key = item.businessName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          brandName: item.businessName,
          latestScore: item.brandAlignmentScore,
          reportCount: 0,
          tiers: new Set(),
          hasSnapshotPlus: false,
          hasBlueprint: false,
          hasBlueprintPlus: false,
        });
      }
      const summary = map.get(key)!;
      summary.reportCount++;
      summary.tiers.add(item.tier);
      if (item.tier === "snapshot_plus") summary.hasSnapshotPlus = true;
      if (item.tier === "blueprint") { summary.hasBlueprint = true; summary.hasSnapshotPlus = true; }
      if (item.tier === "blueprint_plus") { summary.hasBlueprintPlus = true; summary.hasBlueprint = true; summary.hasSnapshotPlus = true; }
      // Keep the latest score (history is sorted by date desc)
      if (summary.reportCount === 1) summary.latestScore = item.brandAlignmentScore;
    }
    return Array.from(map.values()).sort((a, b) => b.reportCount - a.reportCount);
  }, [history]);

  const hasMultipleBrands = brandSummaries.length > 1;

  const filtered = useMemo(() => {
    let items = history;
    if (activeBrand) {
      items = items.filter((item) => item.businessName.toLowerCase() === activeBrand.toLowerCase());
    }
    if (filterTier !== "all") {
      items = items.filter((item) => item.tier === filterTier);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.businessName.toLowerCase().includes(q) ||
          (item.primaryPillar?.toLowerCase().includes(q) ?? false)
      );
    }
    return items;
  }, [history, activeBrand, filterTier, searchQuery]);

  const tierCounts = useMemo(() => {
    const source = activeBrand
      ? history.filter((item) => item.businessName.toLowerCase() === activeBrand.toLowerCase())
      : history;
    const counts: Record<string, number> = { all: source.length };
    for (const item of source) {
      counts[item.tier] = (counts[item.tier] || 0) + 1;
    }
    return counts;
  }, [history, activeBrand]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: `3px solid ${BORDER}`, borderTopColor: BLUE,
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 15, color: SUB, fontFamily: "'Lato', sans-serif" }}>Loading your reports...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", fontFamily: "'Lato', sans-serif" }}>
        <p style={{ fontSize: 15, color: "#991B1B", marginBottom: 16 }}>{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            if (email) fetchHistory(email);
          }}
          style={{
            padding: "8px 20px", borderRadius: 6,
            background: BLUE, color: WHITE, border: "none",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!email || history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px", fontFamily: "'Lato', sans-serif" }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `${BLUE}10`, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke={BLUE} strokeWidth="2" />
            <path d="M9 9h6M9 13h4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
          {!email ? "No reports yet" : "No completed reports"}
        </h2>
        <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px", lineHeight: 1.6 }}>
          Complete a WunderBrand Snapshot\u2122 diagnostic to see your reports and deliverables here.
        </p>
        <a
          href="/brand-snapshot"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 48, padding: "0 24px", borderRadius: 6,
            background: BLUE, color: WHITE, fontWeight: 700, fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start a WunderBrand Snapshot\u2122
        </a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Brand switcher — only shows when user has multiple brands */}
      {hasMultipleBrands && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: SUB,
              marginBottom: 10,
            }}
          >
            Your brands
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveBrand(null)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: !activeBrand ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                background: !activeBrand ? `${BLUE}06` : WHITE,
                color: !activeBrand ? BLUE : NAVY,
                fontWeight: !activeBrand ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              All brands
              <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 12 }}>
                ({history.length})
              </span>
            </button>
            {brandSummaries.map((summary) => {
              const isActive = activeBrand?.toLowerCase() === summary.brandName.toLowerCase();
              return (
                <button
                  key={summary.brandName}
                  onClick={() => setActiveBrand(isActive ? null : summary.brandName)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: isActive ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                    background: isActive ? `${BLUE}06` : WHITE,
                    color: isActive ? BLUE : NAVY,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{summary.brandName}</span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: scoreColor(summary.latestScore),
                      }}
                    >
                      {summary.latestScore}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>
                    {summary.reportCount} report{summary.reportCount !== 1 ? "s" : ""}
                  </div>
                  <AccessBadges summary={summary} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and tier filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 100%", minWidth: 0, position: "relative" }}>
          <input
            type="text"
            placeholder={activeBrand ? `Search ${activeBrand} reports...` : "Search by brand or pillar..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              fontSize: 16,
              color: NAVY,
              background: WHITE,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <svg
            viewBox="0 0 20 20"
            fill={SUB}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
            }}
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
          {[
            { key: "all", label: "All" },
            { key: "snapshot", label: "Snapshot" },
            { key: "snapshot_plus", label: "Snapshot+" },
            { key: "blueprint", label: "Blueprint" },
            { key: "blueprint_plus", label: "Blueprint+" },
          ]
            .filter((t) => (tierCounts[t.key] ?? 0) > 0 || t.key === "all")
            .map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterTier(t.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: filterTier === t.key ? `1.5px solid ${BLUE}` : `1px solid ${BORDER}`,
                  background: filterTier === t.key ? `${BLUE}08` : WHITE,
                  color: filterTier === t.key ? BLUE : SUB,
                  fontWeight: filterTier === t.key ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
                {(tierCounts[t.key] ?? 0) > 0 && (
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>({tierCounts[t.key]})</span>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Active brand header */}
      {activeBrand && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: `${BLUE}04`,
            border: `1px solid ${BLUE}15`,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{activeBrand}</span>
            <span style={{ fontSize: 13, color: SUB }}>
              {filtered.length} report{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => setActiveBrand(null)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: `1px solid ${BORDER}`,
              background: WHITE,
              color: SUB,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Show all brands
          </button>
        </div>
      )}

      {/* Results count for search */}
      {searchQuery && (
        <p style={{ fontSize: 13, color: SUB, marginBottom: 12 }}>
          {filtered.length} report{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Report cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((item) => (
          <ReportCard key={`${item.tier}-${item.id}`} item={item} />
        ))}
      </div>

      {filtered.length === 0 && history.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px 24px", color: SUB, fontSize: 14 }}>
          No reports match your current filters. Try a different search term or clear the filter.
        </div>
      )}
    </div>
  );
}
