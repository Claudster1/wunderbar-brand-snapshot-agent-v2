# Persona portraits (WunderBrand)

75 illustrated portraits in `public/personas/` (1024×1024 transparent RGBA PNG).

- Registry + role mapping: `lib/personaPortraitAssets.ts`
- Crop to a circle in UI (`rounded-full object-cover`)
- Contexts: B2B, B2C, Shared, Youth (teen archetypes)
- Ethnicity diversity: portrait selection uses `heritageGroup` + `avoidHeritageGroups` so co-presented ICP faces vary
- Sexual orientation / relationship diversity: not visible in portraits — enforced in report persona copy via `src/prompts/fragments/personaDiversityGuidance.ts`

Do not bake circular crops into the PNG files. Keep full-color RGBA exports — palette-quantized PNGs can render blank or washed out in results.
