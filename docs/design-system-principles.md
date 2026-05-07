# Website Design System Principles

## Identity

Data identity must be stable and separate from display text.

- Works use `id` as the work identity.
- Exhibitions use `id` as the exhibition identity.
- News records use `id` as the news identity.
- Work filters use `project_id` and `material_id` for filtering.
- Chinese and English names are display labels only. Changing translation text should not change filtering behavior.

## English Layout

English pages follow one reading rule: long text starts from a stable left edge.

- Top navigation and short tool labels may be centered.
- Filter dropdown options, card titles, body copy, metadata, and descriptions are left aligned.
- Multi-line English text should not be centered unless it is intentionally used as a hero title or artistic title.

## Brush Highlight

Ink and brush highlights are one visual language.

- Use the shared `.brush-highlight` rule for selected states.
- Adjust placement with custom properties instead of creating separate highlight implementations.
- Selected states must remain readable without the image asset, so the text color still carries the active state.
