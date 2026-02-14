# Report & PDF Content Spec — Single Source of Truth

**Goals:**
1. **Report content mirrors PDF content** — Whatever sections appear in the web report (HTML/view) for a tier must appear in the PDF for that tier, in the same logical order. No “report has X but PDF doesn’t” or vice versa.
2. **Product name only** — Use only that tier’s product name (e.g. “WunderBrand Snapshot+™ Report”). When including expanded content that aggregates lower-tier data (score, pillars, persona, etc.), **do not reference** other products (e.g. don’t say “from your WunderBrand Snapshot™” or “Snapshot foundation”). Present everything as part of *this* report (e.g. “WunderBrand Score™”, “Pillar Analysis”, “Brand Persona”).
3. **Expanded content by tier** — Each tier includes all content from lower tiers plus its own. The *content* is cumulative; the *naming* is only the current product.

This doc defines the **canonical content per tier** (one list that applies to both report and PDF), **data shapes** you can share between report and PDF, and **how to verify** they stay in sync.

---

## 1. Rules

| Rule | Meaning |
|------|--------|
| **One content list per tier** | For each tier there is a single ordered list of sections. Both the **report view** and the **PDF** must include exactly these sections (same order, same data). |
| **Product name only** | Title and intro use only that product’s name (WunderBrand Snapshot™, WunderBrand Snapshot+™, WunderBrand Blueprint™, WunderBrand Blueprint+™). Body copy does not say “from your Snapshot” or “Snapshot+ identified”; it just presents the section (e.g. “Brand Persona”, “Pillar Analysis”). |
| **Shared data per tier** | Report page and PDF component for a tier should consume the **same data shape** (same interface). Build that data once (API or transform layer) and pass it to both. |

---

## 2. Canonical content by tier

Each tier has one **section list**. Both report (HTML) and PDF must render these sections in this order. Section titles and content should match; only layout (web vs PDF) differs.

### Tier 1: WunderBrand Snapshot™

**Product name in UI/PDF:** “WunderBrand Snapshot™” only (e.g. “Your WunderBrand Snapshot™ Report”).

| # | Section | Data fields | Report view | PDF |
|---|---------|-------------|-------------|-----|
| 1 | Cover / intro | `userName`, `businessName`, optional `industry` | ✅ | ✅ |
| 2 | WunderBrand Score™ | `brandAlignmentScore` (0–100), score label (Excellent/Strong/Developing/Needs focus) | ✅ | ✅ |
| 3 | Strategic alignment overview | Short summary (1–2 sentences) using score + pillars | ✅ | ✅ |
| 4 | Five-pillar framework | `pillarScores` (0–20 each), `pillarInsights` (string per pillar), `recommendations` (string per pillar) | ✅ | ✅ |
| 5 | Business context (optional) | `website`, `socials` | optional | optional |

**Data shape (use for both report and PDF):**  
`BrandSnapshotReport` in `src/pdf/BrandSnapshotPDF.tsx` (or equivalent: `userName`, `businessName`, `industry`, `website`, `socials`, `brandAlignmentScore`, `pillarScores`, `pillarInsights`, `recommendations`).

---

### Tier 2: WunderBrand Snapshot+™

**Product name in UI/PDF:** “WunderBrand Snapshot+™” only.

**Content:** All sections from **WunderBrand Snapshot™** (1–5) in the same order, then the following. Do not label them as “from Snapshot”; they are just the next sections of this report.

| # | Section | Data fields | Report view | PDF |
|---|---------|-------------|-------------|-----|
| 1–5 | *(Same as WunderBrand Snapshot™ above)* | *(same)* | ✅ | ✅ |
| 6 | Priority focus area | `primaryPillar`, short explanation | ✅ | ✅ |
| 7 | Context coverage | `contextCoverage` (0–100), meter + copy | ✅ | ✅ |
| 8 | Brand persona | `persona` (string or `{ summary }`) | ✅ | **Add to PDF** |
| 9 | Brand archetype | `archetype` (string or `{ name, summary }`) | ✅ | **Add to PDF** |
| 10 | Brand voice | `voice` (string or `{ summary, pillars?: string[] }`) | ✅ | **Add to PDF** |
| 11 | Recommended color palette | `colorPalette`: `Array<{ name, hex, role?, meaning? }>` — swatch + hex# each | ✅ | **Add to PDF** |
| 12 | Core brand opportunities | `brandOpportunities` | ✅ | ✅ |
| 13 | Audience & competitors | `targetCustomers`, `competitorNames` | ✅ | ✅ |
| 14 | Brand personality (words) | `personalityWords` | ✅ | ✅ |
| 15 | Messaging / visibility / visual notes | `messagingGaps`, `visibilityPlan`, `visualIdentityNotes` | ✅ | ✅ |
| 16 | AEO recommendations | `aeoRecommendations` (object with keywordClarity, messagingStructure, etc.) | ✅ | ✅ |
| 17 | 30/60/90 roadmap | `roadmap_30`, `roadmap_60`, `roadmap_90` | ✅ | **Add to PDF** |
| 18 | Opportunities map | `opportunities_map` | ✅ | **Add to PDF** (if used in report) |
| 19 | AI prompt starter pack (optional) | `aiPrompts` (string[] or `{ name, prompt }[]`) | optional | optional |

**Data shape:** Extend Snapshot type with: `primaryPillar`, `contextCoverage`, `persona`, `archetype`, `voice`, `colorPalette`, `brandOpportunities`, `targetCustomers`, `competitorNames`, `personalityWords`, `messagingGaps`, `visibilityPlan`, `visualIdentityNotes`, `aeoRecommendations`, `roadmap_30`, `roadmap_60`, `roadmap_90`, `opportunities_map`, `aiPrompts`. Use this **single** type for both Snapshot+ report view and Snapshot+ PDF.

---

### Tier 3: WunderBrand Blueprint™

**Product name in UI/PDF:** “WunderBrand Blueprint™” only.

**Content:** All sections from **WunderBrand Snapshot™** (1–5) and **WunderBrand Snapshot+™** (6–19) in the same order, then the following. No “from Snapshot” or “from Snapshot+”; just continue with Blueprint sections.

| # | Section | Data fields | Report view | PDF |
|---|---------|-------------|-------------|-----|
| 1–19 | *(Same as WunderBrand Snapshot+™ above)* | *(same)* | ✅ | ✅ |
| 20 | Brand essence | `brandEssence` | ✅ | ✅ |
| 21 | Brand promise | `brandPromise` | ✅ | ✅ |
| 22 | Differentiation | `differentiation` | ✅ | ✅ |
| 23 | Brand persona (Blueprint) | `persona` (merge or override Snapshot+ persona) | ✅ | ✅ |
| 24 | Brand archetype (Blueprint) | `archetype` (merge or override) | ✅ | ✅ |
| 25 | Tone of voice | `toneOfVoice`: `Array<{ name, detail }>` | ✅ | ✅ |
| 26 | Messaging pillars | `messagingPillars`: `Array<{ title, detail }>` | ✅ | ✅ |
| 27 | Recommended color palette (Blueprint) | `colorPalette`: same format; merge or override | ✅ | ✅ (swatches + hex#) |
| 28 | AI prompt library | `aiPrompts`: `Array<{ name, prompt }>` | ✅ | ✅ |
| 29 | Next steps | Static copy | ✅ | ✅ |

**Data shape:** Extend Snapshot+ type with: `brandEssence`, `brandPromise`, `differentiation`, `persona`, `archetype`, `toneOfVoice`, `messagingPillars`, `colorPalette`, `aiPrompts`. One type for both Blueprint report view and Blueprint PDF.

---

### Tier 4: WunderBrand Blueprint+™

**Product name in UI/PDF:** “WunderBrand Blueprint+™” only.

**Content:** All sections from **WunderBrand Snapshot™**, **WunderBrand Snapshot+™**, and **WunderBrand Blueprint™** (1–29), then the following. No references to other product names.

| # | Section | Data fields | Report view | PDF |
|---|---------|-------------|-------------|-----|
| 1–29 | *(Same as WunderBrand Blueprint™ above)* | *(same)* | ✅ | ✅ |
| 30 | Brand story framework | `brandStory`: `{ short, long }` | ✅ | ✅ |
| 31 | Positioning statement | `positioning.statement` | ✅ | ✅ |
| 32 | Differentiation matrix | `positioning.differentiators`: `Array<{ name, detail }>` | ✅ | ✅ |
| 33 | Customer journey map | `journey`: `Array<{ stage, goal, emotion, opportunities }>` | ✅ | ✅ |
| 34 | 12-month content roadmap | `contentRoadmap`: `Array<{ month, theme, messagingAngles?, growthPriorities?, aeoStrategies? }>` | ✅ | ✅ |
| 35 | Visual direction | `visualDirection`: `Array<{ category, description }>` | ✅ | ✅ |
| 36 | Brand personality (paragraph) | `personality` | ✅ | ✅ |
| 37 | Decision filters | `decisionFilters`: string[] | ✅ | ✅ |
| 38 | Complete AEO system (optional) | `completeAEOSystem` (platformOptimizations, implementationRoadmap, measurementGuidance, aiPrompts) | optional | optional |
| 39 | AI prompt library (extended) | `aiPrompts`: 20+ items `Array<{ name, prompt }>` | ✅ | ✅ (multiple pages if needed) |
| 40 | Additional sections | `additionalSections`: `Array<{ title, content }>` | optional | optional |

**Data shape:** Extend Blueprint type with: `brandStory`, `positioning`, `journey`, `contentRoadmap`, `visualDirection`, `personality`, `decisionFilters`, `completeAEOSystem`, `aiPrompts` (extended), `additionalSections`. One type for both Blueprint+ report view and Blueprint+ PDF.

---

## 3. How to keep report and PDF in sync

### Step 1: Define one data interface per tier

- **Snapshot:** `BrandSnapshotReport` (or `SnapshotReportData`) — used by both results page/results view and Snapshot PDF.
- **Snapshot+:** `BrandSnapshotPlusReport` extends Snapshot — used by both Snapshot+ report page (e.g. `/snapshot-plus/[id]`) and Snapshot+ PDF.
- **Blueprint:** `BrandBlueprintReport` extends Snapshot+ — used by both Blueprint report view and Blueprint PDF.
- **Blueprint+:** `BrandBlueprintPlusReport` extends Blueprint — used by both Blueprint+ report view and Blueprint+ PDF.

Place these in a shared types file (e.g. `src/types/reportContent.ts` or under `src/pdf/`) and import in both the report pages and the PDF components.

### Step 2: One “sections” list per tier

In code or in this doc, keep **one ordered list of section keys** per tier (e.g. `['cover', 'score', 'strategicOverview', 'pillars', 'persona', 'archetype', ...]`). The report view and the PDF both iterate this list (or switch on it) to render sections. New sections get added in one place only.

### Step 3: Single data source per request

- For **Snapshot:** API or DB returns one Snapshot report object → same object is passed to the results view and to the PDF generator.
- For **Snapshot+:** One Snapshot+ report object → report page and PDF both receive it.
- For **Blueprint / Blueprint+:** Build one payload that includes all lower-tier content (score, pillars, persona, etc.) plus tier-specific fields. **Do not** name that content “Snapshot” or “Snapshot+”; the payload is just the full report data for Blueprint (or Blueprint+). Same payload → report view and PDF.

### Step 4: Copy and product names

- In report and PDF: **Title** = “Your WunderBrand Snapshot™ Report” / “Your WunderBrand Snapshot+™ Report” / “Your WunderBrand Blueprint™ Report” / “Your WunderBrand Blueprint+™ Report”.
- **Body copy** uses section names like “WunderBrand Score™”, “Pillar Analysis”, “Brand Persona”, “Recommended Color Palette” — no “from your WunderBrand Snapshot™” or “Snapshot+ found”. Upgrade/next-step CTAs can mention the next product by name if needed (e.g. “Upgrade to WunderBrand Blueprint™”), but the main content does not reference lower tiers.

### Step 5: Verification checklist (per tier)

Use this each time you add or change content:

**WunderBrand Snapshot™**

- [ ] Report view has: Cover/intro, WunderBrand Score™, Strategic alignment overview, Five-pillar framework (scores + insights + recommendations), optional business context.
- [ ] PDF has the same sections in the same order.
- [ ] Only the product name “WunderBrand Snapshot™” is used; no reference to other products in body content.
- [ ] Report and PDF consume the same data type.

**WunderBrand Snapshot+™**

- [ ] Report view has all Snapshot sections (1–5) plus: Priority focus area, Context coverage, Brand persona, Brand archetype, Brand voice, Recommended color palette (swatches + hex#), Core opportunities, Audience & competitors, Personality words, Messaging/visibility/visual notes, AEO section, 30/60/90 roadmap, Opportunities map, optional AI prompts.
- [ ] PDF has the same sections in the same order (add persona, archetype, voice, color palette, roadmap, opportunities map to PDF if missing).
- [ ] Only “WunderBrand Snapshot+™” is used in title/intro; body copy does not reference “Snapshot” or other products.
- [ ] Report and PDF consume the same extended data type.

**WunderBrand Blueprint™**

- [ ] Report view has all Snapshot+ sections (1–19) plus: Brand essence, Brand promise, Differentiation, Persona, Archetype, Tone of voice, Messaging pillars, Recommended color palette (swatches + hex#), AI prompt library, Next steps.
- [ ] PDF has the same sections in the same order; ensure color palette shows swatches + hex#.
- [ ] Only “WunderBrand Blueprint™” is used in title/intro; body does not reference Snapshot or Snapshot+.
- [ ] Report and PDF consume the same Blueprint data type (with all lower-tier fields populated).

**WunderBrand Blueprint+™**

- [ ] Report view has all Blueprint sections (1–29) plus: Brand story, Positioning statement, Differentiation matrix, Customer journey, 12-month content roadmap, Visual direction, Brand personality, Decision filters, optional Complete AEO system, AI prompt library (20+), optional Additional sections.
- [ ] PDF has the same sections in the same order; AI prompt library is 20+ prompts (multiple pages if needed).
- [ ] Only “WunderBrand Blueprint+™” is used in title/intro; body does not reference other products.
- [ ] Report and PDF consume the same Blueprint+ data type (with all lower-tier fields populated).

---

## 4. File mapping (where to implement)

| Tier | Report view (HTML) | PDF component | Data builder / API |
|------|--------------------|---------------|---------------------|
| Snapshot | `app/results/page.tsx`, `app/brand-snapshot/results/[id]/page.tsx`, results components | `src/pdf/BrandSnapshotPDF.tsx`, `src/pdf/documents/BrandSnapshotPDF.tsx` | `app/api/snapshot/get`, report load from DB |
| Snapshot+ | `app/snapshot-plus/[id]/page.tsx` | `src/pdf/BrandSnapshotPlusPDF.tsx`, `app/api/snapshot-plus/pdf/route.ts` | Snapshot+ report from DB + transform |
| Blueprint | (Blueprint activation page or dedicated report view) | `app/reports/BlueprintDocument.tsx`, `src/pdf/BrandBlueprintPDF.tsx` | `buildBlueprint` in `src/engine/blueprintEngine.ts`; must receive Snapshot+ data and merge |
| Blueprint+ | (Blueprint+ activation or dedicated report view) | `app/reports/BlueprintPlusDocument.tsx`, `src/pdf/documents/BrandBlueprintPlusPDF.tsx` | `buildBlueprintPlus` in `src/engines/blueprintPlusEngine.ts`; must receive Snapshot+ + Blueprint data and merge |

Ensure each “Data builder / API” outputs the **full** data shape for that tier (including all lower-tier sections) so the report view and PDF can both render the canonical section list without branching on “which product this came from.” Product name appears only in the title and intro of the report/PDF.
