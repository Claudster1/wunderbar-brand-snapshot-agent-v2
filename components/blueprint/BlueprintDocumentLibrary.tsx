// components/blueprint/BlueprintDocumentLibrary.tsx
"use client";

import { useState, useCallback } from "react";

type Tier = "blueprint" | "blueprint-plus";

interface DocItem {
  type: string;
  label: string;
  description: string;
  audience: string;
  icon: string;
  pages: string;
  minTier: Tier;
}

const DOCUMENTS: DocItem[] = [
  // --- Blueprint ($997): 4 core documents ---
  {
    type: "complete",
    label: "Complete WunderBrand Blueprint™",
    description: "Your full brand operating system — all strategic sections in one comprehensive document.",
    audience: "Everyone",
    icon: "📘",
    pages: "60–80 pages",
    minTier: "blueprint",
  },
  {
    type: "executive",
    label: "Executive Summary",
    description: "WunderBrand Score, pillar breakdown, priority areas, and top strategic actions at a glance.",
    audience: "Leadership & Stakeholders",
    icon: "📊",
    pages: "2–4 pages",
    minTier: "blueprint",
  },
  {
    type: "messaging",
    label: "Brand Messaging Playbook",
    description: "Core message, messaging pillars, content pillars, taglines, company descriptions, and tone guide.",
    audience: "Marketing & Content Team",
    icon: "💬",
    pages: "10–15 pages",
    minTier: "blueprint",
  },
  {
    type: "prompts",
    label: "AI Prompt Library",
    description: "Custom AI prompts built from your brand strategy — ready to paste into ChatGPT, Claude, or any AI tool.",
    audience: "Anyone Using AI Tools",
    icon: "🤖",
    pages: "12–16 pages",
    minTier: "blueprint",
  },
  // --- Blueprint+ ($1,997): 4 additional documents ---
  {
    type: "activation",
    label: "90-Day Brand Activation Plan",
    description: "Week-by-week implementation roadmap, rollout talking points, approved language, KPIs, and execution guardrails.",
    audience: "Implementation Team",
    icon: "🚀",
    pages: "12–18 pages",
    minTier: "blueprint-plus",
  },
  {
    type: "digital",
    label: "Digital Marketing Strategy",
    description: "Customer journey, SEO, AEO, email sequences, social media, content calendar, and conversion strategy.",
    audience: "Digital & Marketing Manager",
    icon: "🌐",
    pages: "18–24 pages",
    minTier: "blueprint-plus",
  },
  {
    type: "competitive",
    label: "Competitive Intelligence Brief",
    description: "Competitive positioning, strategic trade-offs, pricing framework, persona conversation tracks, and sales scripts.",
    audience: "Sales & Business Development",
    icon: "🎯",
    pages: "14–18 pages",
    minTier: "blueprint-plus",
  },
  {
    type: "standards",
    label: "Brand Standards Guide",
    description: "Logo guidelines, visual identity, writing rules, sample executions, and governance — for anyone who touches the brand.",
    audience: "Designers, Agencies & Contractors",
    icon: "📐",
    pages: "20–30 pages",
    minTier: "blueprint-plus",
  },
];

function tierIncludes(userTier: Tier, requiredTier: Tier): boolean {
  if (requiredTier === "blueprint") return true;
  return userTier === "blueprint-plus";
}

interface Props {
  reportId: string;
  email?: string;
  tier?: Tier;
}

export function BlueprintDocumentLibrary({ reportId, email, tier = "blueprint" }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const isPlus = tier === "blueprint-plus";

  const handleDownload = useCallback(
    async (type: string) => {
      setDownloading(type);
      try {
        const params = new URLSearchParams({ reportId, type, tier });
        if (email) params.set("email", email);
        const url = `/api/blueprint/pdf?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Download failed");

        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const cd = res.headers.get("Content-Disposition");
        const filenameMatch = cd?.match(/filename="?([^"]+)"?/);
        a.download = filenameMatch?.[1] || `blueprint_${type}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.error("Download error:", err);
      } finally {
        setDownloading(null);
      }
    },
    [reportId, email, tier]
  );

  const availableDocs = DOCUMENTS.filter((d) => tierIncludes(tier, d.minTier));
  const lockedDocs = DOCUMENTS.filter((d) => !tierIncludes(tier, d.minTier));
  const tierLabel = isPlus ? "Blueprint+™" : "Blueprint™";

  return (
    <section className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-[#07B0F2] uppercase mb-2">Your Document Suite</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#021859] mb-2">{tierLabel} Document Library</h2>
          <p className="text-sm text-[#4B5563] max-w-lg mx-auto">
            {isPlus
              ? "Your complete brand strategy, broken into focused documents for every team and use case."
              : "Your brand strategy documents — download individually or grab the full report."}
          </p>
        </div>

        {/* Available documents */}
        <div className="grid gap-3">
          {availableDocs.map((doc) => {
            const isDownloading = downloading === doc.type;
            const isMaster = doc.type === "complete";

            return (
              <div
                key={doc.type}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  isMaster
                    ? "border-[#07B0F2] bg-[#EFF6FF] shadow-sm"
                    : "border-[#E5E7EB] bg-white hover:border-[#07B0F2]/40 hover:shadow-sm"
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-[#021859] ${isMaster ? "text-base" : "text-sm"}`}>{doc.label}</h3>
                    {isMaster && (
                      <span className="text-[10px] font-bold bg-[#07B0F2] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Full Report
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{doc.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-[#9CA3AF]">{doc.audience}</span>
                    <span className="text-[10px] text-[#9CA3AF]">·</span>
                    <span className="text-[10px] text-[#9CA3AF]">{doc.pages}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc.type)}
                  disabled={isDownloading || downloading !== null}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isMaster
                      ? "bg-[#07B0F2] text-white hover:bg-[#0599d5] disabled:opacity-50"
                      : "bg-[#F1F5F9] text-[#021859] hover:bg-[#E2E8F0] disabled:opacity-50"
                  } disabled:cursor-not-allowed`}
                >
                  {isDownloading ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {isMaster ? "Download Full Report" : "Download"}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Locked Blueprint+ documents (shown to Blueprint users as upgrade nudge) */}
        {lockedDocs.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Included with Blueprint+™</span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <div className="grid gap-2">
              {lockedDocs.map((doc) => (
                <div
                  key={doc.type}
                  className="flex items-start gap-4 rounded-xl border border-dashed border-[#D1D5DB] bg-[#FAFAFA] p-4 opacity-75"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5 grayscale">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#6B7280] text-sm">{doc.label}</h3>
                      <span className="text-[10px] font-bold bg-[#F3F4F6] text-[#9CA3AF] px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Blueprint+
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#D1D5DB]">{doc.audience}</span>
                      <span className="text-[10px] text-[#D1D5DB]">·</span>
                      <span className="text-[10px] text-[#D1D5DB]">{doc.pages}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#07B0F2]/20 bg-gradient-to-r from-[#EFF6FF] to-[#F0F9FF] p-5 text-center">
              <p className="text-sm font-bold text-[#021859] mb-1">
                Get {lockedDocs.length} more implementation-ready documents
              </p>
              <p className="text-xs text-[#4B5563] mb-3 max-w-md mx-auto">
                Blueprint+™ includes week-by-week roadmaps, persona-driven channel strategies, sales playbooks with conversation scripts, and a complete Brand Standards Guide.
              </p>
              <a
                href="https://wunderbardigital.com/wunderbrand-blueprint-plus?utm_source=document_library&utm_medium=upgrade_nudge&utm_campaign=blueprint_to_plus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#07B0F2] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#0599d5] transition-colors"
              >
                Upgrade to Blueprint+™
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#9CA3AF] text-center mt-4">
          All documents are generated from your WunderBrand {tierLabel} data. PDF generation may take a few seconds.
        </p>
      </div>
    </section>
  );
}
