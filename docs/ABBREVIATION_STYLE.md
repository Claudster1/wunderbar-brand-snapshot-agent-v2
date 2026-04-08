# Abbreviation style (first reference)

**Rule:** On first use in a given page, email, report section, or chat thread, spell out the full term, then put the abbreviation in parentheses (for example: **key performance indicator (KPI)**). After that, the short form is fine.

**Single source of truth in code:** `lib/copy/abbreviationPolicy.ts`

- `aiAbbreviationFirstReferenceRule` — full instruction block for AI system prompts (Wundy, engines, reports, follow-up emails, workbook refine).
- `uiAbbreviationNote` — short line for UI (e.g. results “How to use” banner); not a substitute for spelling out terms in body copy.

When adding new user-facing strings or prompts, prefer importing or mirroring this policy so terminology stays consistent.
