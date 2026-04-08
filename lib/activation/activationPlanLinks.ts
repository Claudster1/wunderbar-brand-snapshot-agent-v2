import type { ActivationTabFocus } from "@/lib/activation/activationPlanAudienceVsCampaign";

export function buildActivationFullPlanHref(
  sectionId: string,
  reportId: string,
  userEmail: string,
  isPreviewReport: boolean,
): string | null {
  if (!reportId.length) return null;
  if (isPreviewReport) {
    return `/preview/results-tabs/activation/${encodeURIComponent(sectionId)}`;
  }
  return `/results/activation/${encodeURIComponent(sectionId)}?reportId=${encodeURIComponent(reportId)}${
    userEmail ? `&email=${encodeURIComponent(userEmail)}` : ""
  }`;
}

export type ResultsActivationHrefMode = "results" | "preview-tabs";

export function buildResultsActivationTabHref(
  reportId: string,
  userEmail: string,
  options?: {
    activationFocus?: ActivationTabFocus;
    mode?: ResultsActivationHrefMode;
    /** Deep-link to highlight/open this plan row in the Activation tab (scroll target `activation-{id}`). */
    activationPlanId?: string;
  },
): string {
  const focusSuffix =
    options?.activationFocus === "audience-journey" ? "&activationFocus=audience-journey" : "";
  const emailSuffix =
    options?.mode === "preview-tabs" || !userEmail ? "" : `&email=${encodeURIComponent(userEmail)}`;
  const planId = options?.activationPlanId?.trim();
  const planSuffix =
    planId && options?.mode !== "preview-tabs" ? `&activationPlanId=${encodeURIComponent(planId)}` : "";
  if (options?.mode === "preview-tabs") {
    const previewPlan = planId ? `&activationPlanId=${encodeURIComponent(planId)}` : "";
    return `/preview/results-tabs?tab=activation${focusSuffix}${previewPlan}`;
  }
  return `/results?reportId=${encodeURIComponent(reportId)}&tab=activation${focusSuffix}${emailSuffix}${planSuffix}`;
}
