"use client";

import type { ReactNode } from "react";
import {
  EmailLifecycleFlowVisual,
  ExecutionQuarterTimelineVisual,
  FunnelVisual,
  LeadMagnetFlowVisual,
  PrSignalChainVisual,
  SeoAeoIntentVisual,
  ThoughtLeadershipFlywheelVisual,
} from "@/components/results/StoryVisuals";

const PAID_FUNNEL_STEPS = [
  { label: "Traffic Layer", detail: "Audience-targeted acquisition and message testing." },
  { label: "Nurture Layer", detail: "Segmented journeys and proof progression." },
  { label: "Conversion Layer", detail: "Offer clarity, clear next-step wording, and handoff rules." },
  { label: "Optimization Layer", detail: "Weekly success check review and spend reallocation." },
];

/** Channel-specific reference diagram for campaign (non-foundation) playbooks. */
export function activationCampaignSectionChart(
  sectionId: string,
  showPaidStructured: boolean,
): ReactNode {
  switch (sectionId) {
    case "lead-magnet-planning":
      return <LeadMagnetFlowVisual />;
    case "email-lifecycle":
      return <EmailLifecycleFlowVisual />;
    case "seo-aeo":
      return <SeoAeoIntentVisual />;
    case "paid-ads":
      if (showPaidStructured) return null;
      return <FunnelVisual steps={PAID_FUNNEL_STEPS.map((s) => ({ ...s }))} />;
    case "thought-leadership":
      return <ThoughtLeadershipFlywheelVisual />;
    case "pr-plan":
      return <PrSignalChainVisual />;
    case "execution-roadmap":
      return <ExecutionQuarterTimelineVisual />;
    default:
      return null;
  }
}
