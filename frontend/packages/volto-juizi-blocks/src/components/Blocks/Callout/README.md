# Callout block (`juiziCallout`)

A highlighted message with an icon, a title, text and an optional link.

Shared parts (dashboard, colours and buttons, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

## Registration

Defined in `index.js` and listed in `src/blocks/index.ts`. The Edit is the shared `makeBlockEdit`; the schema is registered as `juiziSchema`. `usesColors: true` puts it in the dashboard's "Colours per block" table.

## Dependencies

`lucide-react`: the offered icons are imported one by one in `icons.js`.

## Callout types

The editor first chooses what the callout is for: Information, Tip, Warning, Success or Announcement (`types.js`). A type seeds:

- its icon;
- the **colours the site set for it** in Site Setup → Juizi Blocks → **Callout types** (background colour and icon colour, from the site's colour list). Types with no colours set start without a background.

The type stays first in the sidebar, so the editor can see and change it. Changing it swaps the icon and colours only where they still hold the previous type's starting values: anything the editor changed stays.

The schema has no defaults, on purpose: Volto writes schema defaults into new blocks, which would skip the type choice. Callouts saved before types existed count as set up when they have any content (`isCalloutConfigured`).

## Colours

Background colour (with a real "None" choice), icon colour and link colour ("Same as text" when empty), all from the colour list the dashboard allows for the Callout. Text colour follows the background automatically. In the editor, a warning shows when the icon or link colour is hard to see on the background (same colour, or both dark or both light). That's a rough test, not a contrast ratio.

The per-type colours are stored under `color_config.blocks.juiziCallout.calloutTypes` (`{ warning: { background: 'gold', icon: … } }`). The backend (`juizi.blocks.settings._validate_callout_types`) keeps them for the Callout only and drops colour names that no longer exist; renaming or removing a colour in the dashboard updates them.

## Layout

The callout box is the block's inner layer (it isn't full width), so its background sits there. With a background colour it keeps padding all round inside the box, so the icon isn't flush against the edge (`--juizi-callout-padding`, 1.5rem on the sides). Without one there's no box, and it lines up with the content of the blocks around it.

## Happy path — draft, confirm in first-time editor test

1. Add a **Callout**. The canvas lists the five types with what each is for.
2. Choose a **Callout type**, e.g. **Warning**. The icon (and the site's colours for warnings) appear.
3. Type a **Title** and **Text**; optionally add a **Link**.
4. Publish.

## Decisions and trade-offs (2026-09 audit)

- Types set starting colours from a per-site table; the type stays visible and changeable (CO1).
- The empty-callout hint uses the shared `EditHint` (CO2).
- Contrast warning for icon and link colours (CO3).
- The block renders inside `BlockWrapper` (`@kitconcept/volto-bm3-compat`), which adds the outer `block juiziCallout` container with `type-{calloutType}` and `tone-*` classes (CO4).

Full list: `block-audit-actions.md` at the repository root.
