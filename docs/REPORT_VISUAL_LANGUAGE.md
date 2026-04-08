# Report visual language (Suite PDFs)

Suite-wide **execution-ready content** rules (artifacts vs. to-do lists): see **`docs/REPORT_EXECUTION_STANDARD.md`**.

## Brand Purpose vs. prescriptions

**`brandFoundation.brandPurpose`** is **declarative** — the organization’s stated reason for being, in copy form (who, stake, tension, identity, tradeoff principles). It is **not** where tactics live.

**Prescriptive** language (“unify messaging,” “improve visibility,” “align positioning,” “build credibility,” “clarify the offer”) belongs in **Strategic Action Plan**, **messaging system**, **visibility**, and **pillar** sections — not in Brand Purpose. If purpose reads like consulting homework, the engine instructions were misapplied; prompts explicitly forbid that pattern.

---

## PDF colors & examples

Single source of truth for semantic colors: `src/pdf/reportVisualTokens.ts`.

## Green / red — **Do / Don’t** only

Use **green** and **red** for explicit **guidance pairs** (in UI copy, prefer **Do this** / **Not this**):

- Do / Don’t (voice, brand standards) — or **Do this** / **Not this** where paired
- Messaging examples: **Do this** (use[]) / **Not this** (avoid[]) — do not prefix strings with “Avoid example”
- Imagery subject matter: **Do this** / **Not this** (same semantic as show/avoid in data)

Do **not** use green/red for:

- **Before / After** or **concreteExample** (pillar depth) — those are **illustrative transformations** (state A → state B). Use neutral slate + brand blue borders in PDF.
- **Trade-off “cons”** in competitive analysis — use neutral slate text, not red.
- **Score gauges** and **metric bands** — may use the full spectrum (green/yellow/orange/red) as **data visualization**, not semantic “do this.”

## Examples (neutral)

Standard pattern across PDFs:

- **Label:** muted gray, small caps feel — `EXAMPLE_CALLOUT.labelPrefix` → **`Example —`**
- **Body:** italic, navy/dark text — `EXAMPLE_CALLOUT.bodyColor`

Voice trait example lines, messaging pillar `exampleMessage`, and similar fields follow this pattern in layout.

## Engines

Engine prompts (`blueprintEnginePrompt`, `snapshotPlusEnginePrompt`) include short rules so JSON content aligns with this layout: **before/after** is illustrative, not moral Do/Don’t; example strings stay clean without redundant `"Example:"` prefixes.

## Web preview pages

Preview pages (`app/preview/*`) may still use green/yellow/red for **scores** and **coverage meters**. That is chart semantics, not Do/Don’t copy.
