"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { fireACEvent } from "@/lib/fireACEvent";

type Props = {
  reportId?: string;
  primaryPillar?: string | null;
  businessType?: string | null;
  brandAlignmentScore?: number | null;
  companyName?: string | null;
  email?: string;
};

function buildHumanAssistUrl(input: {
  reportId?: string;
  primaryPillar?: string | null;
  businessType?: string | null;
  brandAlignmentScore?: number | null;
}) {
  const url = new URL("https://wunderbardigital.com/talk-to-an-expert");
  url.searchParams.set("utm_source", "wunderbrand_app");
  url.searchParams.set("utm_medium", "results_human_assist");
  url.searchParams.set("utm_campaign", "snapshot_handoff");
  url.searchParams.set("utm_content", "human_assist_branch");
  if (input.reportId) url.searchParams.set("report_id", input.reportId);
  if (input.primaryPillar) url.searchParams.set("primary_pillar", input.primaryPillar);
  if (input.businessType) url.searchParams.set("business_type", input.businessType);
  if (typeof input.brandAlignmentScore === "number") {
    url.searchParams.set("score", String(Math.round(input.brandAlignmentScore)));
  }
  return url.toString();
}

export function HumanAssistBranch({
  reportId,
  primaryPillar,
  businessType,
  brandAlignmentScore,
  companyName,
  email,
}: Props) {
  const [loading, setLoading] = useState(false);

  const onAssistClick = async () => {
    if (loading) return;
    setLoading(true);

    const handoffUrl = buildHumanAssistUrl({
      reportId,
      primaryPillar,
      businessType,
      brandAlignmentScore,
    });

    trackEvent("HUMAN_ASSIST_CLICKED", {
      source: "results_human_assist_branch",
      reportId,
      primaryPillar: primaryPillar ?? null,
      businessType: businessType ?? null,
      score: typeof brandAlignmentScore === "number" ? brandAlignmentScore : null,
      handoffUrl,
      email,
    });

    fireACEvent({
      email,
      eventName: "snapshot_human_assist_clicked",
      tags: ["snapshot:clicked-human-assist"],
      fields: {
        report_id: reportId ?? "",
        primary_pillar: primaryPillar ?? "",
        business_type: businessType ?? "",
        score:
          typeof brandAlignmentScore === "number"
            ? Math.round(brandAlignmentScore)
            : "",
      },
    });

    // Fire-and-continue handoff: if CRM ingest fails, user still reaches booking page.
    try {
      await fetch("/api/inbound/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || "",
          source: "results_human_assist_branch",
          externalRef: reportId ? `human_assist:${reportId}` : "",
          message: `Human assist requested from results page. report_id=${reportId || "n/a"}; primary_pillar=${primaryPillar || "n/a"}; business_type=${businessType || "n/a"}; score=${typeof brandAlignmentScore === "number" ? Math.round(brandAlignmentScore) : "n/a"}; handoff_url=${handoffUrl}`,
        }),
      });
    } catch {
      // Non-blocking by design.
    }

    window.location.href = handoffUrl;
  };

  return (
    <section className="bs-card rounded-xl p-6 sm:p-8 border border-brand-blue/20 bg-brand-blue/5">
      <h3 className="bs-h2 mb-2">Want a quick expert walkthrough?</h3>
      <p className="bs-body-sm text-brand-midnight mb-4 max-w-3xl">
        If you want help prioritizing next steps for your exact score pattern, we can
        review your results together and give you a clear first-action plan.
      </p>
      <button
        type="button"
        onClick={onAssistClick}
        disabled={loading}
        className="btn-secondary"
      >
        {loading ? "Opening..." : "Talk to an Expert"}
      </button>
    </section>
  );
}
