"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#021859";
const WHITE = "#FFFFFF";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";

type OverviewPayload = {
  overview: {
    totals: {
      events24h: number;
      inbound24h: number;
      outbound24h: number;
      web24h: number;
      uniqueContacts30d: number;
      engagedAccounts30d: number;
    };
    pipeline: {
      inboundCreated30d: number;
      outboundTouches30d: number;
      webHighIntent30d: number;
      medianFirstResponseHours30d: number;
    };
    lockedSectionPerformance: {
      views: number;
      clicksTotal: number;
      bySection: Array<{
        section: string;
        clicks: number;
      }>;
    };
    humanAssistPerformance: {
      clicksTotal: number;
      resultsViews: number;
      bySource: Array<{
        source: string;
        clicks: number;
      }>;
    };
    consentAndSync: {
      consentSignals: {
        captured: number;
        smsOptIns: number;
        emailOptIns: number;
        dualOptIns: number;
      };
      acSync: {
        success: number;
        failed: number;
        failuresByEvent: Array<{
          eventType: string;
          failures: number;
        }>;
      };
    };
    ownerActivity: Array<{
      owner: string;
      total: number;
      inbound: number;
      outbound: number;
    }>;
    recent: Array<{
      id: string;
      source: string;
      event_type: string;
      direction: "inbound" | "outbound" | "neutral";
      channel: string;
      owner: string | null;
      account_key: string | null;
      user_email: string | null;
      occurred_at: string;
    }>;
  };
};

const EMPTY_OVERVIEW: OverviewPayload["overview"] = {
  totals: {
    events24h: 0,
    inbound24h: 0,
    outbound24h: 0,
    web24h: 0,
    uniqueContacts30d: 0,
    engagedAccounts30d: 0,
  },
  pipeline: {
    inboundCreated30d: 0,
    outboundTouches30d: 0,
    webHighIntent30d: 0,
    medianFirstResponseHours30d: 0,
  },
  lockedSectionPerformance: {
    views: 0,
    clicksTotal: 0,
    bySection: [],
  },
  humanAssistPerformance: {
    clicksTotal: 0,
    resultsViews: 0,
    bySource: [],
  },
  consentAndSync: {
    consentSignals: {
      captured: 0,
      smsOptIns: 0,
      emailOptIns: 0,
      dualOptIns: 0,
    },
    acSync: {
      success: 0,
      failed: 0,
      failuresByEvent: [],
    },
  },
  ownerActivity: [],
  recent: [],
};

function normalizeOverview(
  incoming: Partial<OverviewPayload["overview"]> | null | undefined,
): OverviewPayload["overview"] {
  return {
    ...EMPTY_OVERVIEW,
    ...incoming,
    totals: {
      ...EMPTY_OVERVIEW.totals,
      ...(incoming?.totals || {}),
    },
    pipeline: {
      ...EMPTY_OVERVIEW.pipeline,
      ...(incoming?.pipeline || {}),
    },
    lockedSectionPerformance: {
      ...EMPTY_OVERVIEW.lockedSectionPerformance,
      ...(incoming?.lockedSectionPerformance || {}),
      bySection: incoming?.lockedSectionPerformance?.bySection || [],
    },
    humanAssistPerformance: {
      ...EMPTY_OVERVIEW.humanAssistPerformance,
      ...(incoming?.humanAssistPerformance || {}),
      bySource: incoming?.humanAssistPerformance?.bySource || [],
    },
    consentAndSync: {
      ...EMPTY_OVERVIEW.consentAndSync,
      ...(incoming?.consentAndSync || {}),
      consentSignals: {
        ...EMPTY_OVERVIEW.consentAndSync.consentSignals,
        ...(incoming?.consentAndSync?.consentSignals || {}),
      },
      acSync: {
        ...EMPTY_OVERVIEW.consentAndSync.acSync,
        ...(incoming?.consentAndSync?.acSync || {}),
        failuresByEvent: incoming?.consentAndSync?.acSync?.failuresByEvent || [],
      },
    },
    ownerActivity: incoming?.ownerActivity || [],
    recent: incoming?.recent || [],
  };
}

function needsAutoRepair(incoming: Partial<OverviewPayload["overview"]> | null | undefined): boolean {
  if (!incoming) return true;
  if (!incoming.totals || !incoming.pipeline || !incoming.lockedSectionPerformance) return true;
  if (!incoming.humanAssistPerformance) return true;
  if (!incoming.consentAndSync || !incoming.consentAndSync.acSync || !incoming.consentAndSync.consentSignals) return true;
  if (!Array.isArray(incoming.recent) || !Array.isArray(incoming.ownerActivity)) return true;
  return false;
}

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const attemptedAutoRepairRef = useRef(false);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [provisioningConsent, setProvisioningConsent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<OverviewPayload["overview"] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/unified/overview?days=${days}`);
      if (res.status === 401) {
        router.replace("/admin-login");
        return;
      }
      const json = (await res.json().catch(() => ({}))) as Partial<OverviewPayload> & {
        error?: string;
      };
      if (!res.ok) {
        setLoadError(json.error || "Failed to load unified overview.");
        setData(EMPTY_OVERVIEW);
        return;
      }
      if (!json.overview) {
        setLoadError("Unified overview payload is missing.");
        setData(EMPTY_OVERVIEW);
        return;
      }
      setData(normalizeOverview(json.overview));

      if (needsAutoRepair(json.overview) && !attemptedAutoRepairRef.current) {
        attemptedAutoRepairRef.current = true;
        void fetch("/api/admin/unified/overview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days }),
        })
          .then(async (repairRes) => {
            if (!repairRes.ok) return;
            setToast("Dashboard auto-repaired. Refreshing data...");
            await loadOverview();
          })
          .catch(() => {
            // Non-blocking: page still renders from normalized fallback shape.
          });
      }
    } catch {
      setLoadError("Failed to load unified overview.");
      setData(EMPTY_OVERVIEW);
    } finally {
      setLoading(false);
    }
  }, [days, router]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const syncEvents = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/unified/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) {
        throw new Error("Sync failed");
      }
      const json = (await res.json()) as { synced: number };
      setToast(`Synced ${json.synced} events`);
      await loadOverview();
    } catch {
      setToast("Failed to sync events");
    } finally {
      setSyncing(false);
    }
  }, [days, loadOverview]);

  const provisionConsent = useCallback(async () => {
    setProvisioningConsent(true);
    try {
      const res = await fetch("/api/admin/ac/provision-consent", {
        method: "POST",
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        tags?: Array<{ ok: boolean }>;
        fields?: Array<{ ok: boolean }>;
      };
      if (!res.ok || !json.ok) {
        setToast(json.error || "Consent provisioning completed with issues");
        return;
      }
      const tagsCount = json.tags?.filter((x) => x.ok).length ?? 0;
      const fieldsCount = json.fields?.filter((x) => x.ok).length ?? 0;
      setToast(`Provisioned AC consent setup (${tagsCount} tags, ${fieldsCount} fields)`);
    } catch {
      setToast("Failed to provision AC consent setup");
    } finally {
      setProvisioningConsent(false);
    }
  }, []);

  const directionColor = useMemo<Record<string, string>>(
    () => ({ inbound: BLUE, outbound: GREEN, neutral: SUB }),
    [],
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FB", fontFamily: "'Lato', system-ui, sans-serif" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: NAVY,
            color: WHITE,
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ background: NAVY, color: WHITE, padding: "18px 24px" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Unified Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8BA3CF" }}>
          Holistic inbound, outbound, and web activity in one view.
        </p>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => void loadOverview()}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer" }}
          >
            Refresh
          </button>
          <button
            onClick={() => void syncEvents()}
            disabled={syncing}
            style={{ padding: "8px 10px", borderRadius: 8, border: "none", background: BLUE, color: WHITE, cursor: "pointer", fontWeight: 700 }}
          >
            {syncing ? "Syncing..." : "Sync Events"}
          </button>
          <button
            onClick={() => void provisionConsent()}
            disabled={provisioningConsent}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: NAVY, cursor: "pointer", fontWeight: 700 }}
            title="Create/verify required ActiveCampaign consent tags and fields"
          >
            {provisioningConsent ? "Provisioning..." : "Provision AC Consent"}
          </button>
        </div>

        {loading && <div style={{ padding: 24, color: SUB }}>Loading unified overview...</div>}
        {!loading && loadError && (
          <div style={{ padding: 14, marginBottom: 12, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: SUB }}>
            {loadError}
          </div>
        )}

        {!loading && data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 14 }}>
              <Stat title="Events (24h)" value={data.totals.events24h} color={NAVY} />
              <Stat title="Inbound (24h)" value={data.totals.inbound24h} color={BLUE} />
              <Stat title="Outbound (24h)" value={data.totals.outbound24h} color={GREEN} />
              <Stat title="Web (24h)" value={data.totals.web24h} color={YELLOW} />
              <Stat title="Unique Contacts (30d)" value={data.totals.uniqueContacts30d} color={NAVY} />
              <Stat title="Engaged Accounts (30d)" value={data.totals.engagedAccounts30d} color={NAVY} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
              <Stat title="Inbound Created (30d)" value={data.pipeline.inboundCreated30d} color={BLUE} />
              <Stat title="Outbound Touches (30d)" value={data.pipeline.outboundTouches30d} color={GREEN} />
              <Stat title="Web High Intent (30d)" value={data.pipeline.webHighIntent30d} color={YELLOW} />
              <Stat title="Human Assist Clicks" value={data.humanAssistPerformance.clicksTotal} color={BLUE} />
              <Stat title="Locked Preview Views" value={data.lockedSectionPerformance.views} color={NAVY} />
              <Stat title="Locked Section Clicks" value={data.lockedSectionPerformance.clicksTotal} color={BLUE} />
              <Stat title="Consent Signals (Range)" value={data.consentAndSync.consentSignals.captured} color={NAVY} />
              <Stat title="AC Sync Failures (Range)" value={data.consentAndSync.acSync.failed} color={data.consentAndSync.acSync.failed > 0 ? "#DC2626" : NAVY} />
              <Stat
                title="Median First Response (hrs)"
                value={Number(data.pipeline.medianFirstResponseHours30d || 0).toFixed(1)}
                color={NAVY}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 14, color: NAVY }}>Owner Activity</h2>
                {data.ownerActivity.length === 0 && <div style={{ color: SUB, fontSize: 12 }}>No owner activity in range.</div>}
                {data.ownerActivity.map((owner) => (
                  <div
                    key={owner.owner}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{owner.owner}</div>
                      <div style={{ fontSize: 11, color: SUB }}>
                        Inbound {owner.inbound} · Outbound {owner.outbound}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{owner.total}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 14, color: NAVY }}>Consent + AC Sync Health</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: SUB }}>
                    SMS opt-ins:{" "}
                    <strong style={{ color: NAVY }}>{data.consentAndSync.consentSignals.smsOptIns}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Email opt-ins:{" "}
                    <strong style={{ color: NAVY }}>{data.consentAndSync.consentSignals.emailOptIns}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Dual opt-ins:{" "}
                    <strong style={{ color: NAVY }}>{data.consentAndSync.consentSignals.dualOptIns}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    AC sync success:{" "}
                    <strong style={{ color: NAVY }}>{data.consentAndSync.acSync.success}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    AC sync failure rate:{" "}
                    <strong style={{ color: NAVY }}>
                      {data.consentAndSync.acSync.success + data.consentAndSync.acSync.failed > 0
                        ? `${Math.round(
                            (data.consentAndSync.acSync.failed /
                              (data.consentAndSync.acSync.success + data.consentAndSync.acSync.failed)) *
                              100,
                          )}%`
                        : "0%"}
                    </strong>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: SUB }}>
                  Metrics are based on CRM sync log records for the selected date range.
                </p>
                {data.consentAndSync.acSync.failuresByEvent.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: SUB, marginBottom: 6 }}>Top AC sync failures</div>
                    {data.consentAndSync.acSync.failuresByEvent.map((row) => (
                      <div
                        key={row.eventType}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 0",
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        <div style={{ fontSize: 12, color: NAVY }}>{row.eventType}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>{row.failures}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 14, color: NAVY }}>Locked Section Performance</h2>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: SUB }}>
                  CTR is calculated as section clicks divided by total locked preview views in the selected date range.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Overall CTR:{" "}
                    <strong style={{ color: NAVY }}>
                      {data.lockedSectionPerformance.views > 0
                        ? `${Math.round(
                            (data.lockedSectionPerformance.clicksTotal /
                              data.lockedSectionPerformance.views) *
                              100,
                          )}%`
                        : "0%"}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Top Section:{" "}
                    <strong style={{ color: NAVY }}>
                      {data.lockedSectionPerformance.bySection[0]
                        ? data.lockedSectionPerformance.bySection[0].section.replace(/_/g, " ")
                        : "n/a"}
                    </strong>
                  </div>
                </div>
                {data.lockedSectionPerformance.bySection.length === 0 && (
                  <div style={{ color: SUB, fontSize: 12 }}>No locked-section clicks yet in range.</div>
                )}
                {data.lockedSectionPerformance.bySection.map((row) => (
                  <div
                    key={row.section}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, textTransform: "capitalize" }}>
                        {row.section.replace(/_/g, " ")}
                      </div>
                      <div style={{ fontSize: 11, color: SUB }}>
                        CTR:{" "}
                        <strong style={{ color: NAVY }}>
                          {data.lockedSectionPerformance.views > 0
                            ? `${Math.round((row.clicks / data.lockedSectionPerformance.views) * 100)}%`
                            : "0%"}
                        </strong>
                        {" · "}
                        Share:{" "}
                        <strong style={{ color: NAVY }}>
                          {data.lockedSectionPerformance.clicksTotal > 0
                            ? `${Math.round((row.clicks / data.lockedSectionPerformance.clicksTotal) * 100)}%`
                            : "0%"}
                        </strong>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{row.clicks}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 14, color: NAVY }}>Human Assist Performance</h2>
                <p style={{ margin: "0 0 10px", fontSize: 11, color: SUB }}>
                  CTR is human assist clicks divided by total results views in the selected date range.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Results views:{" "}
                    <strong style={{ color: NAVY }}>{data.humanAssistPerformance.resultsViews}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Clicks:{" "}
                    <strong style={{ color: NAVY }}>{data.humanAssistPerformance.clicksTotal}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    CTR:{" "}
                    <strong style={{ color: NAVY }}>
                      {data.humanAssistPerformance.resultsViews > 0
                        ? `${Math.round(
                            (data.humanAssistPerformance.clicksTotal /
                              data.humanAssistPerformance.resultsViews) *
                              100,
                          )}%`
                        : "0%"}
                    </strong>
                  </div>
                  <div style={{ fontSize: 12, color: SUB }}>
                    Top source:{" "}
                    <strong style={{ color: NAVY }}>
                      {data.humanAssistPerformance.bySource[0]?.source || "n/a"}
                    </strong>
                  </div>
                </div>
                {data.humanAssistPerformance.bySource.length === 0 && (
                  <div style={{ color: SUB, fontSize: 12 }}>No human assist clicks yet in range.</div>
                )}
                {data.humanAssistPerformance.bySource.map((row) => (
                  <div
                    key={row.source}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{row.source}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{row.clicks}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: 14, color: NAVY }}>Recent Unified Activity</h2>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {data.recent.map((event) => (
                    <div key={event.id} style={{ borderLeft: `2px solid ${directionColor[event.direction] || SUB}`, paddingLeft: 8, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{event.event_type}</div>
                        <div style={{ fontSize: 11, color: SUB }}>{new Date(event.occurred_at).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 11, color: SUB }}>
                        {event.channel} · {event.direction} · {event.owner || "unassigned"}
                      </div>
                      <div style={{ fontSize: 11, color: SUB }}>
                        {event.user_email || event.account_key || "unknown contact"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: SUB, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 24, color, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}
