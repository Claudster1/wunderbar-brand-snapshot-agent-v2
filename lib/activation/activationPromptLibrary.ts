import type { ProductTier } from "@/components/ResultsTabNav";
import {
  PROMPT_SECTIONS_BY_PRODUCT_TIER,
  SECTION_META,
  type SectionId,
} from "@/lib/promptPackData";

/** Preferred prompt-library sections for each Activation playbook (first available for the tier wins). */
const ACTIVATION_PLAN_PROMPT_FALLBACKS: Record<string, SectionId[]> = {
  "email-lifecycle": ["email"],
  "seo-aeo": ["content-seo", "website"],
  "paid-ads": ["campaigns", "lead-gen", "messaging"],
  "thought-leadership": ["social", "content-seo"],
  "pr-plan": ["social", "messaging"],
  "lead-magnet-planning": ["lead-gen", "messaging"],
  "audience-segments": ["persona-messaging", "messaging"],
  "journey-orchestration": ["full-funnel", "strategic-planning"],
  "competitive-motion-plan": ["advanced-strategy", "messaging"],
  "execution-roadmap": ["strategic-planning", "campaigns"],
};

export function activationPromptLibraryDomId(sectionId?: SectionId): string {
  return sectionId ? `activation-prompt-${sectionId}` : "activation-prompt-library";
}

export function promptSectionsForProductTier(productTier: ProductTier): SectionId[] {
  return PROMPT_SECTIONS_BY_PRODUCT_TIER[productTier] ?? [];
}

export function hasActivationPromptLibrary(productTier: ProductTier): boolean {
  return promptSectionsForProductTier(productTier).length > 0;
}

/** Best prompt pack section for a channel playbook at this tier, or null if none. */
export function promptSectionForActivationPlan(
  planId: string,
  productTier: ProductTier,
): SectionId | null {
  const available = new Set(promptSectionsForProductTier(productTier));
  if (available.size === 0) return null;
  const preferred = ACTIVATION_PLAN_PROMPT_FALLBACKS[planId] ?? [];
  for (const id of preferred) {
    if (available.has(id)) return id;
  }
  return null;
}

export function promptSectionLabel(sectionId: SectionId): string {
  return SECTION_META[sectionId]?.label ?? sectionId;
}

export function scrollToActivationPromptSection(sectionId?: SectionId): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(activationPromptLibraryDomId(sectionId));
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}
