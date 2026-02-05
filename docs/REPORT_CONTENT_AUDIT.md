# Brand Snapshot Suite — Report Content Audit

**Reference:** Feature comparison table on `wunderbardigital.com/brand-snapshot-suite`  
**Expectation:** Each report pulls in content from lower tiers; Brand Blueprint+™ is the highest tier and should include **20+ pages** and comprehensive "Advanced campaign prompts."  
**Finding:** Higher tiers do **not** aggregate lower-tier content; Blueprint+ PDF is **~8 pages** and shows only the AI prompts passed in the request (e.g. 4 prompts if that’s what’s sent).

**How to keep report and PDF in sync:** See **[REPORT_AND_PDF_CONTENT_SPEC.md](./REPORT_AND_PDF_CONTENT_SPEC.md)** for:
- One canonical content list per tier (same sections in report view and PDF)
- Product-name-only rule (no “from Snapshot” when including lower-tier content)
- Shared data shapes per tier and a verification checklist

---

## Detailed content inventory (what should be included)

Below is the **detailed content** that should appear in each tier, with field names, formats (e.g. color palette with swatches + hex), and where it exists in code. Higher tiers should **pull in** all content from lower tiers plus their own.

### SNAPSHOT™ (Free) — Foundation

| Content item | Field(s) | Format | Where it exists |
|--------------|----------|--------|-----------------|
| **Brand Alignment Score™** | `brandAlignmentScore` | number 0–100 | Results UI, PDF (`BrandSnapshotReport`) |
| **Five-Pillar Brand Framework** | `pillarScores` | `{ positioning, messaging, visibility, credibility, conversion }` — each 0–20 | Results UI, PDF |
| **Pillar-level scoring** | `pillarScores` | Same as above | PDF: score bars / gauges per pillar |
| **Pillar-level insights** | `pillarInsights` | `{ positioning, messaging, visibility, credibility, conversion }` — each string | Results UI, PDF: “Insight” block per pillar |
| **Strategic alignment overview** | Score + summary copy | Score label (Excellent/Strong/Developing/Needs focus) + 1–2 sentence summary | Results hero, PDF intro |
| **Recommendations per pillar** | `recommendations` | `{ positioning, messaging, visibility, credibility, conversion }` — each string | PDF: “Recommendation” or “Opportunity” block per pillar |
| **Business context** | `userName`, `businessName`, `industry`, `website`, `socials` | strings / array | PDF header, optional |

---

### SNAPSHOT+™ — Adds to Snapshot

Everything in **Snapshot** plus:

| Content item | Field(s) | Format | Where it exists |
|--------------|----------|--------|-----------------|
| **Brand persona** | `enriched_persona` (HTML) / `targetCustomers` or persona copy (PDF) | string or `{ description }` | Snapshot+ **HTML** page; Snapshot+ PDF has `targetCustomers`, `personalityWords` (BrandSnapshotPlusPDF) |
| **Brand archetype** | `enriched_archetype` (HTML) | string or `{ name, summary?, description? }` | Snapshot+ **HTML** page; not in BrandSnapshotPlusPDF — **missing in Snapshot+ PDF** |
| **Brand voice definition** | `enriched_voice` (HTML) | string or `{ summary?, description?, pillars?: string[] }` | Snapshot+ **HTML** page; not in BrandSnapshotPlusPDF — **missing in Snapshot+ PDF** |
| **Recommended color palette (with swatches + hex)** | `enriched_color_palette` (HTML) | `Array<{ name, hex, role?, meaning? }>` — swatch + hex# per color | Snapshot+ **HTML** page (grid with swatch + name/role/meaning); not in BrandSnapshotPlusPDF — **missing in Snapshot+ PDF** |
| **Priority focus area (primary pillar)** | `primaryPillar` | one of five pillar keys | Snapshot+ PDF/HTML: “Primary Opportunity” / focus area callout |
| **Context coverage** | `contextCoverage` | number 0–100 | Snapshot+ PDF/HTML: meter |
| **Core brand opportunities** | `brandOpportunities` | string | BrandSnapshotPlusPDF |
| **Audience summary** | `targetCustomers` | string | BrandSnapshotPlusPDF |
| **Competitor awareness** | `competitorNames` | string[] | BrandSnapshotPlusPDF |
| **Brand personality (words)** | `personalityWords` | string[] | BrandSnapshotPlusPDF |
| **Messaging gaps** | `messagingGaps` | string | BrandSnapshotPlusPDF (merged with recommendations.messaging) |
| **Visibility plan** | `visibilityPlan` | string | BrandSnapshotPlusPDF |
| **Visual identity notes** | `visualIdentityNotes` | string | BrandSnapshotPlusPDF |
| **AEO recommendations** | `aeoRecommendations` | `{ keywordClarity?, messagingStructure?, visualOptimization?, performanceHeuristics?, prioritizationMatrix?, practicalActions?, industryGuidance? }` | BrandSnapshotPlusPDF: full AEO section |
| **Opportunities map / roadmap** | `opportunities_map`, `roadmap_30`, `roadmap_60`, `roadmap_90` (HTML) | strings | Snapshot+ **HTML** only — **missing in Snapshot+ PDF** |
| **AI prompt starter pack** | `aiPrompts` | string[] | BrandSnapshotPlusPDF (if present) |

**Gap:** Snapshot+ **HTML** has persona, archetype, voice, color palette (with swatches + hex), and 30/60/90 roadmap; Snapshot+ **PDF** (BrandSnapshotPlusPDF) does not include archetype, voice, or color palette sections — those should be added for consistency.

---

### BLUEPRINT™ — Should include Snapshot + Snapshot+ + Blueprint-specific

**Currently in Blueprint PDF** (`app/reports/BlueprintDocument`, `buildBlueprint`):

| Content item | Field(s) | Format | In API-used PDF? |
|--------------|----------|--------|------------------|
| Cover / intro | `userName` | string | ✅ |
| **Brand essence** | `brandEssence` | string (paragraph) | ✅ |
| **Brand promise** | `brandPromise` | string | ✅ |
| **Differentiation** | `differentiation` | string | ✅ |
| **Brand persona** | `persona` | `{ summary?: string }` | ✅ |
| **Brand archetype** | `archetype` | `{ summary?: string }` | ✅ |
| **Tone of voice** | `toneOfVoice` | `Array<{ name, detail }>` | ✅ |
| **Messaging pillars** | `messagingPillars` | `Array<{ title, detail }>` | ✅ |
| **Recommended color palette (swatches + hex)** | `colorPalette` | `Array<{ name, hex, role?, meaning? }>` — display as swatch + hex# | ✅ (single page, list; no swatch component in app/reports version — **ensure swatches + hex#** in final) |
| **AI prompt library** | `aiPrompts` | `Array<{ name, prompt }>` | ✅ (one page) |
| Next steps | copy | static | ✅ |

**Missing from Blueprint (should pull in from lower tiers):**

- Brand Alignment Score™
- Five-pillar framework (pillar names + scores)
- Pillar-level insights and recommendations (Snapshot)
- Strategic alignment overview
- Snapshot+ persona/archetype/voice/color (if richer than Blueprint’s own)
- Priority focus area (primary pillar)
- Context coverage
- AEO recommendations (Snapshot+)
- 30/60/90 roadmap (Snapshot+ HTML)

**Alternate Blueprint type** (`BrandBlueprintReport` in `src/pdf/BrandBlueprintPDF.tsx`) also includes: `valueProposition`, `brandProofPoints`, `narrative`, `toneGuidelines`, `audienceSegments`, `brandArchetype`, `brandTheme`, `contentPillars`, `visualDirection`, `opportunities`, `aeoIntegratedStrategy` (messagingFramework, positioningForAI, contentStrategy, visibilityPriorities, competitorGapAnalysis). Use this as the full “what Blueprint could include” list.

---

### BLUEPRINT+™ — Should include Snapshot + Snapshot+ + Blueprint + Blueprint+-specific

**Currently in Blueprint+ PDF** (`app/reports/BlueprintPlusDocument`, `buildBlueprintPlus`):

| Content item | Field(s) | Format | In API-used PDF? |
|--------------|----------|--------|------------------|
| Cover / intro | `userName` | string | ✅ |
| **Brand story framework** | `brandStory` | `{ short, long }` — elevator pitch + long narrative | ✅ |
| **Positioning statement** | `positioning.statement` | string | ✅ |
| **Differentiation matrix** | `positioning.differentiators` | `Array<{ name, detail }>` | ✅ |
| **Customer journey map** | `journey` | `Array<{ stage, goal, emotion, opportunities }>` | ✅ |
| **12-month content roadmap** | `contentRoadmap` | `Array<{ month, theme }>` | ✅ |
| **Visual direction** | `visualDirection` | `Array<{ category, description }>` | ✅ |
| **Brand personality** | `personality` | string | ✅ |
| **Decision filters** | `decisionFilters` | string[] | ✅ |
| **AI prompt library (extended)** | `aiPrompts` | `Array<{ name, prompt }>` | ✅ (one page) |
| Additional sections | `additionalSections` | `Array<{ title, content }>` | ✅ (optional) |

**Missing from Blueprint+ (should pull in from lower tiers):**

- **From Snapshot:** Brand Alignment Score™, five-pillar framework, pillar scores, pillar insights, recommendations, strategic alignment overview, business context.
- **From Snapshot+:** Persona, archetype, brand voice (with tone pillars), **recommended color palette with swatches + hex#**, priority focus area, context coverage, AEO section, opportunities map, 30/60/90 roadmap, audience/competitors/personality words, visual identity notes.
- **From Blueprint:** Brand essence, brand promise, differentiation (full), persona summary, archetype summary, tone-of-voice list, **messaging pillars**, **recommended color palette (swatches + hex#)**, Blueprint AI prompts.

**Richer Blueprint+ type** (`BrandBlueprintPlusPDFProps` in `src/pdf/documents/BrandBlueprintPlusPDF.tsx`) also includes: `completeAEOSystem` (platformOptimizations for ChatGPT/Perplexity/Google AI, implementationRoadmap, measurementGuidance, aiPrompts with name/prompt/purpose), and contentRoadmap with `messagingAngles`, `growthPriorities`, `aeoStrategies` per month. Use this as the full “what Blueprint+ could include” list.

---

### Color palette format (all tiers that show it)

Where a **recommended color palette** appears, it should include:

- **Per color:** `name`, `hex` (e.g. `#021859`), optional `role` (e.g. Primary, Accent), optional `meaning` (e.g. “Trust and authority”).
- **Display:** Visual **swatch** (rectangle with `backgroundColor: hex`) + label showing **name** and **hex#** (e.g. “Navy — #021859”). See `ColorSwatch` in `src/pdf/components/ColorSwatch.tsx` and Snapshot+ HTML color grid.

---

### Messaging pillars format

Where **messaging pillars** or **content pillars** appear:

- **Blueprint:** `messagingPillars` = `Array<{ title, detail }>` (each pillar has a title and paragraph).
- **BrandBlueprintReport:** `contentPillars` = `Array<{ title, description }>`.
- Display: section per pillar with heading + body text.

---

### AI prompts format

- **Blueprint:** `aiPrompts` = `Array<{ name, prompt }>` (or array of strings in some code paths).
- **Blueprint+:** Same; plus `completeAEOSystem.aiPrompts` can add `{ name, prompt, purpose }`.
- **Target:** 20+ prompts for Blueprint+ “Advanced campaign prompts” (expand `src/lib/prompts/blueprintPlus/promptPacks.ts` and ensure all are passed into the PDF).

---

### Quick reference: content checklist by tier

| Content item | Snapshot | Snapshot+ | Blueprint | Blueprint+ |
|--------------|:--------:|:---------:|:---------:|:----------:|
| Brand Alignment Score™ (0–100) | ✅ | ✅ | should pull in | should pull in |
| Five-pillar scores (0–20 each) | ✅ | ✅ | should pull in | should pull in |
| Pillar insights (per pillar) | ✅ | ✅ | should pull in | should pull in |
| Pillar recommendations (per pillar) | ✅ | ✅ | should pull in | should pull in |
| Strategic alignment overview | ✅ | ✅ | should pull in | should pull in |
| Primary focus area / priority pillar | — | ✅ | should pull in | should pull in |
| Context coverage % | — | ✅ | should pull in | should pull in |
| **Brand persona** | — | ✅ (HTML; PDF has targetCustomers) | ✅ | should pull in + own |
| **Brand archetype** (name + summary) | — | ✅ (HTML only; missing in PDF) | ✅ | should pull in + own |
| **Brand voice definition** (summary + tone pillars) | — | ✅ (HTML only; missing in PDF) | ✅ (tone of voice list) | should pull in + own |
| **Recommended color palette** (swatches + hex#, name, role, meaning) | — | ✅ (HTML only; missing in PDF) | ✅ | should pull in + own |
| Brand essence | — | — | ✅ | should pull in |
| Brand promise | — | — | ✅ | should pull in |
| Differentiation (narrative) | — | — | ✅ | should pull in + differentiators |
| **Messaging pillars** (title + detail per pillar) | — | — | ✅ | should pull in + own |
| Tone of voice (name + detail per item) | — | — | ✅ | should pull in |
| Proof points / brand proof | — | — | ✅ (BrandBlueprintPDF) | should pull in |
| Narrative / brand story (long + short) | — | — | — | ✅ |
| Positioning statement | — | — | — | ✅ |
| Differentiation matrix (name + detail) | — | — | — | ✅ |
| Customer journey map (stage, goal, emotion, opportunities) | — | — | — | ✅ |
| 12-month content roadmap (month, theme, messagingAngles, aeoStrategies) | — | — | — | ✅ |
| Visual direction (category + description) | — | — | — | ✅ |
| Brand personality (paragraph or words) | — | ✅ (words in PDF) | — | ✅ |
| Decision filters (list) | — | — | — | ✅ |
| AEO recommendations / complete AEO system | — | ✅ (PDF) | — | ✅ (BrandBlueprintPlusPDF) |
| 30/60/90 roadmap (Snapshot+ HTML) | — | ✅ (HTML only) | should pull in | should pull in |
| Opportunities map | — | ✅ (HTML) | — | should pull in |
| AI prompt library (name + prompt; 20+ for Blueprint+) | — | optional | ✅ | ✅ (extended) |

Use this table to verify each report tier includes every content type it should (including “should pull in” from lower tiers).

---

## 1. Feature table vs implementation

### BRAND FOUNDATION & ALIGNMENT (all tiers per table)

| Feature | Snapshot (Free) | Snapshot+ | Blueprint | Blueprint+ |
|--------|------------------|-----------|-----------|-------------|
| **Brand Alignment Score™** | ✅ In results/PDF | ✅ In Snapshot+ report/PDF | ❌ **Missing** | ❌ **Missing** |
| **Five-Pillar Brand Framework** | ✅ | ✅ | ❌ **Missing** | ❌ **Missing** |
| **Pillar-Level Scoring & Insights** | ✅ | ✅ | ❌ **Missing** | ❌ **Missing** |
| **Strategic Alignment Overview** | ✅ (score + summary) | ✅ | ❌ **Missing** | ❌ **Missing** |

**Gap:** Blueprint and Blueprint+ PDFs do **not** include any Snapshot/Snapshot+ foundation (score, pillars, insights, strategic overview). They are standalone strategy docs.

---

### STRATEGIC INSIGHT & DIRECTION

| Feature | Snapshot | Snapshot+ | Blueprint | Blueprint+ |
|--------|----------|-----------|-----------|------------|
| **Clear brand strengths & gaps** | ✅ (insights) | ✅ | ⚠️ Indirect (essence/promise) | ⚠️ Indirect |
| **Priority focus areas identified** | ❌ | ✅ (primary pillar) | ❌ **Missing** | ❌ **Missing** |
| **In-depth pillar analysis** | — | — | ❌ **Missing** | ❌ **Missing** |

**Gap:** Blueprint/Blueprint+ do not surface “priority focus areas” or “in-depth pillar analysis” from Snapshot/Snapshot+. No pillar-by-pillar deep dive in Blueprint or Blueprint+.

---

### BRAND STRATEGY & MESSAGING

| Feature | Snapshot | Snapshot+ | Blueprint | Blueprint+ |
|--------|----------|-----------|-----------|------------|
| **Positioning guidance** | ❌ | ✅ (persona, archetype, voice) | ✅ (essence, promise, differentiation) | ✅ (positioning statement, differentiators) |
| **Messaging framework** | ❌ | ✅ | ✅ (messaging pillars) | ⚠️ (in brand story/positioning) |
| **Brand voice definition** | ❌ | ✅ | ✅ (tone of voice) | ⚠️ (personality) |
| **Brand principles & narrative** | ❌ | ✅ (principles/narrative in copy) | ✅ (persona, archetype) | ✅ (brand story, narrative) |

**Gap:** Blueprint/Blueprint+ have their own strategy content but do **not** repeat or reference Snapshot+ positioning/voice/narrative; they don’t “pull in” Snapshot+ sections.

---

### AI-READY STRATEGY ASSETS

| Feature | Snapshot | Snapshot+ | Blueprint | Blueprint+ |
|--------|----------|-----------|-----------|------------|
| **Structured brand data for AI** | ✅ (score, pillars, insights) | ✅ | ✅ (essence, voice, pillars, etc.) | ✅ (positioning, journey, roadmap, etc.) |
| **Advanced campaign prompts** | ❌ | ❌ | ✅ (one page, from `data.aiPrompts`) | ✅ (one page, from `data.aiPrompts`) |

**Gap:**  
- **Count:** Blueprint and Blueprint+ each render **one PDF page** of “AI Prompt Library.” The number of prompts is whatever is in `data.aiPrompts` (e.g. **4** if the client sends 4).  
- **Source:** `src/lib/prompts/blueprintPlus/promptPacks.ts` defines **6** prompts total (Positioning 2, Messaging 1, Visibility 1, Credibility 1, Conversion 1). If the API/UI only passes 4, the PDF and UI will show 4.  
- **Expectation:** “Advanced campaign prompts” suggests a substantial prompt library (e.g. 15–30+), not 4–6.

---

## 2. Tier stacking (pull in lower tier)

**Expectation:** Each report should pull in content from lower tiers so the report is comprehensive.

**Current behavior:**

- **Blueprint** (`app/reports/BlueprintDocument.tsx` + `buildBlueprint`):  
  Uses only Blueprint-specific inputs (essence, promise, persona, archetype, tone, messaging pillars, color palette, aiPrompts). **Does not** pull in Snapshot or Snapshot+ (no score, no pillars, no pillar insights, no Snapshot+ persona/archetype/voice/palette).

- **Blueprint+** (`app/reports/BlueprintPlusDocument.tsx` + `buildBlueprintPlus`):  
  Uses only Blueprint+ inputs (brand story, positioning, journey, content roadmap, visual direction, personality, decision filters, aiPrompts, additionalSections). **Does not** pull in Snapshot, Snapshot+, or Blueprint content.

**Result:** Reports are siloed. Blueprint+ does not aggregate Snapshot + Snapshot+ + Blueprint into one 20+ page document.

---

## 3. Blueprint+ page count and content

**Expectation:** Brand Blueprint+ is the highest tier and should include **20+ pages** of content.

**Current implementation:**

- **API-used PDF:** `app/reports/BlueprintPlusDocument.tsx` (used by `app/api/blueprint-plus/route.ts`).
- **Page breakdown:**  
  1. Cover  
  2. Brand Story (long + short)  
  3. Positioning (statement + differentiators)  
  4. Customer Journey  
  5. 12-Month Content Roadmap  
  6. Visual Direction  
  7. Brand Personality + Decision Filters  
  8. **AI Prompt Library** (single page; all prompts listed here)  
  + Optional `additionalSections` (title + content per section).

- **Total:** **8 fixed pages** + a few more if `additionalSections` is populated. No logic to expand to 20+ pages by pulling in Snapshot/Snapshot+/Blueprint.

**Alternate PDF:** `src/pdf/documents/BrandBlueprintPlusPDF.tsx` has more sections (e.g. Complete AEO System, platform optimizations, implementation roadmap, measurement, more prompt blocks) but is **not** used by the Blueprint+ API route; the API uses `app/reports/BlueprintPlusDocument.tsx`.

---

## 4. AI prompts count

- **Blueprint**  
  - PDF: One “AI Prompt Library” page; items from `data.aiPrompts` (from request).  
  - No default list in code; count is whatever the client sends (e.g. **4**).

- **Blueprint+**  
  - **PDF:** Same — one page, `data.aiPrompts` (e.g. **4** if that’s what’s sent).  
  - **App UI:** `BLUEPRINT_PLUS_PROMPT_PACKS_DETAILED` in `src/lib/prompts/blueprintPlus/promptPacks.ts` = **6** prompts (2 positioning, 1 each for messaging, visibility, credibility, conversion).  
  - If the UI or API only sends 4 of these (or 4 from another source), the report will show “4 AI prompts.”

**Gap:** Table promises “Advanced campaign prompts” for Blueprint/Blueprint+. Current state: one page of prompts, 4–6 prompts in code, no large “campaign prompt library” (e.g. 15–30+).

---

## 5. Summary: what’s missing

### For “each report pulls in lower tier”

1. **Blueprint PDF** should include (from Snapshot + Snapshot+):  
   - Brand Alignment Score™  
   - Five-Pillar Brand Framework  
   - Pillar-Level Scoring & Insights  
   - Strategic Alignment Overview  
   - Priority focus areas (primary pillar)  
   - Snapshot+ persona, archetype, voice, palette where relevant  

2. **Blueprint+ PDF** should include:  
   - Everything above (Snapshot + Snapshot+), plus  
   - Full Blueprint content (essence, promise, differentiation, persona, archetype, tone, messaging pillars, color palette, Blueprint AI prompts)  
   - Then Blueprint+ exclusive content (brand story, positioning platform, journey, roadmap, visual direction, personality, decision filters, **extended** AI prompt library).

### For “Blueprint+ = 20+ pages”

3. **Page count:**  
   - Today: ~8 pages + optional `additionalSections`.  
   - Need: Structure and data flow so Blueprint+ PDF is explicitly 20+ pages (e.g. Part 1: Snapshot foundation, Part 2: Snapshot+ strategic insight, Part 3: Blueprint strategy & messaging, Part 4: Blueprint+ advanced (story, positioning, journey, roadmap, AEO, prompts)).

4. **Unify PDF implementation:**  
   - Decide whether Blueprint+ is driven by `app/reports/BlueprintPlusDocument.tsx` or `src/pdf/documents/BrandBlueprintPlusPDF.tsx` (which has more sections).  
   - Ensure the chosen component receives all lower-tier data and renders 20+ pages.

### For “Advanced campaign prompts”

5. **Prompt library size:**  
   - Define how many “advanced campaign prompts” Blueprint and Blueprint+ should include (e.g. 15–30+).  
   - Expand `src/lib/prompts/blueprintPlus/promptPacks.ts` (and any Blueprint prompt source) to that count.  
   - Ensure the API/UI always passes the full list into `data.aiPrompts` so the PDF and UI show the full library (and consider multiple PDF pages if needed).

6. **In-depth pillar analysis:**  
   - Add a dedicated “In-depth pillar analysis” section for Blueprint and Blueprint+, using Snapshot/Snapshot+ pillar scores and insights (and optionally Snapshot+ persona/archetype/voice per pillar).

---

## 6. Files to change (implementation checklist)

| Goal | Files / areas |
|------|----------------|
| Blueprint PDF includes Snapshot + Snapshot+ content | `app/reports/BlueprintDocument.tsx`, `src/engine/blueprintEngine.ts`, API that calls `buildBlueprint` (must pass Snapshot/Snapshot+ report or IDs). |
| Blueprint+ PDF includes Snapshot + Snapshot+ + Blueprint content | `app/reports/BlueprintPlusDocument.tsx`, `src/engines/blueprintPlusEngine.ts`, API that calls `buildBlueprintPlus` (must pass lower-tier data). |
| Blueprint+ = 20+ pages | Same PDF components; add sections for Snapshot foundation, Snapshot+ strategic insight, Blueprint strategy, then Blueprint+ exclusive. Consider using `src/pdf/documents/BrandBlueprintPlusPDF.tsx` or merging its sections into the API-used document. |
| Expand AI prompt library | `src/lib/prompts/blueprintPlus/promptPacks.ts`, Blueprint prompt source, and any code that sets `data.aiPrompts` for PDF generation. |
| In-depth pillar analysis in Blueprint/Blueprint+ | Add new section(s) in Blueprint and Blueprint+ PDFs that consume pillar scores and insights (and optionally Snapshot+ enrichment). |

This audit aligns the current implementation with the feature table and your stated rules: tier stacking, 20+ pages for Blueprint+, and a full advanced campaign prompt library.
