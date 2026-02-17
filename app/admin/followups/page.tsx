"use client";

import { useState, useEffect, useCallback } from "react";

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

/* ─── Types ─── */
interface Followup {
  id: string;
  contact_email: string;
  contact_name: string | null;
  session_type: string;
  report_id: string | null;
  product_tier: string | null;
  transcript_text: string;
  transcript_summary: string | null;
  transcript_source: string | null;
  generated_subject: string | null;
  generated_body: string | null;
  generated_action_items: ActionItem[] | null;
  generated_next_steps: NextStep[] | null;
  generated_product_recommendations: ProductRec[] | null;
  status: string;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface ActionItem {
  title: string;
  description: string;
  owner: string;
  priority: string;
  timeline?: string;
  pillar?: string;
}

interface NextStep {
  step: string;
  description: string;
  timeline: string;
  resources?: string[];
}

interface ProductRec {
  product: string;
  reason: string;
  url: string;
}

type StatusFilter = "pending_review" | "approved" | "sent" | "rejected" | "all";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: "Pending Review", color: YELLOW, bg: "#FEF9C3" },
  approved: { label: "Approved", color: BLUE, bg: "#E0F2FE" },
  sent: { label: "Sent", color: GREEN, bg: "#DCFCE7" },
  rejected: { label: "Rejected", color: RED, bg: "#FEE2E2" },
};

const SESSION_LABELS: Record<string, string> = {
  talk_to_expert: "Talk to an Expert Session",
  activation_session: "Strategy Activation Session",
};

/* ─── Main Page ─── */
export default function FollowupReviewPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending_review");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Load key from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }), [apiKey]);

  // Fetch follow-ups
  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/followups?status=${statusFilter}&limit=100`, {
        headers: headers(),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem("admin_api_key");
        return;
      }
      const data = await res.json();
      setFollowups(data.followups || []);
    } catch {
      setToast("Failed to fetch follow-ups");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, headers]);

  // Fetch counts for all statuses
  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ["pending_review", "approved", "sent", "rejected"];
      const results = await Promise.all(
        statuses.map(async (s) => {
          const res = await fetch(`/api/admin/followups?status=${s}&limit=200`, { headers: headers() });
          const data = await res.json();
          return [s, data.count || 0] as [string, number];
        }),
      );
      setCounts(Object.fromEntries(results));
    } catch { /* noop */ }
  }, [headers]);

  useEffect(() => {
    if (authenticated) {
      fetchFollowups();
      fetchCounts();
    }
  }, [authenticated, statusFilter, fetchFollowups, fetchCounts]);

  // Login
  const handleLogin = () => {
    sessionStorage.setItem("admin_api_key", apiKey);
    setAuthenticated(true);
  };

  // Update follow-up
  const updateFollowup = async (id: string, payload: Record<string, unknown>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/followups/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      const action = payload.status ? String(payload.status).replace("_", " ") : "updated";
      setToast(`Follow-up ${action}`);
      fetchFollowups();
      fetchCounts();
      if (editingId === id) setEditingId(null);
    } catch {
      setToast("Failed to update");
    } finally {
      setSaving(null);
    }
  };

  // Approve & Send via ActiveCampaign
  const approveAndSend = async (id: string) => {
    if (!confirm("This will approve the follow-up and send it to the client via ActiveCampaign. Continue?")) return;
    setSendingId(id);
    try {
      const res = await fetch(`/api/admin/followups/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ action: "approve_and_send" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setToast("Email sent via ActiveCampaign");
      fetchFollowups();
      fetchCounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Send failed";
      setToast(`Error: ${msg}`);
    } finally {
      setSendingId(null);
    }
  };

  // Start editing
  const startEdit = (f: Followup) => {
    setEditingId(f.id);
    setEditSubject(f.generated_subject || "");
    setEditBody(f.generated_body || "");
    setExpandedId(f.id);
  };

  // Save edits
  const saveEdits = (id: string) => {
    updateFollowup(id, {
      generated_subject: editSubject,
      generated_body: editBody,
    });
  };

  // Copy email body to clipboard
  const copyToClipboard = (f: Followup) => {
    const text = `Subject: ${f.generated_subject || ""}\n\n${f.generated_body || ""}`;
    navigator.clipboard.writeText(text).then(
      () => setToast("Email copied to clipboard — paste into ActiveCampaign"),
      () => setToast("Failed to copy"),
    );
  };

  /* ═══ LOGIN SCREEN ═══ */
  if (!authenticated) {
    return (
      <div style={{
        minHeight: "100vh", background: LIGHT_BG, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Lato', system-ui, sans-serif",
      }}>
        <div style={{
          background: WHITE, borderRadius: 12, padding: "40px 36px",
          boxShadow: "0 8px 32px rgba(2,24,89,0.1)", maxWidth: 400, width: "100%",
          border: `1px solid ${BORDER}`,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "0 0 6px", textAlign: "center" }}>
            Follow-Up Review Dashboard
          </h1>
          <p style={{ fontSize: 13, color: SUB, textAlign: "center", margin: "0 0 24px" }}>
            Enter your admin API key to access
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API key"
            style={{
              width: "100%", padding: "12px 14px", fontSize: 14,
              border: `1.5px solid ${BORDER}`, borderRadius: 8, outline: "none",
              boxSizing: "border-box", marginBottom: 12, color: NAVY,
              fontFamily: "'SF Mono', Monaco, monospace",
            }}
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!apiKey.trim()}
            style={{
              width: "100%", padding: "12px", fontSize: 14, fontWeight: 700,
              background: BLUE, color: WHITE, border: "none", borderRadius: 8,
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

  /* ═══ MAIN DASHBOARD ═══ */
  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: "'Lato', system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, padding: "12px 20px",
          background: NAVY, color: WHITE, borderRadius: 8, fontSize: 13, fontWeight: 600,
          zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: NAVY, color: WHITE, padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
            Follow-Up Review Queue
          </h1>
          <p style={{ fontSize: 13, color: "#8BA3CF", margin: 0 }}>
            AI-generated follow-up emails from call transcripts
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { fetchFollowups(); fetchCounts(); }}
            style={{
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              background: "rgba(255,255,255,0.1)", color: WHITE,
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6,
              cursor: "pointer", fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => { setAuthenticated(false); sessionStorage.removeItem("admin_api_key"); }}
            style={{
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              background: "transparent", color: "#8BA3CF",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
              cursor: "pointer", fontFamily: "'Lato', system-ui, sans-serif",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{
        display: "flex", gap: 0, background: WHITE,
        borderBottom: `1px solid ${BORDER}`, padding: "0 24px", overflowX: "auto",
      }}>
        {([
          { key: "pending_review" as const, label: "Pending Review" },
          { key: "approved" as const, label: "Approved" },
          { key: "sent" as const, label: "Sent" },
          { key: "rejected" as const, label: "Rejected" },
          { key: "all" as const, label: "All" },
        ]).map(({ key, label }) => {
          const isActive = statusFilter === key;
          const count = key === "all"
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{
                padding: "14px 20px", background: "transparent", border: "none",
                borderBottom: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
                color: isActive ? NAVY : SUB, fontSize: 13,
                fontWeight: isActive ? 700 : 500, cursor: "pointer",
                fontFamily: "'Lato', system-ui, sans-serif", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, padding: "2px 7px", borderRadius: 10,
                  background: isActive ? `${BLUE}15` : "#F0F2F5",
                  color: isActive ? BLUE : SUB, fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: SUB, fontSize: 14 }}>
            Loading follow-ups...
          </div>
        )}

        {!loading && followups.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{statusFilter === "pending_review" ? "\u2705" : "\u{1F4ED}"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, marginBottom: 4 }}>
              {statusFilter === "pending_review" ? "All caught up!" : "No follow-ups here"}
            </div>
            <div style={{ fontSize: 13, color: SUB }}>
              {statusFilter === "pending_review"
                ? "No follow-ups waiting for review."
                : `No follow-ups with status "${statusFilter}".`}
            </div>
          </div>
        )}

        {/* Follow-up cards */}
        {followups.map((f) => {
              const isExpanded = expandedId === f.id;
          const isEditing = editingId === f.id;
          const isSaving = saving === f.id;
          const isSending = sendingId === f.id;
          const config = STATUS_CONFIG[f.status] || STATUS_CONFIG.pending_review;
          const sessionLabel = SESSION_LABELS[f.session_type] || f.session_type;

          return (
            <div
              key={f.id}
              style={{
                background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`,
                marginBottom: 16, overflow: "hidden",
                boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                transition: "box-shadow 0.2s ease",
              }}
            >
              {/* Card header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : f.id)}
                style={{
                  padding: "16px 20px", cursor: "pointer",
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top row: badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                      background: config.bg, color: config.color,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {config.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                      background: f.session_type === "activation_session" ? "#F3E8FF" : "#E0F2FE",
                      color: f.session_type === "activation_session" ? "#7C3AED" : BLUE,
                    }}>
                      {sessionLabel}
                    </span>
                    {f.product_tier && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                        background: "#F0FDF4", color: "#15803D",
                      }}>
                        {f.product_tier}
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4, lineHeight: 1.3 }}>
                    {f.generated_subject || "(No subject generated)"}
                  </div>

                  {/* Contact */}
                  <div style={{ fontSize: 13, color: SUB }}>
                    <strong style={{ color: NAVY }}>{f.contact_name || "Unknown"}</strong>
                    {" \u2014 "}
                    <span>{f.contact_email}</span>
                    {" \u00B7 "}
                    <span>{new Date(f.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                {/* Expand arrow */}
                <svg viewBox="0 0 16 16" fill="none" style={{
                  width: 16, height: 16, flexShrink: 0, marginTop: 4,
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}>
                  <path d="M4 6l4 4 4-4" stroke={SUB} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "20px" }}>
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {f.status === "pending_review" && (
                      <>
                        <ActionBtn
                          label={isSending ? "Sending..." : "Approve & Send"}
                          color="#059669"
                          loading={isSending}
                          onClick={() => approveAndSend(f.id)}
                          icon="send"
                        />
                        <ActionBtn
                          label="Approve Only"
                          color={GREEN}
                          outline
                          loading={isSaving}
                          onClick={() => updateFollowup(f.id, { status: "approved" })}
                        />
                        <ActionBtn
                          label="Reject"
                          color={RED}
                          outline
                          loading={isSaving}
                          onClick={() => updateFollowup(f.id, { status: "rejected" })}
                        />
                      </>
                    )}
                    {f.status === "approved" && (
                      <ActionBtn
                        label={isSending ? "Sending..." : "Send via ActiveCampaign"}
                        color="#059669"
                        loading={isSending}
                        onClick={() => approveAndSend(f.id)}
                        icon="send"
                      />
                    )}
                    <ActionBtn
                      label={isEditing ? "Cancel Edit" : "Edit"}
                      color={NAVY}
                      outline
                      onClick={() => isEditing ? setEditingId(null) : startEdit(f)}
                    />
                    <ActionBtn
                      label="Copy Email"
                      color={SUB}
                      outline
                      onClick={() => copyToClipboard(f)}
                    />
                  </div>

                  {/* Sent confirmation */}
                  {f.status === "sent" && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                      padding: "10px 14px", background: "#F0FDF4", borderRadius: 8,
                      border: "1px solid #BBF7D0", fontSize: 13, color: "#15803D", fontWeight: 600,
                    }}>
                      <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        <circle cx="8" cy="8" r="7.5" stroke="#22C55E" />
                        <path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Sent via ActiveCampaign
                      {f.reviewed_at && (
                        <span style={{ fontWeight: 400, color: "#5A6B7E", marginLeft: 4, fontSize: 12 }}>
                          on {new Date(f.reviewed_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Subject (editable) */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Subject Line
                    </label>
                    {isEditing ? (
                      <input
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 12px", fontSize: 14,
                          border: `1.5px solid ${BLUE}40`, borderRadius: 6, outline: "none",
                          boxSizing: "border-box", color: NAVY,
                          fontFamily: "'Lato', system-ui, sans-serif",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
                        {f.generated_subject || "—"}
                      </div>
                    )}
                  </div>

                  {/* Email body (editable) */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Email Body
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={16}
                        style={{
                          width: "100%", padding: "12px", fontSize: 13,
                          border: `1.5px solid ${BLUE}40`, borderRadius: 6, outline: "none",
                          boxSizing: "border-box", color: NAVY, lineHeight: 1.6,
                          fontFamily: "'Lato', system-ui, sans-serif", resize: "vertical",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 13, lineHeight: 1.7, color: "#1a1a2e",
                          background: LIGHT_BG, padding: "16px", borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          maxHeight: 400, overflowY: "auto",
                        }}
                        dangerouslySetInnerHTML={{ __html: f.generated_body || "<em>No body generated</em>" }}
                      />
                    )}
                  </div>

                  {/* Save edits button */}
                  {isEditing && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                      <ActionBtn label="Save Changes" color={BLUE} loading={isSaving} onClick={() => saveEdits(f.id)} />
                      <ActionBtn label="Cancel" color={SUB} outline onClick={() => setEditingId(null)} />
                    </div>
                  )}

                  {/* Action items */}
                  {f.generated_action_items && f.generated_action_items.length > 0 && (
                    <CollapsibleSection title="Action Items" defaultOpen>
                      {f.generated_action_items.map((item, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", background: LIGHT_BG, borderRadius: 6,
                          border: `1px solid ${BORDER}`, marginBottom: 8,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{item.title}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                              background: item.priority === "high" ? "#FEE2E2" : item.priority === "medium" ? "#FEF9C3" : "#DCFCE7",
                              color: item.priority === "high" ? RED : item.priority === "medium" ? "#A16207" : GREEN,
                              textTransform: "uppercase",
                            }}>
                              {item.priority}
                            </span>
                            <span style={{ fontSize: 10, color: SUB }}>
                              {item.owner === "client" ? "Client" : "Wunderbar"}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}>{item.description}</div>
                        </div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Next steps */}
                  {f.generated_next_steps && f.generated_next_steps.length > 0 && (
                    <CollapsibleSection title="Next Steps">
                      {f.generated_next_steps.map((step, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", background: LIGHT_BG, borderRadius: 6,
                          border: `1px solid ${BORDER}`, marginBottom: 8,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{step.step}</div>
                          <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}>{step.description}</div>
                          {step.timeline && (
                            <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, marginTop: 4 }}>
                              Timeline: {step.timeline}
                            </div>
                          )}
                        </div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Product recommendations */}
                  {f.generated_product_recommendations && f.generated_product_recommendations.length > 0 && (
                    <CollapsibleSection title="Product Recommendations">
                      {f.generated_product_recommendations.map((rec, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", background: LIGHT_BG, borderRadius: 6,
                          border: `1px solid ${BORDER}`, marginBottom: 8,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{rec.product}</div>
                          <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5, marginTop: 2 }}>{rec.reason}</div>
                          {rec.url && (
                            <a href={rec.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: BLUE, marginTop: 4, display: "inline-block" }}>
                              {rec.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Transcript excerpt */}
                  <CollapsibleSection title="Transcript">
                    {f.transcript_summary && (
                      <div style={{ fontSize: 12, color: NAVY, lineHeight: 1.6, marginBottom: 12, fontWeight: 500 }}>
                        <strong>Summary:</strong> {f.transcript_summary}
                      </div>
                    )}
                    <div style={{
                      fontSize: 11, color: SUB, lineHeight: 1.7,
                      maxHeight: 300, overflowY: "auto",
                      background: "#FAFBFC", padding: 12, borderRadius: 6,
                      border: `1px solid ${BORDER}`,
                      whiteSpace: "pre-wrap", fontFamily: "'SF Mono', Monaco, monospace",
                    }}>
                      {f.transcript_text?.slice(0, 5000)}
                      {f.transcript_text && f.transcript_text.length > 5000 && "\n\n... (transcript truncated)"}
                    </div>
                  </CollapsibleSection>

                  {/* Meta info */}
                  <div style={{
                    marginTop: 16, padding: "10px 14px", background: LIGHT_BG,
                    borderRadius: 6, fontSize: 11, color: SUB, display: "flex",
                    flexWrap: "wrap", gap: 16,
                  }}>
                    <span>ID: <code style={{ fontFamily: "monospace" }}>{f.id.slice(0, 8)}</code></span>
                    {f.report_id && <span>Report: <code style={{ fontFamily: "monospace" }}>{f.report_id.slice(0, 12)}</code></span>}
                    {f.transcript_source && <span>Source: {f.transcript_source}</span>}
                    {f.reviewed_at && <span>Reviewed: {new Date(f.reviewed_at).toLocaleDateString("en-AU")}</span>}
                    {f.reviewed_by && <span>By: {f.reviewed_by}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Action Button ─── */
function ActionBtn({
  label, color, outline, loading, onClick, icon,
}: {
  label: string; color: string; outline?: boolean; loading?: boolean; onClick: () => void; icon?: "send";
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "7px 14px", fontSize: 12, fontWeight: 700,
        background: outline ? "transparent" : color,
        color: outline ? color : WHITE,
        border: `1.5px solid ${color}`,
        borderRadius: 6, cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "'Lato', system-ui, sans-serif",
        transition: "opacity 0.15s ease",
        display: "flex", alignItems: "center", gap: 5,
      }}
    >
      {icon === "send" && !loading && (
        <svg viewBox="0 0 16 16" fill="none" style={{ width: 12, height: 12 }}>
          <path d="M14.5 1.5L7 9m7.5-7.5L10 14.5 7 9m7.5-7.5L1.5 6 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {loading && !label.includes("Sending") ? "Saving..." : label}
    </button>
  );
}

/* ─── Collapsible Section ─── */
function CollapsibleSection({
  title, children, defaultOpen,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, fontWeight: 700, color: SUB,
          textTransform: "uppercase", letterSpacing: "0.06em",
          padding: "4px 0", marginBottom: 8,
          fontFamily: "'Lato', system-ui, sans-serif",
        }}
      >
        <svg viewBox="0 0 10 10" fill="none" style={{
          width: 8, height: 8, transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.2s ease",
        }}>
          <path d="M2 3l3 3.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </button>
      {open && children}
    </div>
  );
}
