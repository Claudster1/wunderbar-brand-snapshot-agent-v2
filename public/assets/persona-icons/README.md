# Persona assets

## Buyer persona portraits (WunderBrand illustrated cast)

Primary portraits are **local PNGs** in `public/assets/persona-portraits/`.

Role → archetype mapping: `lib/personaPortraitAssets.ts`  
Legacy DiceBear helpers (unused by atlas once local assets resolve): `lib/personaPortrait.ts`

## Brand archetype symbols (sprite)

- `archetype-icons.svg` — brand archetype symbols (sprite `use` IDs).

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
