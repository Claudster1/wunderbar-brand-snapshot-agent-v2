"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const RED = "#EF4444";

type InquiryStatus = "new" | "in_progress" | "responded" | "closed";
type InquirySource = "connect_form" | "quo_call" | "quo_voicemail" | "manual";

type Contact = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  company_name: string | null;
};

type Inquiry = {
  id: string;
  source: InquirySource;
  status: InquiryStatus;
  priority: "low" | "normal" | "high" | "urgent";
  subject: string | null;
  message: string | null;
  transcript: string | null;
  owner: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  crm_contacts: Contact | Contact[] | null;
};

type Analytics = {
  totalOpen: number;
  newCount: number;
  inProgressCount: number;
  responded7d: number;
  staleOpen24h: number;
  overdueTasks: number;
};

const EMPTY_ANALYTICS: Analytics = {
  totalOpen: 0,
  newCount: 0,
  inProgressCount: 0,
  responded7d: 0,
  staleOpen24h: 0,
  overdueTasks: 0,
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  responded: "Responded",
  closed: "Closed",
};

const SOURCE_LABEL: Record<InquirySource, string> = {
  connect_form: "Connect Form",
  quo_call: "Quo Call",
  quo_voicemail: "Quo Voicemail",
  manual: "Manual",
};

const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: YELLOW,
  in_progress: BLUE,
  responded: GREEN,
  closed: SUB,
};

export default function InboundInboxPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ownerInput, setOwnerInput] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    [apiKey],
  );

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        source: sourceFilter,
        limit: "100",
      });
      const res = await fetch(`/api/admin/crm/inquiries?${params.toString()}`, {
        headers: headers(),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem("admin_api_key");
        return;
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setAnalytics(data.analytics || EMPTY_ANALYTICS);
    } catch {
      setToast("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [headers, sourceFilter, statusFilter]);

  useEffect(() => {
    if (authenticated) fetchInquiries();
  }, [authenticated, fetchInquiries]);

  const counts = useMemo(() => {
    const base = { new: 0, in_progress: 0, responded: 0, closed: 0 };
    for (const inquiry of inquiries) {
      base[inquiry.status] += 1;
    }
    return base;
  }, [inquiries]);

  const handleLogin = () => {
    sessionStorage.setItem("admin_api_key", apiKey);
    setAuthenticated(true);
  };

  const getContact = (inquiry: Inquiry): Contact | null => {
    if (!inquiry.crm_contacts) return null;
    if (Array.isArray(inquiry.crm_contacts)) return inquiry.crm_contacts[0] ?? null;
    return inquiry.crm_contacts;
  };

  const updateInquiry = async (id: string, payload: Record<string, unknown>) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/crm/inquiries/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      setToast("Inquiry updated");
      await fetchInquiries();
      setNoteInput((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setToast(msg);
    } finally {
      setSavingId(null);
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: LIGHT_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 420,
            maxWidth: "100%",
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <h1 style={{ margin: 0, color: NAVY, fontSize: 22 }}>Inbound Inbox</h1>
          <p style={{ margin: "8px 0 16px", color: SUB, fontSize: 13 }}>
            Enter your admin API key.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API key"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <button
            onClick={handleLogin}
            disabled={!apiKey.trim()}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: BLUE,
              color: WHITE,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: LIGHT_BG,
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            padding: "10px 14px",
            background: NAVY,
            color: WHITE,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          background: NAVY,
          color: WHITE,
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>Inbound CRM Inbox</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8BA3CF" }}>
            Calls, voicemails, and connect form inquiries in one queue.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/admin/followups"
            style={{ color: "#8BA3CF", textDecoration: "none", fontSize: 12 }}
          >
            Follow-ups
          </Link>
          <Link
            href="/admin/analytics"
            style={{ color: "#8BA3CF", textDecoration: "none", fontSize: 12 }}
          >
            Analytics
          </Link>
          <button
            onClick={() => {
              setAuthenticated(false);
              sessionStorage.removeItem("admin_api_key");
            }}
            style={{
              background: "transparent",
              color: "#8BA3CF",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { label: "Open", value: analytics.totalOpen, color: NAVY },
            { label: "New", value: analytics.newCount, color: YELLOW },
            { label: "In Progress", value: analytics.inProgressCount, color: BLUE },
            { label: "Responded (7d)", value: analytics.responded7d, color: GREEN },
            { label: "Stale (24h+)", value: analytics.staleOpen24h, color: RED },
            { label: "Overdue Tasks", value: analytics.overdueTasks, color: SUB },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ color: SUB, fontSize: 11, marginBottom: 6 }}>{card.label}</div>
              <div style={{ color: card.color, fontSize: 20, fontWeight: 800 }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value="all">All sources</option>
            <option value="connect_form">Connect Form</option>
            <option value="quo_call">Quo Call</option>
            <option value="quo_voicemail">Quo Voicemail</option>
            <option value="manual">Manual</option>
          </select>
          <button
            onClick={fetchInquiries}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, fontSize: 12, color: SUB }}>
            <span>New: {counts.new}</span>
            <span>In progress: {counts.in_progress}</span>
            <span>Responded: {counts.responded}</span>
            <span>Closed: {counts.closed}</span>
          </div>
        </div>

        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: SUB }}>Loading inquiries...</div>
        )}

        {!loading && inquiries.length === 0 && (
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: 28,
              textAlign: "center",
              color: SUB,
            }}
          >
            No inquiries for this filter.
          </div>
        )}

        {inquiries.map((inquiry) => {
          const contact = getContact(inquiry);
          const expanded = expandedId === inquiry.id;
          const saving = savingId === inquiry.id;

          return (
            <div
              key={inquiry.id}
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpandedId(expanded ? null : inquiry.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  padding: 14,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                      {inquiry.subject || "Inbound inquiry"}
                    </div>
                    <div style={{ fontSize: 12, color: SUB, marginTop: 3 }}>
                      {(contact?.full_name || "Unknown")} ·{" "}
                      {contact?.email || contact?.phone || "No contact"} ·{" "}
                      {new Date(inquiry.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: STATUS_COLORS[inquiry.status],
                        background: `${STATUS_COLORS[inquiry.status]}20`,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {STATUS_LABEL[inquiry.status]}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: NAVY,
                        background: "#E9EFF7",
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {SOURCE_LABEL[inquiry.source]}
                    </span>
                  </div>
                </div>
              </button>

              {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 14 }}>
                  <div style={{ fontSize: 12, color: SUB, marginBottom: 8 }}>
                    Company: <strong style={{ color: NAVY }}>{contact?.company_name || "—"}</strong>
                  </div>

                  {inquiry.message && (
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{ fontSize: 11, color: SUB, marginBottom: 4, fontWeight: 700 }}
                      >
                        Message
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: NAVY,
                          background: LIGHT_BG,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        {inquiry.message}
                      </div>
                    </div>
                  )}

                  {inquiry.transcript && (
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{ fontSize: 11, color: SUB, marginBottom: 4, fontWeight: 700 }}
                      >
                        Transcript
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: NAVY,
                          background: LIGHT_BG,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 10,
                          maxHeight: 180,
                          overflowY: "auto",
                        }}
                      >
                        {inquiry.transcript}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <input
                      value={ownerInput[inquiry.id] ?? inquiry.owner ?? ""}
                      onChange={(e) =>
                        setOwnerInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))
                      }
                      placeholder="Owner (e.g. Claudine)"
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
                    />
                    <select
                      defaultValue={inquiry.status}
                      onChange={(e) =>
                        updateInquiry(inquiry.id, {
                          status: e.target.value,
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                        })
                      }
                      disabled={saving}
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <textarea
                    value={noteInput[inquiry.id] ?? ""}
                    onChange={(e) =>
                      setNoteInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))
                    }
                    placeholder="Internal note (optional)"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      marginBottom: 8,
                    }}
                  />

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "in_progress",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: BLUE,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "responded",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: GREEN,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark Responded
                    </button>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "closed",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: RED,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
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
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";
const GREEN = "#22C55E";
const YELLOW = "#EAB308";
const RED = "#EF4444";

type InquiryStatus = "new" | "in_progress" | "responded" | "closed";
type InquirySource = "connect_form" | "quo_call" | "quo_voicemail" | "manual";

type Contact = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  company_name: string | null;
};

type Inquiry = {
  id: string;
  source: InquirySource;
  status: InquiryStatus;
  priority: "low" | "normal" | "high" | "urgent";
  subject: string | null;
  message: string | null;
  transcript: string | null;
  owner: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  crm_contacts: Contact | Contact[] | null;
};

type Analytics = {
  totalOpen: number;
  newCount: number;
  inProgressCount: number;
  responded7d: number;
  staleOpen24h: number;
  overdueTasks: number;
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  responded: "Responded",
  closed: "Closed",
};

const SOURCE_LABEL: Record<InquirySource, string> = {
  connect_form: "Connect Form",
  quo_call: "Quo Call",
  quo_voicemail: "Quo Voicemail",
  manual: "Manual",
};

const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: YELLOW,
  in_progress: BLUE,
  responded: GREEN,
  closed: SUB,
};

const EMPTY_ANALYTICS: Analytics = {
  totalOpen: 0,
  newCount: 0,
  inProgressCount: 0,
  responded7d: 0,
  staleOpen24h: 0,
  overdueTasks: 0,
};

export default function InboundInboxPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ownerInput, setOwnerInput] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    [apiKey],
  );

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        source: sourceFilter,
        limit: "100",
      });
      const res = await fetch(`/api/admin/crm/inquiries?${params.toString()}`, {
        headers: headers(),
      });
      if (res.status === 401) {
        setAuthenticated(false);
        sessionStorage.removeItem("admin_api_key");
        return;
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setAnalytics(data.analytics || EMPTY_ANALYTICS);
    } catch {
      setToast("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [headers, sourceFilter, statusFilter]);

  useEffect(() => {
    if (authenticated) fetchInquiries();
  }, [authenticated, fetchInquiries]);

  const counts = useMemo(() => {
    const base = { new: 0, in_progress: 0, responded: 0, closed: 0 };
    for (const inquiry of inquiries) {
      base[inquiry.status] += 1;
    }
    return base;
  }, [inquiries]);

  const handleLogin = () => {
    sessionStorage.setItem("admin_api_key", apiKey);
    setAuthenticated(true);
  };

  const getContact = (inquiry: Inquiry): Contact | null => {
    if (!inquiry.crm_contacts) return null;
    if (Array.isArray(inquiry.crm_contacts)) return inquiry.crm_contacts[0] ?? null;
    return inquiry.crm_contacts;
  };

  const updateInquiry = async (id: string, payload: Record<string, unknown>) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/crm/inquiries/${id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      setToast("Inquiry updated");
      await fetchInquiries();
      setNoteInput((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setToast(msg);
    } finally {
      setSavingId(null);
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: LIGHT_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 420,
            maxWidth: "100%",
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <h1 style={{ margin: 0, color: NAVY, fontSize: 22 }}>Inbound Inbox</h1>
          <p style={{ margin: "8px 0 16px", color: SUB, fontSize: 13 }}>Enter your admin API key.</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API key"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <button
            onClick={handleLogin}
            disabled={!apiKey.trim()}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: BLUE,
              color: WHITE,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: "'Lato', system-ui, sans-serif" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            padding: "10px 14px",
            background: NAVY,
            color: WHITE,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          background: NAVY,
          color: WHITE,
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>Inbound CRM Inbox</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8BA3CF" }}>
            Calls, voicemails, and connect form inquiries in one queue.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin/followups" style={{ color: "#8BA3CF", textDecoration: "none", fontSize: 12 }}>
            Follow-ups
          </Link>
          <Link href="/admin/analytics" style={{ color: "#8BA3CF", textDecoration: "none", fontSize: 12 }}>
            Analytics
          </Link>
          <button
            onClick={() => {
              setAuthenticated(false);
              sessionStorage.removeItem("admin_api_key");
            }}
            style={{
              background: "transparent",
              color: "#8BA3CF",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { label: "Open", value: analytics.totalOpen, color: NAVY },
            { label: "New", value: analytics.newCount, color: YELLOW },
            { label: "In Progress", value: analytics.inProgressCount, color: BLUE },
            { label: "Responded (7d)", value: analytics.responded7d, color: GREEN },
            { label: "Stale (24h+)", value: analytics.staleOpen24h, color: RED },
            { label: "Overdue Tasks", value: analytics.overdueTasks, color: SUB },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ color: SUB, fontSize: 11, marginBottom: 6 }}>{card.label}</div>
              <div style={{ color: card.color, fontSize: 20, fontWeight: 800 }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value="all">All sources</option>
            <option value="connect_form">Connect Form</option>
            <option value="quo_call">Quo Call</option>
            <option value="quo_voicemail">Quo Voicemail</option>
            <option value="manual">Manual</option>
          </select>
          <button
            onClick={fetchInquiries}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: WHITE,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, fontSize: 12, color: SUB }}>
            <span>New: {counts.new}</span>
            <span>In progress: {counts.in_progress}</span>
            <span>Responded: {counts.responded}</span>
            <span>Closed: {counts.closed}</span>
          </div>
        </div>

        {loading && <div style={{ padding: 30, textAlign: "center", color: SUB }}>Loading inquiries...</div>}

        {!loading && inquiries.length === 0 && (
          <div
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: 28,
              textAlign: "center",
              color: SUB,
            }}
          >
            No inquiries for this filter.
          </div>
        )}

        {inquiries.map((inquiry) => {
          const contact = getContact(inquiry);
          const expanded = expandedId === inquiry.id;
          const saving = savingId === inquiry.id;

          return (
            <div
              key={inquiry.id}
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpandedId(expanded ? null : inquiry.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  padding: 14,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                      {inquiry.subject || "Inbound inquiry"}
                    </div>
                    <div style={{ fontSize: 12, color: SUB, marginTop: 3 }}>
                      {(contact?.full_name || "Unknown")} · {contact?.email || contact?.phone || "No contact"} ·{" "}
                      {new Date(inquiry.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: STATUS_COLORS[inquiry.status],
                        background: `${STATUS_COLORS[inquiry.status]}20`,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {STATUS_LABEL[inquiry.status]}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: NAVY,
                        background: "#E9EFF7",
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {SOURCE_LABEL[inquiry.source]}
                    </span>
                  </div>
                </div>
              </button>

              {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 14 }}>
                  <div style={{ fontSize: 12, color: SUB, marginBottom: 8 }}>
                    Company: <strong style={{ color: NAVY }}>{contact?.company_name || "-"}</strong>
                  </div>

                  {inquiry.message && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: SUB, marginBottom: 4, fontWeight: 700 }}>Message</div>
                      <div
                        style={{
                          fontSize: 13,
                          color: NAVY,
                          background: LIGHT_BG,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        {inquiry.message}
                      </div>
                    </div>
                  )}

                  {inquiry.transcript && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: SUB, marginBottom: 4, fontWeight: 700 }}>Transcript</div>
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: NAVY,
                          background: LIGHT_BG,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 10,
                          maxHeight: 180,
                          overflowY: "auto",
                        }}
                      >
                        {inquiry.transcript}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <input
                      value={ownerInput[inquiry.id] ?? inquiry.owner ?? ""}
                      onChange={(e) => setOwnerInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                      placeholder="Owner (e.g. Claudine)"
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
                    />
                    <select
                      defaultValue={inquiry.status}
                      onChange={(e) =>
                        updateInquiry(inquiry.id, {
                          status: e.target.value,
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                        })
                      }
                      disabled={saving}
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <textarea
                    value={noteInput[inquiry.id] ?? ""}
                    onChange={(e) => setNoteInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                    placeholder="Internal note (optional)"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      marginBottom: 8,
                    }}
                  />

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "in_progress",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: BLUE,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "responded",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: GREEN,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark Responded
                    </button>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          status: "closed",
                          owner: ownerInput[inquiry.id] ?? inquiry.owner ?? null,
                          note: noteInput[inquiry.id] ?? null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: RED,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
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
