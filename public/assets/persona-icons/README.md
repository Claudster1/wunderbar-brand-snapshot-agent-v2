# Persona Icon Pack (SVG)

Files:

- `archetype-icons.svg` — brand archetype symbols (sprite `use` IDs).
- `persona-vp-operations.svg` — VP Operations (Sarah Chen): lighter skin tone, dark bob, blazer, soft smile.
- `persona-cfo-coo.svg` — CFO / COO (David Park): medium-deep skin tone, short dark hair, glasses, shirt and tie, dark suit.
- `persona-revops.svg` — RevOps / Chief of Staff (Alex Rivera): medium skin tone, wavy dark hair, casual layer, warm smile.

These three SVGs are **fallbacks** when the report has no `buyerPersonas` in diagnostic data (e.g. Snapshot+ without full Blueprint audience JSON).

### Report-specific personas

When `diagnosticData.buyerPersonas` or `buyerPersonaEcosystem.buyerPersonas` is set (from the Blueprint engine or workbook), Foundation and Strategy use that data with **deterministic** [DiceBear](https://www.dicebear.com/) SVG avatars (seed = report id + company + persona name + role + index). **One illustration style is chosen per report** (from inferred **B2B vs B2C** and a stable report key) so every persona in that atlas matches; faces still differ by seed, and background tints shift slightly by persona slot. The same report and persona always maps to the same portrait.

Included archetype icon symbols:

- `#archetype-sage`
- `#archetype-explorer`
- `#archetype-hero`
- `#archetype-creator`
- `#archetype-caregiver`
- `#archetype-ruler`
- `#archetype-magician`
- `#archetype-outlaw`
- `#archetype-lover`
- `#archetype-innocent`
- `#archetype-entertainer`
- `#archetype-neighbor`
- `#archetype-generic`

Usage example:

```html
<svg width="54" height="54" viewBox="0 0 48 56" style="color:#07B0F2">
  <use href="/assets/persona-icons/archetype-icons.svg#archetype-sage"></use>
</svg>
```
