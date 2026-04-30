"use client";

import { trackEvent } from "@/lib/analytics";
import { fireACEvent } from "@/lib/fireACEvent";

type Props = {
  reportId?: string;
  email?: string;
  businessName?: string | null;
  businessType?: string | null;
  primaryPillar?: string | null;
  brandAlignmentScore?: number | null;
  source: "results_page" | "legacy_results_page";
};

const TALK_TO_EXPERT_BASE_URL = "https://wunderbardigital.com/talk-to-an-expert";

function buildTalkToExpertUrl({
  reportId,
  email,
  businessName,
  businessType,
  primaryPillar,
  brandAlignmentScore,
  source,
}: Props): string {
  const params = new URLSearchParams({
    utm_source: "wunderbrand_app",
    utm_medium: "human_assist",
    utm_campaign: "snapshot_results_handoff",
    utm_content: source,
  });

  if (reportId) params.set("wb_report_id", reportId);
  if (email) params.set("email", email);
  if (businessName) params.set("company", businessName);
  if (businessType) params.set("wb_business_type", businessType);
  if (primaryPillar) params.set("wb_primary_pillar", primaryPillar);
  if (typeof brandAlignmentScore === "number" && Number.isFinite(brandAlignmentScore)) {
    params.set("wb_score", String(Math.round(brandAlignmentScore)));
  }

  return `${TALK_TO_EXPERT_BASE_URL}?${params.toString()}`;
}

export function HumanAssistCTA(props: Props) {
  const href = buildTalkToExpertUrl(props);

  const onClick = () => {
    trackEvent("HUMAN_ASSIST_CLICKED", {
      target: "talk_to_expert",
      source: props.source,
      reportId: props.reportId,
      primaryPillar: props.primaryPillar ?? undefined,
      businessType: props.businessType ?? undefined,
      score: props.brandAlignmentScore ?? undefined,
      handoffUrl: href,
    });

    fireACEvent({
      email: props.email,
      eventName: "snapshot_human_assist_clicked",
      tags: ["snapshot:human-assist-clicked"],
      fields: {
        report_id: props.reportId ?? "",
        source: props.source,
        primary_pillar: props.primaryPillar ?? "unknown",
        business_type: props.businessType ?? "unknown",
        score: typeof props.brandAlignmentScore === "number" ? Math.round(props.brandAlignmentScore) : 0,
      },
    });
  };

  return (
    <section className="bs-card rounded-xl p-6 sm:p-7 border border-brand-border">
      <h3 className="bs-h3 mb-2">Need a fast path with an expert?</h3>
      <p className="bs-body-sm text-brand-muted">
        Get a guided walkthrough of your score, priority actions, and the highest-leverage next step for your brand.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="btn-secondary inline-flex mt-4"
      >
        Talk to an Expert
      </a>
    </section>
  );
}
