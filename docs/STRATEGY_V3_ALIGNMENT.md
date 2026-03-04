# WunderBrand Rebuild Strategy v3 Alignment

This document tracks implementation alignment for the uploaded strategy update (`wunderbrand-suite-rebuild-strategy-v3.docx`).

## Scope Covered

The following strategy deltas are implemented in product behavior:

1. **Section 1.0 — Business Type Classifier**
   - Shifted from user-facing taxonomy selection to **inference-and-confirm**.
   - Six business types are treated as **internal routing targets**, not a list shown to users.
   - Added conversational correction path for misclassification and hybrid-primary-driver clarification.

2. **Section 1.2 — Rebuilt Diagnostic Capture**
   - Framing moved from fixed question-list behavior to **signal extraction** behavior.
   - Capture guidance now emphasizes:
     - natural emergence in conversation,
     - direct surfacing only when signals are still missing,
     - extraction intent over strict scripted sequencing.

3. **Part 1B — Approach 1 (Revenue Baseline)**
   - Reframed as **conversational extraction targets** rather than rigid baseline questions.
   - Revenue baseline references now use "extracted from conversation" style framing.

4. **Part 1B Fallback Callout**
   - Adopted fallback logic as **"When a signal wasn't captured — fallback without fabrication."**
   - Removed form-style implication ("selects I don't track this").
   - Missing metric signals are treated as meaningful inputs and trigger proxy framing (no fabricated numbers).

## Files Updated

- `src/prompts/wundySystemPrompt.ts`
  - Business type classifier rewritten to inference-and-confirm.
  - Internal routing categories preserved without user-facing taxonomy list.
  - Revenue baseline and related items reframed as signal extraction targets.
  - Non-capture framing updated for revenue impact integrity.

- `app/api/brand-snapshot/route.ts`
  - Deterministic routing enforcement updated to conversational inference-confirm prompts.
  - Required captures remain server-enforced with strict next-step fallback.
  - Non-capture/refusal handling included so flow progresses without metric fabrication.

## Notes

- This alignment intentionally preserves existing score/report pipelines while changing conversational behavior and routing posture.
- Existing upgrade flows and analytics events are unchanged by this update.
