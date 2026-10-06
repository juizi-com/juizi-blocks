# Backward compatibility with earlier Juizi block add-ons

Compared against the setups in `../old-block-setups` (acqf, doi, jet, nithecs).

## How old content is handled

`frontend/packages/volto-juizi-blocks/src/legacy/` registers a Volto content
transform. On every page load (view and edit) it converts old blocks in memory:

- visitors see the current block straight away;
- an editor who opens and saves the page writes the new format;
- nothing changes in the database until someone saves;
- each converted block keeps the data it came from under `legacyData`
  (`{ "@type": "<old type>", "data": { … } }`), so nothing is lost even where
  the current block has no equivalent.

The colour helpers (`config/colors.js`) also accept old colour values
anywhere, converted or not.

Current blocks saved before a field was renamed are repaired the same way
(`repairCurrentBlock`, keeping the old key):

- Carousel saved with only `mode` → `displayMode`.
- Content Row saved with `variation` → `displayMode` (September 2026: VLT's
  CSS hides the fourth option of any field called `variation`, which made
  "Image card" impossible to choose). The converters below now write
  `displayMode` directly.
- Content Row saved with `iconLeft: true` (plone.org's copy) →
  `iconPosition: 'left'`. A saved `iconPosition` wins.

A block that needs more than one repair gets them all.

Link fields saved as a plain URL string (older Redirect blocks) are read as
well as the link picker's format (`_shared/links.js`).

## acqf

Same block generation as juizi-blocks (`juiziHero`, `contentRow`,
`emblaCarousel`, `emblaGallery`, `redirectBlock`). Every data field these
blocks read in acqf is read by the current blocks too. **Compatible.**

- **Hero, Snapshot summary mode** (`blockMode: "snapshot"`): removed in
  juizi-blocks (it depended on acqf's Snapshot content type). Such blocks
  still render as a section band, but without the framework/status/
  institution bar and flag.
- **FooterConfigBlock**: not part of the set (out of scope by request).

## juizi-volto-audio-block

The standalone audio add-on (github.com/juizi-com/juizi-volto-audio-block)
registered `audioBlock`, which is now the Audio block here, under the same
id. **Compatible**, without conversion: its blocks saved only `url` (a path
to the file's download), which the Audio block still plays and shows in the
sidebar. Picking a new file replaces `url` with the link picker's `audio`.
See `Audio/README.md`, "Older blocks".

- The player now uses the shared block width instead of the text column, so
  it is wider on wide screens.
- Remove the old add-on: it also switched every site to English only
  (`isMultilingual: false`), which juizi-blocks doesn't do.

## plone.org (next.plone.org)

Compared against `ploneorg-core` in github.com/plone/next.plone.org (October
2026). Its Hero, Content Row and Carousel were copied from the same code as
the current blocks and changed in places.

| plone.org block | Handling |
|---|---|
| `hero` | Converted to `juiziHero`. Same fields, stored values and fallbacks for unset fields, so the data is copied unchanged (and kept under `legacyData`). Only blocks with `blockMode` are converted: other add-ons (e.g. `@kitconcept/volto-hero-block`) also have a block called `hero`. |
| `contentRow` | Same block type. `variation` → `displayMode` and `iconLeft` → `iconPosition` are repaired as pages load (see above). |
| `emblaCarousel` | Same block type and fields, except `centeredPeek` ("Centre active card"), which is dropped (never used on plone.org): such a carousel would show its slides from the left. |
| `footerConfig` | Not part of the set; stays in the site's own add-on. |

Colours and block themes are the site's to set up in Site Setup → Juizi
Blocks before its own copies are removed:

- **Colours:** plone.org stores `var(--blue)`, `var(--med-blue)`,
  `var(--blue-grey)`, `var(--light-grey)` and `var(--dark)`. They keep
  rendering through the site theme's CSS variables; add `blue`, `med-blue`,
  `blue-grey`, `light-grey` and `dark` to the dashboard colours so text
  colours are worked out from them.
- **Block themes:** once installed, the dashboard's themes replace the
  site's own (`default`, `Blue`, `MedBlue`, `BlueGrey`, `LightGrey`), for
  every block with a theme, not only Juizi's. Recreate them in the dashboard
  under the same names first (theme names may use capitals for this), or
  saved blocks lose their theme colours.

## doi, jet, nithecs

These use an older block generation with different block types:

| Old `@type` | Converted to | Result |
|---|---|---|
| `EmblaCarousel` | `emblaCarousel` | Full. Same lineage (41 of 46 fields shared). `mode` → `displayMode` (without it the current carousel renders nothing), `showEffectiveDate` → date display, `imageTopCardColor` → slide background. `blurImage`, `excludeFromNav`, `logoMaxWidth` have no equivalent. |
| `customHero` | `juiziHero` (hero mode) | Good for single heroes: title, preheader, subtitle, logo, background image/video/position, overlay, alignment, top padding, buttons, TOC, breadcrumbs. Title becomes the page's h1, as before. |
| `buttonRow` | `juiziHero` (section mode) | Full: preheader, title, text, background colour/image, full width, alignment, buttons beside/below, TOC or inline list. |
| `multiCard` | `contentRow` (`card`, or `statistics` when `useStatistics`) | Good: header, description, cards (image, preheader, title, text, link, link text, button style, card colour), statistics, columns, alignment, view-all button, mobile carousel. |
| `iconLinkRow` | `contentRow` (`icon`) | Good: header, alignment, columns, background colours, items (icon, heading, text, link), call-to-action button → view-all. |
| `redirectBlock` | unchanged | Full (same block). |
| `Events` (nithecs) | not converted | No equivalent in the set: renders as an unknown block. Porting it is a separate job. |

### Not converted: `EmblaRatings`

The standalone ratings carousel (`volto-EmblaRatings`, block type
`EmblaRatings`) is not converted. None of the setups compared here use it.
A page that still has one shows it as an unknown block; add the reviews again
in a Carousel with the **Reviews** display style, which has the same fields
(review text, star rating, name, organisation, picture, link).

### Partly supported (kept in `legacyData`)

- **customHero with multiple heroes / carousel mode**: only one hero is
  shown: the block's own fields, or the first carousel hero when "carousel
  mode" hid the first one. Carousel autoplay/navigation settings are dropped.
- **customHero image-stack layout** (nithecs): the first decorative image
  becomes the Hero's side image; images 2 and 3 are dropped.
- **customHero content blocks** (nithecs rich text between subtitle and
  buttons): no equivalent field.
- **customHero "dark foreground"**: kept as the class
  `hero-block--foreground-dark` (dark text, see `juizi-common.scss`).
- **iconLinkRow header/item text colour** (`headerColor`, `itemsColor`): text
  colour now follows the background colour automatically.
- **multiCard image positions**: "background" → overlay cards; the four
  "above/below" positions all become "image above content".
- **multiCard / carousel control colours** (`carouselControlsColor`): dropped.

### Icons

The old Icon Link Row used Volto's own icons (`link`, `home`, `folder`, `user`,
`pencil`, `briefcase`, `fingerprint`, `bell`); they are mapped to the matching
Lucide icons. doi's custom icons (`communication`, `hourglass`, `starburst`,
`tech`) were copied into `ContentRow/icons/`, so they keep working (this also
fixed custom SVG icons crashing the Content Row).

## Colours and button styles

Old content stored colours in several ways. All of these now render:

| Old value | Handling |
|---|---|
| `var(--coral)` | as before; add `coral` to the dashboard colours to manage it (until then it uses the CSS variable the site theme defines) |
| `#ffffff` (raw hex) | used as is; light/dark and text colour worked out from the hex |
| `var(--darkturquoise` (missing `)`, jet) | repaired to `var(--darkturquoise)` |
| `solid__coral` / `outline__coral` (doi, acqf) | as before |
| `solid__ffffff` | the key is read as the hex colour `#ffffff` |
| `white-outline`, `primary-filled` (nithecs hero buttons) | read as `outline__white`, `solid__primary` |
| `black`, `white` keys not in the dashboard | used as CSS colour keywords |

**To finish a site migration:** add the site's colour names (e.g. coral,
charcoal, turquoise for doi/jet; primary, secondary, teal for nithecs) to
Site Setup → Juizi Blocks → Colours with their hex values. Their old block
data then picks up the dashboard colours and text colours.

## Theme overrides worth moving into `juizi-common.scss`

From the projects' `_main.scss` files. Now available as tokens (set them in a
project theme instead of writing overrides):

| Override seen in | Token(s) |
|---|---|
| acqf: preheaders 16px / 400 for Hero and Content Row | `--juizi-preheader-font-size`, `--juizi-preheader-font-weight` |
| acqf: one title size for Hero, Content Row and Carousel titles | `--juizi-title-font-size`, `--juizi-title-line-height` |
| acqf: one description size for Hero and Content Row | `--juizi-description-font-size` |
| acqf, doi: rounded cards with a shadow (Content Row, carousel) | `--juizi-card-radius`, `--juizi-card-shadow` |
| acqf, doi, nithecs: 20px gutter on edge-to-edge blocks, content held to the layout width (Hero, Content Row, carousels) | built in: every block has a full-width outer layer with `--juizi-gutter` and an inner layer at the one shared `--juizi-content-width` |
| acqf, doi: Hero/Button Row content at layout width | built in: the Hero follows `--juizi-content-width` like every other block |

Left in the projects (site-specific): header, navigation, footer, search and
listing styling, breadcrumbs, per-page id overrides, carousel dot styles, and
spacing tweaks between specific block combinations.
