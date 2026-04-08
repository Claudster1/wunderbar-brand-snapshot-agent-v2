# ICPs and buyer personas (product model)

## Definitions

| Concept | What it is | Question it answers |
|--------|------------|---------------------|
| **ICP (ideal customer profile)** | The **segment** you strategically prioritize — company/account profile (B2B) or cohort (B2C). | *Which customers should we pursue first?* |
| **Buyer persona** | A **named individual** inside an ICP who discovers, evaluates, influences, or purchases. | *Who is the human we’re writing or selling to?* |

- One ICP can (and usually should) have **multiple** buyer personas — e.g. champion vs. economic buyer vs. end user.
- Personas **must** map to **exactly one** ICP using the same **`icpLabel`** string as that ICP.

## Slots in generated Blueprint outputs

- **Primary ICP** — Best fit, highest value, default GTM focus.  
- **Secondary ICP** — Adjacent segment or deliberate expansion.  
- **additionalICPs** (0–2) — Optional third/fourth segments when inputs clearly describe distinct buyers (e.g. partners/resellers, second geography, separate product line). **Do not** invent segments to fill the array.

Each ICP includes:

- **`icpLabel`** — Required for primary and secondary; required for each additional ICP. Short, human-readable (e.g. `Primary ICP — best-fit mid-market marketers`).  
- **`icpKey`** (optional on additional only) — Stable id for tooling: `tertiary`, `expansion`, `partner`, etc.

## Persona ↔ ICP link

- Field **`icpAlignment`** on each buyer persona must be an **exact copy** of the **`icpLabel`** for the ICP that persona belongs to (not just the word “primary” unless that is the full label).

## Diagnostic capture (Wundy)

- Optional follow-up **13b** in `src/prompts/wundySystemPrompt.ts`: when answers suggest more than two distinct segments, Wundy may ask **one** follow-up about partners, a second region, or another parallel audience.
- Structured field: **`additionalDistinctSegmentsNote`** (`string | null`) in the final JSON — feeds Blueprint engines when populating **`additionalICPs`**.
- **36H — Implementation horizon** (Wundy): **`implementationPrioritiesNow`** and **`implementationPrioritiesScaling`** (`string | null`) — near-term moves vs. when budget/capacity grows. Passed through on `AssessmentInput` and used by Blueprint / Snapshot+ **Strategic Action Plan** instructions; free Snapshot report uses **now** in Immediate Actions and defers **scaling** to “What’s Next.”

## Code references

- Types: `src/pdf/types/blueprintReport.ts` (`ICP`, `AdditionalICP`, `audiencePersonas`)  
- Engine instructions: `src/prompts/blueprintEnginePrompt.ts` (sections 19–20), `src/prompts/blueprintPlusReportPrompt.ts` (sections 17–18)  
- PDF rendering: `src/pdf/documents/CompleteBlueprintDocument.tsx`  
- Blueprint+ → PDF normalization: `app/api/blueprint/pdf/route.tsx` (`normalizeAudienceFieldsForPdf`)
- Assessment type: `lib/ai/reportGeneration.ts` (`AssessmentInput`: `additionalDistinctSegmentsNote`, `implementationPrioritiesNow`, `implementationPrioritiesScaling`)
