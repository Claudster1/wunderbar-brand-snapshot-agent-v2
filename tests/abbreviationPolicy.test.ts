import { describe, expect, it } from "vitest";
import {
  PRODUCT_ACRONYM_GLOSSARY,
  firstReferenceForm,
  glossaryTerm,
} from "@/lib/copy/abbreviationPolicy";

describe("abbreviationPolicy", () => {
  it("spells out common acronyms on first reference", () => {
    expect(firstReferenceForm("CTA")).toBe("call to action (CTA)");
    expect(firstReferenceForm("SEO")).toBe("search engine optimization (SEO)");
    expect(firstReferenceForm("ICP")).toBe("ideal customer profile (ICP)");
  });

  it("builds glossary rows with expanded term labels", () => {
    expect(glossaryTerm("AEO")).toEqual({
      term: "answer engine optimization (AEO)",
      definition: expect.stringMatching(/AI|answer/i),
    });
  });

  it("includes core product acronyms in the shared glossary", () => {
    const terms = PRODUCT_ACRONYM_GLOSSARY.map((e) => e.term);
    for (const needed of ["CTA", "ICP", "SEO", "AEO", "KPI", "GTM", "QA", "POV"]) {
      expect(terms).toContain(needed);
    }
  });
});
