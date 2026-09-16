/**
 * Paste-ready Google Business Profile / local + AI discovery fields from a report.
 */

import { isConsumerFacingBusinessType } from "@/lib/results/audienceFacingCopy";

export type GoogleBusinessPasteFields = {
  showGoogleBusiness: boolean;
  businessName: string;
  /** Short listing description (≈750 chars ideal for GBP). */
  description: string;
  oneLiner: string;
  localSeoNotes: string;
  aeoOverview: string;
  faqLines: string[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function collectFaqLines(aeo: Record<string, unknown> | null): string[] {
  if (!aeo) return [];
  const out: string[] = [];
  const faq = asRecord(aeo.faqStrategy) ?? asRecord(aeo.faqOptimization);
  if (faq) {
    const overview = asString(faq.overview);
    if (overview) out.push(overview);
    const examples = Array.isArray(faq.exampleFaqs)
      ? faq.exampleFaqs
      : Array.isArray(faq.faqs)
        ? faq.faqs
        : [];
    for (const item of examples) {
      if (typeof item === "string" && item.trim()) {
        out.push(item.trim());
        continue;
      }
      const row = asRecord(item);
      if (!row) continue;
      const q = asString(row.question) || asString(row.q);
      const a = asString(row.answer) || asString(row.a);
      if (q && a) out.push(`Q: ${q}\nA: ${a}`);
      else if (q) out.push(q);
    }
  }
  return out.slice(0, 6);
}

export function buildGoogleBusinessPasteFields(
  diagnosticData: Record<string, unknown>,
): GoogleBusinessPasteFields {
  const businessName =
    asString(diagnosticData.companyName) ||
    asString(diagnosticData.businessName) ||
    "Your business";
  const businessType =
    asString(diagnosticData.businessType) || asString(diagnosticData.industry);
  const seo = asRecord(diagnosticData.seoStrategy);
  const aeo = asRecord(diagnosticData.aeoStrategy);
  const companyDescription = asRecord(diagnosticData.companyDescription);
  const oneLiner =
    asString(companyDescription?.oneLiner) ||
    asString(diagnosticData.positioningStatement) ||
    asString(diagnosticData.topOpportunity);
  const localSeoNotes = asString(seo?.localSEOStrategy) || asString(seo?.localSeoStrategy);
  const aeoOverview = asString(aeo?.overview);
  const description =
    asString(companyDescription?.shortDescription) ||
    asString(companyDescription?.about) ||
    asString(seo?.overview) ||
    oneLiner;
  const faqLines = collectFaqLines(aeo);
  const showGoogleBusiness =
    Boolean(localSeoNotes) ||
    isConsumerFacingBusinessType(businessType) ||
    /\b(local|salon|clinic|restaurant|retail|maps|google business)\b/i.test(
      `${businessType} ${localSeoNotes} ${asString(diagnosticData.industry)}`,
    );

  return {
    showGoogleBusiness,
    businessName,
    description: description.slice(0, 750),
    oneLiner: oneLiner.slice(0, 120),
    localSeoNotes,
    aeoOverview,
    faqLines,
  };
}

export function formatGoogleBusinessPasteBlock(fields: GoogleBusinessPasteFields): string {
  const lines = [
    `Google Business Profile — ${fields.businessName}`,
    "",
    fields.oneLiner ? `Short description / tagline:\n${fields.oneLiner}` : "",
    fields.description ? `Business description (paste into GBP):\n${fields.description}` : "",
    fields.localSeoNotes ? `Local SEO / Maps notes:\n${fields.localSeoNotes}` : "",
    "",
    "Tip: Keep categories, hours, and services exact. Add weekly posts from your Search & AI Discovery plan.",
  ].filter(Boolean);
  return lines.join("\n");
}

export function formatAiDiscoveryPasteBlock(fields: GoogleBusinessPasteFields): string {
  const lines = [
    `AI / search answer blocks — ${fields.businessName}`,
    "",
    fields.aeoOverview ? `Why this matters:\n${fields.aeoOverview}` : "",
    fields.faqLines.length
      ? `FAQ / answer-first copy (paste under page H2s):\n\n${fields.faqLines.join("\n\n")}`
      : "Add FAQ blocks that answer how you help, who you serve, and what to do next—in plain language AI systems can quote.",
  ].filter(Boolean);
  return lines.join("\n");
}
