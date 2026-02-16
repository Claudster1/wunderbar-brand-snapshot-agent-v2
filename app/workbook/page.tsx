"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Section IDs for navigation
const SECTIONS = [
  { id: "positioning", label: "Brand Positioning" },
  { id: "pitches", label: "Elevator Pitches" },
  { id: "messaging", label: "Messaging Pillars" },
  { id: "voice", label: "Brand Voice & Tone" },
  { id: "audience", label: "Audience Profiles" },
  { id: "differentiators", label: "Key Differentiators" },
  { id: "archetype", label: "Brand Archetype" },
] as const;

type Workbook = Record<string, any>;

function WorkbookContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") || "";
  const email = searchParams.get("email") || "";

  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("positioning");
  const [refining, setRefining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch workbook ───
  useEffect(() => {
    if (!reportId || !email) {
      setError("Missing reportId or email in URL.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load workbook.");
          return;
        }
        setWorkbook(data.workbook);
      } catch {
        setError("Failed to connect.");
      } finally {
        setLoading(false);
      }
    })();
  }, [reportId, email]);

  // ─── Save a field ───
  const saveField = useCallback(
    async (field: string, value: unknown) => {
      if (!workbook) return;
      setSaving(true);
      setSaveStatus(null);
      try {
        const res = await fetch("/api/workbook", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId, email, updates: { [field]: value } }),
        });
        if (res.ok) {
          setWorkbook((prev) => (prev ? { ...prev, [field]: value } : prev));
          setSaveStatus("Saved");
          setTimeout(() => setSaveStatus(null), 2000);
        } else {
          setSaveStatus("Save failed");
        }
      } catch {
        setSaveStatus("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [workbook, reportId, email]
  );

  // ─── AI Refine ───
  const refineField = useCallback(
    async (field: string) => {
      if (!workbook || !workbook[field]) return;
      setRefining(field);
      try {
        const res = await fetch("/api/workbook/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: field,
            content: workbook[field],
            businessName: workbook.business_name,
          }),
        });
        const data = await res.json();
        if (res.ok && data.refined) {
          setWorkbook((prev) => (prev ? { ...prev, [field]: data.refined } : prev));
          await saveField(field, data.refined);
        }
      } catch {
        // Silently fail refinement
      } finally {
        setRefining(null);
      }
    },
    [workbook, saveField]
  );

  // ─── Loading / Error states ───
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your Brand Workbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ ...styles.loadingText, color: "#DC2626" }}>{error}</p>
        <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>
      </div>
    );
  }

  if (!workbook) return null;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Brand Workbook</h2>
          <p style={styles.sidebarBusiness}>{workbook.business_name || "Your Brand"}</p>
        </div>
        <nav style={styles.sidebarNav}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                ...styles.navBtn,
                ...(activeSection === s.id ? styles.navBtnActive : {}),
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <a
            href={`/api/workbook/export?reportId=${reportId}&email=${encodeURIComponent(email)}`}
            style={styles.exportBtn}
          >
            Export Brand Standards PDF
          </a>
          <a href="/dashboard" style={styles.backLink}>← Back to Dashboard</a>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Save indicator */}
        {saveStatus && (
          <div style={{
            ...styles.saveIndicator,
            background: saveStatus === "Saved" ? "#ECFDF5" : "#FEF2F2",
            color: saveStatus === "Saved" ? "#059669" : "#DC2626",
          }}>
            {saveStatus}
          </div>
        )}

        {/* ─── Positioning ─── */}
        {activeSection === "positioning" && (
          <section>
            <h1 style={styles.sectionTitle}>Brand Positioning</h1>
            <p style={styles.sectionDesc}>Define how your brand is positioned in the market. These outputs form the foundation of all your messaging.</p>

            <EditableField
              label="Positioning Statement"
              value={workbook.positioning_statement || ""}
              field="positioning_statement"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={4}
            />
            <EditableField
              label="Unique Value Proposition"
              value={workbook.unique_value_proposition || ""}
              field="unique_value_proposition"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={3}
            />
            <EditableField
              label="Competitive Differentiation"
              value={workbook.competitive_differentiation || ""}
              field="competitive_differentiation"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={4}
            />
          </section>
        )}

        {/* ─── Elevator Pitches ─── */}
        {activeSection === "pitches" && (
          <section>
            <h1 style={styles.sectionTitle}>Elevator Pitches</h1>
            <p style={styles.sectionDesc}>Ready-to-use pitches for conversations, emails, and presentations. Edit to match your natural voice.</p>

            <EditableField
              label="30-Second Pitch"
              value={workbook.elevator_pitch_30s || ""}
              field="elevator_pitch_30s"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={3}
              placeholder="A concise pitch for quick introductions (aim for ~75 words)..."
            />
            <EditableField
              label="60-Second Pitch"
              value={workbook.elevator_pitch_60s || ""}
              field="elevator_pitch_60s"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={5}
              placeholder="An expanded pitch with a story or proof point (~150 words)..."
            />
            <EditableField
              label="Email Pitch"
              value={workbook.elevator_pitch_email || ""}
              field="elevator_pitch_email"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={4}
              placeholder="A pitch formatted for outreach emails (~100 words)..."
            />
          </section>
        )}

        {/* ─── Messaging Pillars ─── */}
        {activeSection === "messaging" && (
          <section>
            <h1 style={styles.sectionTitle}>Messaging Pillars</h1>
            <p style={styles.sectionDesc}>Your core messages — the key themes that should be woven into all brand communications.</p>

            {(workbook.messaging_pillars || []).map((pillar: any, idx: number) => (
              <div key={idx} style={styles.pillarCard}>
                <h3 style={styles.pillarTitle}>{pillar.title}</h3>
                <EditableField
                  label="Description"
                  value={pillar.description || ""}
                  field={`messaging_pillar_${idx}_desc`}
                  onSave={async (_, val) => {
                    const updated = [...(workbook.messaging_pillars || [])];
                    updated[idx] = { ...updated[idx], description: val };
                    await saveField("messaging_pillars", updated);
                  }}
                  onRefine={() => {}}
                  saving={saving}
                  refining={refining}
                  rows={3}
                />
              </div>
            ))}
          </section>
        )}

        {/* ─── Brand Voice & Tone ─── */}
        {activeSection === "voice" && (
          <section>
            <h1 style={styles.sectionTitle}>Brand Voice & Tone</h1>
            <p style={styles.sectionDesc}>Guidelines for how your brand sounds across all communications. Share this with anyone who writes for your brand.</p>

            <div style={styles.tagContainer}>
              <label style={styles.fieldLabel}>Voice Attributes</label>
              <div style={styles.tagRow}>
                {(workbook.brand_voice_attributes || []).map((attr: string, idx: number) => (
                  <span key={idx} style={styles.tag}>{attr}</span>
                ))}
              </div>
            </div>

            <EditableField
              label="Tone Guidelines"
              value={workbook.tone_guidelines || ""}
              field="tone_guidelines"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={6}
              placeholder="Describe when and how your brand's tone shifts (e.g., more formal in proposals, more casual on social)..."
            />
          </section>
        )}

        {/* ─── Audience ─── */}
        {activeSection === "audience" && (
          <section>
            <h1 style={styles.sectionTitle}>Audience Profiles</h1>
            <p style={styles.sectionDesc}>Who you serve and what drives their decisions. Share these with your marketing and sales teams.</p>

            <EditableField
              label="Primary Audience"
              value={workbook.primary_audience?.description || (typeof workbook.primary_audience === "string" ? workbook.primary_audience : "")}
              field="primary_audience_desc"
              onSave={async (_, val) => {
                const updated = { ...(workbook.primary_audience || {}), description: val };
                await saveField("primary_audience", updated);
              }}
              onRefine={() => {}}
              saving={saving}
              refining={refining}
              rows={4}
              placeholder="Describe your primary audience — who they are, what they need, what drives their decisions..."
            />
            <EditableField
              label="Secondary Audience"
              value={workbook.secondary_audience?.description || (typeof workbook.secondary_audience === "string" ? workbook.secondary_audience : "")}
              field="secondary_audience_desc"
              onSave={async (_, val) => {
                const updated = { ...(workbook.secondary_audience || {}), description: val };
                await saveField("secondary_audience", updated);
              }}
              onRefine={() => {}}
              saving={saving}
              refining={refining}
              rows={4}
              placeholder="Describe your secondary audience (if applicable)..."
            />
          </section>
        )}

        {/* ─── Differentiators ─── */}
        {activeSection === "differentiators" && (
          <section>
            <h1 style={styles.sectionTitle}>Key Differentiators</h1>
            <p style={styles.sectionDesc}>What makes you different — framed as competitive advantages your audience cares about.</p>

            {(workbook.key_differentiators || []).map((diff: any, idx: number) => (
              <div key={idx} style={styles.pillarCard}>
                <EditableField
                  label={`Differentiator ${idx + 1}`}
                  value={diff.differentiator || diff || ""}
                  field={`diff_${idx}`}
                  onSave={async (_, val) => {
                    const updated = [...(workbook.key_differentiators || [])];
                    if (typeof updated[idx] === "object") {
                      updated[idx] = { ...updated[idx], differentiator: val };
                    } else {
                      updated[idx] = val;
                    }
                    await saveField("key_differentiators", updated);
                  }}
                  onRefine={() => {}}
                  saving={saving}
                  refining={refining}
                  rows={2}
                />
              </div>
            ))}
          </section>
        )}

        {/* ─── Archetype ─── */}
        {activeSection === "archetype" && (
          <section>
            <h1 style={styles.sectionTitle}>Brand Archetype</h1>
            <p style={styles.sectionDesc}>Your brand personality framework — how your brand shows up in the world.</p>

            <div style={styles.archetypeBadge}>
              <span style={styles.archetypeLabel}>Your Archetype</span>
              <span style={styles.archetypeName}>{workbook.brand_archetype || "Not yet determined"}</span>
            </div>

            <EditableField
              label="Archetype Description"
              value={workbook.archetype_description || ""}
              field="archetype_description"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={4}
            />
            <EditableField
              label="How to Apply Your Archetype"
              value={workbook.archetype_application || ""}
              field="archetype_application"
              onSave={saveField}
              onRefine={refineField}
              saving={saving}
              refining={refining}
              rows={5}
            />
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Editable Field Component ───
function EditableField({
  label,
  value,
  field,
  onSave,
  onRefine,
  saving,
  refining,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  field: string;
  onSave: (field: string, value: string) => Promise<void>;
  onRefine: (field: string) => Promise<void>;
  saving: boolean;
  refining: string | null;
  rows?: number;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocalValue(value);
    setDirty(false);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(field, localValue);
    setDirty(false);
  };

  const isRefining = refining === field;

  return (
    <div style={styles.fieldContainer}>
      <div style={styles.fieldHeader}>
        <label style={styles.fieldLabel}>{label}</label>
        <div style={styles.fieldActions}>
          {dirty && (
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {value && value.length >= 5 && (
            <button
              onClick={() => onRefine(field)}
              disabled={isRefining}
              style={styles.refineBtn}
            >
              {isRefining ? "Refining..." : "AI Refine"}
            </button>
          )}
        </div>
      </div>
      <textarea
        value={localValue}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder || `Enter your ${label.toLowerCase()}...`}
        style={{
          ...styles.textarea,
          ...(dirty ? styles.textareaDirty : {}),
          ...(isRefining ? styles.textareaRefining : {}),
        }}
      />
    </div>
  );
}

// ─── Styles ───
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Lato', system-ui, sans-serif",
    background: "#F8FAFD",
  },
  sidebar: {
    width: 260,
    background: "#021859",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "28px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 4px",
    color: "#fff",
  },
  sidebarBusiness: {
    fontSize: 13,
    color: "#8BA3CF",
    margin: 0,
  },
  sidebarNav: {
    padding: "12px 0",
    flex: 1,
  },
  navBtn: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    color: "#C9D6FF",
    fontSize: 14,
    fontWeight: 400,
    textAlign: "left" as const,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Lato', system-ui, sans-serif",
  },
  navBtnActive: {
    background: "rgba(7, 176, 242, 0.15)",
    color: "#07B0F2",
    fontWeight: 600,
    borderLeft: "3px solid #07B0F2",
  },
  sidebarFooter: {
    padding: "16px 20px 24px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  exportBtn: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    background: "#07B0F2",
    color: "#fff",
    borderRadius: 6,
    textAlign: "center" as const,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 12,
  },
  backLink: {
    display: "block",
    color: "#8BA3CF",
    fontSize: 13,
    textDecoration: "none",
    textAlign: "center" as const,
  },
  main: {
    flex: 1,
    padding: "40px 48px",
    maxWidth: 800,
    position: "relative" as const,
  },
  saveIndicator: {
    position: "fixed" as const,
    top: 16,
    right: 16,
    padding: "8px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 100,
    animation: "fadeIn 0.2s ease",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#021859",
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  sectionDesc: {
    fontSize: 15,
    color: "#5A6B7E",
    lineHeight: 1.6,
    margin: "0 0 32px",
    maxWidth: 600,
  },
  fieldContainer: {
    marginBottom: 28,
  },
  fieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#021859",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  fieldActions: {
    display: "flex",
    gap: 8,
  },
  saveBtn: {
    padding: "6px 14px",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Lato', system-ui, sans-serif",
  },
  refineBtn: {
    padding: "6px 14px",
    background: "transparent",
    color: "#07B0F2",
    border: "1.5px solid #07B0F2",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Lato', system-ui, sans-serif",
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#021859",
    border: "1.5px solid #D6E4F0",
    borderRadius: 8,
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "'Lato', system-ui, sans-serif",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
  },
  textareaDirty: {
    borderColor: "#F59E0B",
    boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)",
  },
  textareaRefining: {
    opacity: 0.6,
    borderColor: "#07B0F2",
  },
  pillarCard: {
    background: "#fff",
    border: "1px solid #E6EAF2",
    borderRadius: 10,
    padding: "20px 24px",
    marginBottom: 16,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#021859",
    margin: "0 0 12px",
  },
  tagContainer: {
    marginBottom: 24,
  },
  tagRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginTop: 8,
  },
  tag: {
    display: "inline-block",
    padding: "6px 14px",
    background: "#EBF8FF",
    color: "#07B0F2",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  archetypeBadge: {
    display: "inline-flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    background: "#021859",
    color: "#fff",
    borderRadius: 12,
    padding: "20px 32px",
    marginBottom: 28,
  },
  archetypeLabel: {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: "#07B0F2",
    fontWeight: 700,
    marginBottom: 4,
  },
  archetypeName: {
    fontSize: 24,
    fontWeight: 700,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "100vh",
    fontFamily: "'Lato', system-ui, sans-serif",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #E6EAF2",
    borderTop: "3px solid #07B0F2",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#5A6B7E",
  },
};

// ─── Main export with Suspense boundary ───
export default function WorkbookPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading your Brand Workbook...</p>
        </div>
      }
    >
      <WorkbookContent />
    </Suspense>
  );
}
