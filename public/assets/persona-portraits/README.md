# Persona portraits (WunderBrand)

Local illustrated cast for Foundation / Strategy persona atlas.

## Location

`public/assets/persona-portraits/wunderbar-persona-{archetype}-{a|b}.png`

Style hero (reference only): `wunderbar-persona-style-hero.png`

## Current set

- **22 archetype A variants** (full cast)
- **8 B variants** for common roles (econ, exec, champion, tech, rev, founder, smb, senior)

Mapping / selection: `lib/personaPortraitAssets.ts`  
UI crop: circular in `PersonaAtlasSuite` and Strategy persona cards

## Notes

- Soft pale backgrounds are fine; the UI applies a circular crop.
- Assets are resized to 512×512 for fast delivery.
- DiceBear remains available in `lib/personaPortrait.ts` for any future fallback, but atlas paths now resolve locally.
