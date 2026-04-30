# Persona assets

## Buyer persona portraits (generated)

Persona **faces are not stored in this repo**. They are rendered by [DiceBear](https://www.dicebear.com/) (`api.dicebear.com`) using a deterministic seed:

`report id + company + persona name + role + index`

The app picks an illustration **style per persona slot** from a large B2B / B2C / neutral pool so multi-persona views stay visually distinct. Fallback sample personas (when the diagnostic has no `buyerPersonas`) use the same pipeline.

Implementation: `lib/personaPortrait.ts`, `lib/foundationPersonaAtlas.ts`, `lib/strategy/audienceNarrative.ts`.

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
