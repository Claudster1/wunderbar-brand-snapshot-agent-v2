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
type TaskStatus = "open" | "done" | "cancelled";

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

type CrmTask = {
  id: string;
  title: string;
  status: TaskStatus;
  due_at: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

type CrmActivity = {
  id: string;
  activity_type: string;
  body: string | null;
  payload: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

type CrmSyncLog = {
  id: string;
  provider: string;
  status: "success" | "failed";
  event_type: string;
  error_message: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

type InquiryDetail = {
  tasks: CrmTask[];
  activities: CrmActivity[];
  syncLog: CrmSyncLog[];
};

type TaskDraft = {
  title: string;
  dueAtLocal: string;
  assignedTo: string;
};

type TaskViewFilter = "all" | "open" | "due_24h" | "overdue";

type InquiriesResponse = {
  inquiries?: Inquiry[];
  analytics?: Analytics;
  ownerOptions?: string[];
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

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  open: YELLOW,
  done: GREEN,
  cancelled: SUB,
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

function toDatetimeLocal(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

function isTaskVisible(task: CrmTask, filter: TaskViewFilter): boolean {
  if (filter === "all") return true;
  if (filter === "open") return task.status === "open";
  if (!task.due_at) return false;

  const dueMs = new Date(task.due_at).getTime();
  const now = Date.now();
  if (filter === "overdue") return task.status === "open" && dueMs < now;
  if (filter === "due_24h") {
    return task.status === "open" && dueMs >= now && dueMs <= now + 24 * 60 * 60 * 1000;
  }
  return true;
}

export default function InboundInboxPage() {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [taskSavingId, setTaskSavingId] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [operatorName, setOperatorName] = useState<string>("");
  const [ownerOptions, setOwnerOptions] = useState<string[]>([]);
  const [taskViewFilter, setTaskViewFilter] = useState<TaskViewFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deepLinkedInquiryId, setDeepLinkedInquiryId] = useState<string | null>(null);
  const [ownerInput, setOwnerInput] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [detailsByInquiry, setDetailsByInquiry] = useState<Record<string, InquiryDetail>>({});
  const [taskDraftById, setTaskDraftById] = useState<Record<string, TaskDraft>>({});
  const [newTaskByInquiry, setNewTaskByInquiry] = useState<Record<string, TaskDraft>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }

    const deepLinkId = new URLSearchParams(window.location.search).get("inquiry");
    if (deepLinkId) setDeepLinkedInquiryId(deepLinkId);

    const storedOperatorName = sessionStorage.getItem("crm_operator_name");
    if (storedOperatorName) setOperatorName(storedOperatorName);
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

  useEffect(() => {
    if (!operatorName.trim()) return;
    sessionStorage.setItem("crm_operator_name", operatorName.trim());
  }, [operatorName]);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        source: sourceFilter,
        owner: ownerFilter === "mine" ? operatorName.trim() || "all" : ownerFilter,
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
      const data = (await res.json()) as InquiriesResponse;
      setInquiries(data.inquiries || []);
      setAnalytics(data.analytics || EMPTY_ANALYTICS);
      setOwnerOptions(data.ownerOptions || []);
    } catch {
      setToast("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [headers, operatorName, ownerFilter, sourceFilter, statusFilter]);

  const fetchInquiryDetail = useCallback(
    async (inquiryId: string, force = false) => {
      if (!force && detailsByInquiry[inquiryId]) return;

      setLoadingDetailId(inquiryId);
      try {
        const res = await fetch(`/api/admin/crm/inquiries/${inquiryId}`, {
          headers: headers(),
        });
        if (!res.ok) throw new Error("Failed to load inquiry detail");
        const data = (await res.json()) as {
          tasks?: CrmTask[];
          activities?: CrmActivity[];
          syncLog?: CrmSyncLog[];
        };

        setDetailsByInquiry((prev) => ({
          ...prev,
          [inquiryId]: {
            tasks: data.tasks || [],
            activities: data.activities || [],
            syncLog: data.syncLog || [],
          },
        }));
      } catch {
        setToast("Failed to load tasks/timeline");
      } finally {
        setLoadingDetailId((prev) => (prev === inquiryId ? null : prev));
      }
    },
    [detailsByInquiry, headers],
  );

  useEffect(() => {
    if (authenticated) fetchInquiries();
  }, [authenticated, fetchInquiries]);

  useEffect(() => {
    if (!authenticated || !deepLinkedInquiryId || inquiries.length === 0) return;
    const exists = inquiries.some((inquiry) => inquiry.id === deepLinkedInquiryId);
    if (!exists) return;

    setExpandedId(deepLinkedInquiryId);
    void fetchInquiryDetail(deepLinkedInquiryId);
    setDeepLinkedInquiryId(null);
  }, [
    authenticated,
    deepLinkedInquiryId,
    fetchInquiryDetail,
    inquiries,
  ]);

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
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Update failed");
      }
      setToast("Inquiry updated");
      await Promise.all([fetchInquiries(), fetchInquiryDetail(id, true)]);
      setNoteInput((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setToast(msg);
    } finally {
      setSavingId(null);
    }
  };

  const updateTask = async (
    inquiryId: string,
    taskId: string,
    payload: {
      status?: TaskStatus;
      title?: string;
      dueAt?: string | null;
      assignedTo?: string;
    },
  ) => {
    setTaskSavingId(taskId);
    try {
      const res = await fetch(`/api/admin/crm/tasks/${taskId}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Task update failed");
      }
      setToast("Task updated");
      await Promise.all([fetchInquiryDetail(inquiryId, true), fetchInquiries()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Task update failed";
      setToast(msg);
    } finally {
      setTaskSavingId(null);
    }
  };

  const createTask = async (inquiryId: string) => {
    const draft = newTaskByInquiry[inquiryId];
    const title = draft?.title?.trim() || "";
    if (!title) {
      setToast("Task title is required");
      return;
    }

    setTaskSavingId(`new-${inquiryId}`);
    try {
      const res = await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          inquiryId,
          title,
          assignedTo: draft?.assignedTo?.trim() || null,
          dueAt: fromDatetimeLocal(draft?.dueAtLocal || ""),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Task creation failed");
      }
      setToast("Task created");
      setNewTaskByInquiry((prev) => ({
        ...prev,
        [inquiryId]: { title: "", dueAtLocal: "", assignedTo: "" },
      }));
      await Promise.all([fetchInquiryDetail(inquiryId, true), fetchInquiries()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Task creation failed";
      setToast(msg);
    } finally {
      setTaskSavingId(null);
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
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8BA3CF" }}>Calls, voicemails, and connect form inquiries in one queue.</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 }}>
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
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          >
            <option value="all">All owners</option>
            <option value="unassigned">Unassigned</option>
            <option value="mine">Mine</option>
            {ownerOptions.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <input
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            placeholder="Your name (for Mine/Claim)"
            style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
          />
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
          const details = detailsByInquiry[inquiry.id];
          const timelineItems = [
            ...(details?.activities || []).map((item) => ({
              id: `activity-${item.id}`,
              created_at: item.created_at,
              title: item.activity_type.replaceAll("_", " "),
              body: item.body || "",
              meta: item.created_by ? `by ${item.created_by}` : "",
              tone: NAVY,
            })),
            ...(details?.syncLog || []).map((item) => ({
              id: `sync-${item.id}`,
              created_at: item.created_at,
              title: `sync ${item.event_type}`,
              body: item.error_message || `${item.provider} ${item.status}`,
              meta: "",
              tone: item.status === "failed" ? RED : GREEN,
            })),
          ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

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
                onClick={() => {
                  const next = expanded ? null : inquiry.id;
                  setExpandedId(next);
                  if (next) void fetchInquiryDetail(next);
                }}
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{inquiry.subject || "Inbound inquiry"}</div>
                    <div style={{ fontSize: 12, color: SUB, marginTop: 3 }}>
                      {(contact?.full_name || "Unknown")} · {contact?.email || contact?.phone || "No contact"} · {new Date(inquiry.created_at).toLocaleString()}
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

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 8, marginBottom: 10 }}>
                    <select
                      value={ownerInput[inquiry.id] ?? inquiry.owner ?? ""}
                      onChange={(e) => setOwnerInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}` }}
                    >
                      <option value="">Unassigned</option>
                      {ownerOptions.map((owner) => (
                        <option key={owner} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
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

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    <button
                      onClick={() =>
                        updateInquiry(inquiry.id, {
                          owner:
                            operatorName.trim() ||
                            ownerInput[inquiry.id] ||
                            inquiry.owner ||
                            null,
                        })
                      }
                      disabled={saving}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: NAVY,
                        color: WHITE,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Claim
                    </button>
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

                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, background: WHITE, padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Task Panel</div>
                      <select
                        value={taskViewFilter}
                        onChange={(e) => setTaskViewFilter(e.target.value as TaskViewFilter)}
                        style={{
                          marginBottom: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: `1px solid ${BORDER}`,
                          fontSize: 11,
                        }}
                      >
                        <option value="all">All tasks</option>
                        <option value="open">Open only</option>
                        <option value="due_24h">Due in 24h</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      {loadingDetailId === inquiry.id && !details && (
                        <div style={{ fontSize: 12, color: SUB }}>Loading tasks...</div>
                      )}
                      {details &&
                        details.tasks.filter((task) => isTaskVisible(task, taskViewFilter))
                          .length === 0 && (
                        <div style={{ fontSize: 12, color: SUB }}>No tasks yet.</div>
                      )}
                      {details?.tasks
                        .filter((task) => isTaskVisible(task, taskViewFilter))
                        .map((task) => {
                        const taskDraft = taskDraftById[task.id] || {
                          title: task.title,
                          dueAtLocal: toDatetimeLocal(task.due_at),
                          assignedTo: task.assigned_to || "",
                        };
                        return (
                          <div
                            key={task.id}
                            style={{
                              border: `1px solid ${BORDER}`,
                              borderRadius: 8,
                              padding: 8,
                              marginBottom: 8,
                              background: LIGHT_BG,
                            }}
                          >
                            <input
                              value={taskDraft.title}
                              onChange={(e) =>
                                setTaskDraftById((prev) => ({
                                  ...prev,
                                  [task.id]: { ...taskDraft, title: e.target.value },
                                }))
                              }
                              placeholder="Task title"
                              style={{
                                width: "100%",
                                fontSize: 12,
                                marginBottom: 6,
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: `1px solid ${BORDER}`,
                              }}
                            />
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 6,
                                marginBottom: 8,
                              }}
                            >
                              <input
                                type="datetime-local"
                                value={taskDraft.dueAtLocal}
                                onChange={(e) =>
                                  setTaskDraftById((prev) => ({
                                    ...prev,
                                    [task.id]: {
                                      ...taskDraft,
                                      dueAtLocal: e.target.value,
                                    },
                                  }))
                                }
                                style={{
                                  width: "100%",
                                  fontSize: 11,
                                  padding: "6px 8px",
                                  borderRadius: 6,
                                  border: `1px solid ${BORDER}`,
                                }}
                              />
                              <input
                                value={taskDraft.assignedTo}
                                onChange={(e) =>
                                  setTaskDraftById((prev) => ({
                                    ...prev,
                                    [task.id]: {
                                      ...taskDraft,
                                      assignedTo: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Assigned to"
                                style={{
                                  width: "100%",
                                  fontSize: 11,
                                  padding: "6px 8px",
                                  borderRadius: 6,
                                  border: `1px solid ${BORDER}`,
                                }}
                              />
                            </div>
                            <div style={{ fontSize: 11, color: SUB, marginBottom: 8 }}>
                              Due: {formatDate(task.due_at)}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {(["open", "done", "cancelled"] as TaskStatus[]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    updateTask(inquiry.id, task.id, { status })
                                  }
                                  disabled={taskSavingId === task.id || task.status === status}
                                  style={{
                                    fontSize: 11,
                                    borderRadius: 999,
                                    padding: "4px 8px",
                                    border: "none",
                                    cursor: "pointer",
                                    color: WHITE,
                                    background: TASK_STATUS_COLORS[status],
                                    opacity: task.status === status ? 0.6 : 1,
                                  }}
                                >
                                  {status}
                                </button>
                              ))}
                              <button
                                onClick={() =>
                                  updateTask(inquiry.id, task.id, {
                                    title: taskDraft.title.trim(),
                                    dueAt: fromDatetimeLocal(taskDraft.dueAtLocal),
                                    assignedTo: taskDraft.assignedTo.trim(),
                                  })
                                }
                                disabled={taskSavingId === task.id}
                                style={{
                                  fontSize: 11,
                                  borderRadius: 999,
                                  padding: "4px 8px",
                                  border: "none",
                                  cursor: "pointer",
                                  color: WHITE,
                                  background: NAVY,
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div
                        style={{
                          border: `1px dashed ${BORDER}`,
                          borderRadius: 8,
                          padding: 8,
                          marginTop: 6,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                          Add task
                        </div>
                        <input
                          value={newTaskByInquiry[inquiry.id]?.title || ""}
                          onChange={(e) =>
                            setNewTaskByInquiry((prev) => ({
                              ...prev,
                              [inquiry.id]: {
                                title: e.target.value,
                                dueAtLocal: prev[inquiry.id]?.dueAtLocal || "",
                                assignedTo: prev[inquiry.id]?.assignedTo || "",
                              },
                            }))
                          }
                          placeholder="Task title"
                          style={{
                            width: "100%",
                            fontSize: 12,
                            marginBottom: 6,
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: `1px solid ${BORDER}`,
                          }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <input
                            type="datetime-local"
                            value={newTaskByInquiry[inquiry.id]?.dueAtLocal || ""}
                            onChange={(e) =>
                              setNewTaskByInquiry((prev) => ({
                                ...prev,
                                [inquiry.id]: {
                                  title: prev[inquiry.id]?.title || "",
                                  dueAtLocal: e.target.value,
                                  assignedTo: prev[inquiry.id]?.assignedTo || "",
                                },
                              }))
                            }
                            style={{
                              width: "100%",
                              fontSize: 11,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: `1px solid ${BORDER}`,
                            }}
                          />
                          <input
                            value={newTaskByInquiry[inquiry.id]?.assignedTo || ""}
                            onChange={(e) =>
                              setNewTaskByInquiry((prev) => ({
                                ...prev,
                                [inquiry.id]: {
                                  title: prev[inquiry.id]?.title || "",
                                  dueAtLocal: prev[inquiry.id]?.dueAtLocal || "",
                                  assignedTo: e.target.value,
                                },
                              }))
                            }
                            placeholder="Assigned to"
                            style={{
                              width: "100%",
                              fontSize: 11,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: `1px solid ${BORDER}`,
                            }}
                          />
                        </div>
                        <button
                          onClick={() => createTask(inquiry.id)}
                          disabled={taskSavingId === `new-${inquiry.id}`}
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            borderRadius: 999,
                            padding: "5px 10px",
                            border: "none",
                            cursor: "pointer",
                            color: WHITE,
                            background: BLUE,
                          }}
                        >
                          Create Task
                        </button>
                      </div>
                    </div>

                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, background: WHITE, padding: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Timeline</div>
                      {loadingDetailId === inquiry.id && !details && (
                        <div style={{ fontSize: 12, color: SUB }}>Loading timeline...</div>
                      )}
                      {details && timelineItems.length === 0 && (
                        <div style={{ fontSize: 12, color: SUB }}>No timeline events yet.</div>
                      )}
                      {timelineItems.map((item) => (
                        <div key={item.id} style={{ borderLeft: `2px solid ${item.tone}`, paddingLeft: 8, marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: item.tone }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: SUB }}>{formatDate(item.created_at)}</div>
                          {item.body && <div style={{ fontSize: 12, color: NAVY, marginTop: 2 }}>{item.body}</div>}
                          {item.meta && <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>{item.meta}</div>}
                        </div>
                      ))}
                    </div>
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
