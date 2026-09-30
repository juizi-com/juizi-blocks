# Juizi Blocks 🚀

[![Built with Cookieplone](https://img.shields.io/badge/built%20with-Cookieplone-0083be.svg?logo=cookiecutter)](https://github.com/plone/cookieplone-templates/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![CI](https://github.com/juizi-com/juizi-blocks/actions/workflows/main.yml/badge.svg)](https://github.com/juizi-com/juizi-blocks/actions/workflows/main.yml)

Consolidated Juizi block set for Volto, with a central colour dashboard and per-block toggles

- Six blocks: Hero, Content Row, Carousel, Gallery, Callout and Redirect.
  Reviews with star ratings and scrolling logo strips are display styles of
  the Carousel (see [Blocks](#blocks)).
- A dashboard to switch any block on or off and to manage the colours and
  themes the blocks share.
- Available in English, French, Portuguese, Brazilian Portuguese, Spanish and
  Afrikaans (see [Languages](#languages-)).

## Stack

| Part | Version |
| --- | --- |
| Plone (`Products.CMFPlone`) | 6.1.5 |
| Volto | 18.32.1 |
| Volto Light Theme (`@kitconcept/volto-light-theme` / `kitconcept.voltolighttheme`) | 7.8.6 (the 7.x line is the one for Volto 18; 8.x needs Volto 19) |
| `embla-carousel-react` | ^8.6.0 |
| `lucide-react` | ^1.48.0 |

The backend runs on Python 3.12 (`backend/.python-version`).

## How the block set works

```
backend  juizi.blocks                        frontend  volto-juizi-blocks
─────────────────────────────                ───────────────────────────────────────────
registry  juizi.blocks.disabled_blocks       blocks/index.ts        the block manifest
          juizi.blocks.enabled_blocks        components/Blocks/*    the blocks
          juizi.blocks.color_config (JSON)   config/colors.js       colour API used by blocks
GET   /@juizi-blocks-settings   (public) ─►  settings/runtime.ts    applies settings to the app
PATCH /@juizi-blocks-settings   (Manager) ◄─ components/Dashboard   /controlpanel/juizi-blocks
```

Paths below starting with `src/` are in `frontend/packages/volto-juizi-blocks/src/`.

This README is the home for **everything the blocks share**: the dashboard,
colours and buttons, shared styling, links, the shared block toolkit and the
conventions every block follows. Each block's own README (in its folder under
`src/components/Blocks/`) covers only what that block does, and links back
here. `src/components/Blocks/_shared/README.md` and `src/config/README.md`
point here too.

### Blocks

| Block | id | Colours | Themes | README |
| --- | --- | --- | --- | --- |
| Hero | `juiziHero` | yes | | `HeroBlock/README.md` |
| Content Row | `contentRow` | yes | | `ContentRow/README.md` |
| Carousel | `emblaCarousel` | yes | | `EmblaCarousel/README.md` |
| Gallery | `emblaGallery` | yes | | `EmblaGallery/README.md` |
| Redirect | `redirectBlock` | | | `Redirect/README.md` |
| Callout | `juiziCallout` | yes | | `Callout/README.md` |

The ids match the previous add-on, so existing content keeps rendering.
In the block chooser they are grouped under **Juizi** (after "Most used").
A block definition can set its own `group` to go elsewhere. The decisions
from the September 2026 block audit are summarised in each block's README.

Some things that were blocks of their own in earlier add-ons are a **display
style** of one of these blocks, chosen as the block's first option:

| Looking for | Use | Display style |
| --- | --- | --- |
| Reviews, testimonials, star ratings | Carousel | Reviews |
| A scrolling strip of partner or sponsor logos | Carousel | Scrolling logo strip |
| Cards with a picture above the text | Carousel | Image above content |
| Numbered steps, icon links, statistics, image cards | Content Row | Numbered, Icon, Statistics, Image card |
| A slideshow or a grid of pictures | Gallery | Slideshow, Even grid, Natural grid |
| A page header, or a coloured band with a heading and buttons | Hero | Hero (page header), Section (content band) |

#### Overlapping blocks

The add-on also brings kitconcept and eeacms blocks, some of which do the
same job as a Juizi block. An editor with no context sees both in the
chooser. Decide per site which to keep, and switch the others off in
Site Setup → Juizi Blocks → Blocks:

| Juizi block | Overlaps with |
| --- | --- |
| Carousel | kitconcept Carousel, kitconcept Slider |
| Hero (Hero style) | kitconcept Banner, kitconcept Introduction |
| Hero (Section style) | kitconcept Highlight |

Switching a block off only hides it from the chooser: pages that already
use it keep rendering. Add this check to each site's launch checklist.
The Hero's Snapshot summary mode was removed: it depended on the NQF
`Snapshot` content type and utilities that are not part of this project.

## The dashboard (Site Setup → Juizi Blocks)

Two tabs, sharing one Save: the save button in Volto's toolbar, or the bar
that appears at the top as soon as something has changed (Save / Discard
changes). Problems that would stop a save (a colour without a valid name, a
theme missing its text colour, …) are listed there in the editor's language.

The footer shows the add-on's name and version, read from the package.

**Look:** the dashboard follows the Juizi dashboard style (first used in
`collective.bulkmailproviders`): a centred 800px column of plain elements,
light grey cards with white panels inside, flat buttons, small upper-case
badges for state. The rules are in `src/theme/juizi-blocks.scss`; new
dashboard sections should reuse its classes (`juizi-dashboard__section`,
`__btn`, `__badge`, `__table`, `__input`, …) rather than Semantic UI
components.

**Blocks tab** — a checkbox for every block registered in the site (Volto,
Volto Light Theme, add-ons and Juizi), with an Enabled / Disabled badge,
grouped as in the block chooser with the Juizi group first.

- The list is read from the running configuration, so a rebuild that adds or
  removes blocks updates it automatically. New blocks start switched on.
  Saved choices are kept, including those for blocks that are missing from the
  current build.
- A block's own `restricted` setting is its default. `true` means off by
  default; you can switch it on. A function (e.g. Title once per page,
  Event metadata only on Events) keeps its constraint while switched on.
- Text (`slate`), Description, Image and Title are locked on
  (`LOCKED_BLOCKS` in `settings/constants.ts`).
- Switched-off blocks disappear from the block chooser and the `/` menu.
  Blocks already on pages keep rendering. Containers with their own list of
  allowed blocks (e.g. Grid) use that list.
- Stored as `disabled_blocks` / `enabled_blocks`: only the departures from
  each block's default.

**Colours tab:**

- **Colours** — the master colour list. Each colour has a name (its CSS
  variable), label, hex value, a *dark* flag (suggested from the colour, can be
  overridden) and an optional text colour (automatic by default; the dashboard
  shows the contrast ratio). The colours are output as
  `--<name>`, `--<name>-rgb` and `--<name>-foreground` on `:root`.
- **Block themes** — Volto Light Theme themes (`config.blocks.themes`, the
  *Styling → Background color* swatches) built from the colours: background,
  text, cards/surfaces and muted text, each optionally faded. They're used by
  VLT's own blocks (Grid, Teaser, Text, Listing, …). The Juizi blocks use the
  colour list instead.
- **Colours per block** — narrow the colours each Juizi block offers.
  Nothing ticked means everything.
- **Callout types** — the starting background and icon colour for each
  Callout type (Information, Tip, Warning, …). Shown while the Callout is
  registered; stored under `color_config.blocks.juiziCallout.calloutTypes`.
  See `Callout/README.md`.
- A "Themes per block" table appears for any Juizi block defined with
  `usesThemes`; none are right now.

Blocks store a colour as `var(--<name>)` (the same format as before), so
changing a colour's value updates every block that uses it. Renaming a colour
does not rewrite existing block data.

The settings are fetched during server-side rendering and applied before the
page renders (and in the browser from the serialised state before hydration),
so `MASTER_COLOR_LIST`, `getBlockColorList()` and VLT's themes are correct in
the first response.

## Colours and buttons

### `src/config/colors.js`

All colour logic for the blocks goes through this file; the colours
themselves are managed in the dashboard. `MASTER_COLOR_LIST` keeps its
`[CSS variable, Label, 'light' | 'dark']` format and is updated in place when
the settings load. A block's schema asks for its own list with
`getBlockColorList('<block id>')`, inside the schema function (never copy
colour lists at module level), so the dashboard's "Colours per block" applies.

| Function | Purpose |
|---|---|
| `MASTER_COLOR_LIST` | Full colour list with lightness values (live) |
| `getBlockColorList(blockType)` | The colours the dashboard allows for a block |
| `getColorTextStyle(value)` | `{ color: var(--<name>-foreground) }` for a background colour |
| `getColorChoices(list)` | `[value, label]` pairs for Volto select widgets |
| `getButtonChoices(list, t)` | Solid + outlined button options for every colour (`t`: the schema's translator) |
| `getDefaultButton(bgColor, list)` | A contrasting button style for a background |
| `getContrastingColor(bgColor, list)` | The first colour of opposite lightness to the background (a transparent or unknown background counts as light), for defaults that must stand out, e.g. the Gallery's highlight around the current picture |
| `getButtonClasses(value, baseClass)` | `className` and `style` for a button element |
| `isColorDark(value, list)` | `true` if a colour needs light text |
| `colorValueToKey(value)` | `var(--brand-primary-blue)` → `brand-primary-blue` |
| `colorKeyToCssVar(key, list)` | Reverses `colorValueToKey` |

### Text colour follows the background

Blocks never ask editors for a text colour. It follows the background:
`isColorDark()` gives the `bg-dark` / `bg-light` / `tone-*` classes and
`getColorTextStyle()` the inline colour (the dashboard's text colour for that
background). A block's heading and intro text use that one colour, so they
always match. The one exception is text over a background **image**, which
can't be judged automatically: the Carousel asks "Text over the background
image" only when one is set, and the Hero's Section style explains in the
"Background colour" help that the colour still sets the text colour over an
image.

When adding colours in the dashboard, check the contrast ratio it shows
meets WCAG AA (4.5:1 for body text, 3:1 for large text).

### Buttons: `getButtonClasses` and `src/config/buttons.scss`

```javascript
import { getButtonClasses } from '../../../config/colors';

const { className, style } = getButtonClasses(btn.buttonStyle, 'hero-button');
// className → 'hero-button btn-unified btn-solid btn-color-white hero-button--solid'
// style     → { '--btn-color': 'var(--white)', '--btn-foreground': '#111' }
return <a href={href} className={className} style={style}>{btn.label}</a>;
```

`--btn-color` is the button's colour, `--btn-foreground` its text colour
(from the dashboard, else from the colour's lightness), so button text is
always readable without the editor choosing it.

`buttons.scss` is the CSS counterpart and holds every button colour rule;
block stylesheets handle layout only. Rules cover view (`.public-ui`) and
edit (`.cms-ui`) and are specific enough to beat VLT's link colour without
`!important`. Add `btn-small` for the small size (the Hero's "Use smaller
buttons" does this). When adding a block with buttons, add its button base
class to `$block-btn-classes`:

```scss
$block-btn-classes: 'hero-button', 'row-button', 'card-button', 'button';
```

**Shape:** every button, and the Carousel's and Gallery's controls (arrows,
"More" button, enlarged-view buttons), use `--juizi-button-radius` (4px) and
`--juizi-button-border-width` (2px), so a site changes them in one place.

## Shared styling (`src/theme/juizi-common.scss`)

Like `buttons.scss` does for buttons, this file styles what every block has:
preheaders, block titles, Hero titles, descriptions, item preheaders and
headings, the padding scale, the two width layers and full width, card
corners and shadows, links, and `visually-hidden`. Each rule reads a
`--juizi-*` token; SCSS lists near the top map each block's own class names
onto those roles (`$juizi-titles`, `$juizi-descriptions`, `$juizi-layers`,
`$juizi-plain-links`, …).

### Tokens

To align a site, override tokens in its theme rather than restyling blocks.
Set them on `:root`: some tokens are worked out from others there, so an
override on a narrower selector wouldn't reach them.

```scss
:root {
  --juizi-preheader-font-size: 16px;
  --juizi-title-font-size: 68px;
  --juizi-title-line-height: 64px;
  --juizi-card-radius: 24px;
  --juizi-card-shadow: 0 3px 6px -4px #000;
  --juizi-content-width: 1200px; /* every block's content width */
  --juizi-button-radius: 0;      /* square buttons and carousel controls */
}
```

| Group | Tokens |
|---|---|
| Typography | `--juizi-heading-font-family`, `--juizi-preheader-*`, `--juizi-title-*`, `--juizi-hero-title-*`, `--juizi-description-*`, `--juizi-item-*` |
| Spacing | `--juizi-pad-compact` / `-default` / `-spacious` / `-extra-spacious` (+ `-mobile`) |
| Width | `--juizi-gutter`, `--juizi-content-width`, per-block `--juizi-*-width` |
| Boxes | `--juizi-callout-padding` (1.5rem), `--juizi-redirect-padding` (1.25rem) |
| Cards | `--juizi-card-radius`, `--juizi-card-shadow` |
| Reviews | `--juizi-review-star-color`, `--juizi-review-star-color-on-dark` (the Carousel's Reviews style; keep each at 3:1 or more against its background) |
| Buttons | `--juizi-button-radius`, `--juizi-button-border-width` |

Defaults follow Volto Light Theme's sizes, and the blocks' own stylesheets
don't set these values themselves.

### Padding scale

Blocks with top/bottom padding options (Hero, Content Row) share one scale:

| Value | Desktop | Mobile |
|---|---|---|
| `none` | 0 | 0 |
| `compact` | 2rem | 2rem |
| `default` | 4rem | 4rem |
| `spacious` | 8rem | 5rem |
| `extra-spacious` | 12rem | 8rem |

### Two layers: width and full width

- The **outer layer** is always full width, carries the block's background
  colour or image, and has `--juizi-gutter` side padding, so the content
  keeps equal side padding as the window narrows.
- The **inner layer** holds the content at **one shared width**,
  `--juizi-content-width` (VLT's layout width by default), or spans the outer
  layer when the block's "Full width" option is on. Per-block overrides exist
  (`--juizi-hero-content-width`, `--juizi-content-row-width`,
  `--juizi-carousel-content-width`, `--juizi-gallery-content-width`,
  `--juizi-callout-width`, `--juizi-redirect-width`) but all follow
  `--juizi-content-width` unless set.

**Boxes (Callout, Redirect):** their inner layer is a box with its own
background, not just a width container, so they keep side padding inside it
(`--juizi-callout-padding`, only when the Callout has a background colour;
`--juizi-redirect-padding`). Everything else clears the inner layer's side
padding.

**Full width and Volto's `.full-width`:** the Carousel and Gallery mark
"Full width" with a `full-width` class, which Volto's own theme also uses to
break out of the page column (`margin-left: -50vw !important`). The shared
styling undoes Volto's version for these blocks, so they don't land half off
screen in the editor; in the editor a full-width block fills the editing
area.

### Links

VLT colours every link in page content with `var(--link-foreground-color)`
and underlines it, with a selector that beats ordinary block CSS. The shared
styling handles this for every block; don't fight it in a block's own
stylesheet.

- **Colour:** each block's outer class in `$juizi-layers` sets
  `--link-foreground-color: currentColor`, so links follow the text colour the
  block or item sets. A new block gets this by being added to `$juizi-layers`.
  Anything that sets its own value (buttons, the Callout's link colour) keeps
  it.
- **Underline:** links that aren't in running text (a whole-item link, a
  breadcrumb, a card heading that is the card's link) go in
  `$juizi-plain-links` and lose the underline; links in running text inside
  those go in `$juizi-underlined-links` and keep it. VLT's selector is
  (0,4,1), so these rules repeat the class to outrank it (the same trick
  `buttons.scss` uses).

### Carousel-style controls (Carousel and Gallery)

The two Embla blocks share these decisions, each in its own stylesheet:

- Arrows have the button shape above. "Arrow style" starts with **Standard**
  (dark arrows over the pictures on the sides, outlined in the text colour
  elsewhere); the other choices are the button colours.
- **On phones (768px and below) the arrows always sit in a row below**,
  whatever "Arrow position" says; the field's help text tells editors.
- Arrows only show when there's somewhere to go: not when every slide is in
  view (Carousel) or the row of small pictures fits (Gallery).
- A row that fits across can be aligned left, centre or right (logo strip,
  row of small pictures); once it scrolls, it starts at the left.
- Autoplay and moving strips stop for visitors who ask their device for less
  motion.

## Shared block toolkit (`src/components/Blocks/_shared/`, `src/components/BlockEdit/`)

Code every Juizi block uses. `_shared/` isn't a block: `src/blocks/index.ts`
registers blocks from an explicit list. When a pattern in one block solves a
problem another block also has, it belongs here.

### Edit: `makeBlockEdit` and `juiziSchema`

`makeBlockEdit(View, { getChangedData, normalizeData, getFormData, formKey })`
(`src/components/BlockEdit/BlockEdit.jsx`) is the Edit for every Juizi block.
It renders the View with `isEditMode` as the canvas, and the block's
`juiziSchema` in the sidebar.

- Schemas are registered as `juiziSchema`, **not** Volto's `blockSchema`:
  Volto merges `blockSchema` defaults into every saved block when it renders,
  which would change how older content looks. Schema functions read their
  data with `schemaData(args)`.
- **Dropdowns with number values:** Volto's select widget can't show the
  label of a number value (it looks it up among string keys), so it showed
  "8000" instead of "8 seconds". `makeBlockEdit` hands the form numbers as
  strings for any field with choices (display only; nothing is saved until
  the editor changes a field), and `withSavedChoice` returns string values.
  Views read these fields with `parseInt`, so saved numbers and strings both
  work.
- A View must never do anything in edit mode that it would do for visitors
  (the Redirect never redirects there).

### Components

**`BlockPlaceholder`** — the start screen and the "nothing to show" message,
for when the **whole block** has nothing to show. Only rendered in edit mode;
with no display style chosen, a block's view returns `null` for visitors.

| Prop | Required | Notes |
|---|---|---|
| `blockClass` | yes | The block's own class, so block CSS can scope it. Use a separate class if the block's root class carries box styles (the Redirect uses `redirect-block-placeholder`) |
| `prompt` | yes | One or two sentences telling the editor what to do next |
| `modes` | no | `[{ name, description }]`, one per display style, in dropdown order, in the editor's words |

Styling (`block-placeholder.css`): dashed border, lightest background,
centred, 480px inner width, using `--light`, `--lightest`, `--grey`, `--dark`
with fallbacks.

**`EditHint`** — a short edit-only message **inside the block's own frame**
("Add a heading in the sidebar.", "No results tagged 'Events'…"). Renders
nothing unless `isEditMode`. Props: `isEditMode`, `tone` (`'hint'` or
`'warning'`), `as` (`p` by default; `span` inside a button), `live` (announce
it when it appears, for warnings that follow an editor's change). A hint
follows the block's text colour on a dark background; a warning is a box of
its own, always dark text on a light background, so it stays readable
whatever the block's colours (`edit-hint.css`).

**Unfinished items** (a button without a link, a slide without a picture) use
the class `block__unfinished` (dashed outline) with an `EditHint` as their
text, and are left out for visitors. Flag them only where it helps: the Hero
flags an unfinished button only while it has nothing else in it.

**`BlockErrorBoundary`** — wrap a block's view in it. On an error, editors
see "This block couldn't be displayed. Try undoing your last change…" (in
their language), visitors see nothing, and the error is logged. Pass `resetKey` (e.g.
`JSON.stringify(data)`) so the editor's next change gets a fresh try.

**`BlockWrapper`** — the block's outer container, from
`@kitconcept/volto-bm3-compat`. Under block model 2 it renders
`<div class="block {@type} {className}">`; under block model 3 it renders
nothing and VLT draws the containers. Every Juizi view renders inside it
(placeholders too), with its modifiers in `className`: `type-{style}`,
`align-{x}`, `tone-{light|dark}`. The block's own element keeps its BEM class
but **not** `block`. Before a site switches to block model 3, set
`blockModel: 3` and a `category` on every Juizi block **and** the global
`config.settings.blockModel = 3` in the same release; the `className`
modifiers are dropped under v3, so move them then. In tests,
`jest.mock('../_shared/BlockWrapper')` uses the manual mock in `__mocks__/`.

**Hook-free wrapper** — blocks whose view uses hooks (Embla) check for a
display style in an outer, hook-free component and only mount the inner one
once a style exists (`WrappedEmblaCarousel`, `WrappedEmblaGallery`).

### Helpers

| Module | What |
|---|---|
| `editMode.js` | `isEditing(props)`: `props.isEditMode` (set by makeBlockEdit), else `typeof props.onChangeBlock === 'function'`. Never `props.mode`. |
| `links.js` | `getHref(link)` for every stored shape (object browser array, object, plain string); `''` when there's no link. `isExternalHref(href)` and `externalLinkProps(href)`. No `window` reads, so safe on the server. |
| `images.js` | `getImageUrl`, `getListingImageUrl`, `resolveScales` (size-aware scale picking), `getPickedImageUrl(image, scale)` |
| `choices.js` | `getAlignmentChoices(t)` (Left / Centre / Right, not icons), `getPaddingChoices(t)`, `getVerticalChoices(t)`, `withSavedChoice(choices, saved, formatLabel, t)` for fields that became named choices ("Custom (…)" for unusual saved values; values as strings, see above), `msToSeconds(ms, t)` |
| `i18n.js`, `messages.js` | `translator(intl)` gives schemas and choice lists their `t(message, values)`; `messages.js` holds the text several blocks share. See [Languages](#languages-) |
| `format.js` | `formatDate(value, options, language)`, `formatNumber(value, language)`: in the site's language (pass `intl.locale`), British English for English ("13 November 2024", "1,000"), so the server and every browser agree |
| `anchors.js` | `slugify`, `blockAnchorId(heading, blockId, fallback)` |
| `overlays.js` | `getOverlayChoices(t)` and `overlayStyleToRgba` |
| `items.js` | `withItemTitles(items, ...fields)` names list items in the sidebar after their own heading (VLT's list widget shows `item.title`); `ensureIds(items)` |
| `skeleton.css` | Loading skeleton tiles (`block-skeleton`, `block-skeleton__tile`, `--mixed`) |

## Conventions every block follows

- **First choice:** a block starts with one choice (a display style or type,
  field `displayMode`, never `variation`) with no schema default. Until it's
  made, the sidebar shows only that field, the canvas shows `BlockPlaceholder`
  and visitors see nothing. `isConfigured(data)` on the definition also hides
  VLT's Styling tab until then.
- **Options in the sidebar**, in the order the editor works through them, each
  switch directly above the field it controls; fields appear once they apply.
- **Structure:** each block is a `<section>`, named by its heading through
  `aria-labelledby` when there is one. Block headings are `<h2>` (the Hero's
  can be the page's `<h1>`), item and slide headings `<h3>`. Every block
  should have a heading, even a short one.
- **Decorative backgrounds:** background images, videos and overlays are
  `aria-hidden`; meaning goes in the heading and text.
- **Links:** external links open in a new tab with `rel="noopener noreferrer"`
  (`externalLinkProps`); a card or item has one real link, stretched over the
  card with CSS where the whole card is clickable.
- **Reduced motion:** autoplay, count-ups, moving strips, videos and hover
  zooms stop or don't run for visitors who ask for less motion.
- **Languages:** every string an editor or visitor can read is a translatable
  message, and dates and numbers follow the site's language (`format.js`;
  British English for English). See [Languages](#languages-).
- **Anchors:** blocks with a heading get an id from it (`blockAnchorId`), in
  the same format as before, so existing same-page links keep working.

## Older content

Content from earlier Juizi block add-ons (`customHero`, `buttonRow`,
`multiCard`, `iconLinkRow`, `EmblaCarousel`) is converted to the current
blocks as it loads. See [COMPATIBILITY.md](COMPATIBILITY.md) for what maps
where and what's only partly supported.

Not converted: the standalone `EmblaRatings` block. Its job is now the
Carousel's Reviews style, and reviews saved with the old block have to be
added again in a Carousel.

## Adding a block

Before adding one, check whether the job fits an existing block as a new
display style. A second block that does nearly the same thing leaves editors
choosing between two look-alikes in the chooser, and repeats everything the
first block already handles (scrolling, colours, empty states, translations).
Reviews were added to the Carousel this way instead of porting the old
ratings block; see `EmblaCarousel/README.md`, "Reviews", for how one style
gives the slide fields its own labels and hides the options that don't apply.

1. Put it in `src/components/Blocks/<Name>/`, with a README covering only
   what the block does (see the existing ones), linking back here for shared
   parts.
2. For colour pickers use `getBlockColorList('<id>')` inside the schema
   function, and `isColorDark()` / `getButtonClasses()` / `getColorTextStyle()`
   in the view. Or set `usesThemes: true` to get VLT's theme picker instead.
3. Add a definition to `src/blocks/index.ts` with `usesColors` / `usesThemes`
   so it shows up in the dashboard tables. Its `edit` is
   `makeBlockEdit(View, { … })` and its schema goes in `juiziSchema`.
4. Follow the conventions above: first choice, `BlockPlaceholder`,
   `BlockWrapper`, `isConfigured`. See the `volto-block-standards` skill.
5. Add the block's classes to the lists in `juizi-common.scss`: its two layers
   to `$juizi-layers` (which also makes its links follow its text colour), and
   its preheader, title, description (…) classes to their lists, instead of
   setting their sizes in the block's own stylesheet.
6. Buttons: `getButtonClasses()` in the view, and the button base class in
   `$block-btn-classes` in `buttons.scss`.
7. Text: put every string in the block's `messages.js`, add its title and
   description to `src/blocks/messages.js`, run `make i18n` and translate the
   new entries (see [Languages](#languages-)).

## Quick Start 🏁

### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [uv](https://6.docs.plone.org/install/create-project-cookieplone.html#uv)
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 22
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)


### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:juizi-com/juizi-blocks.git
    cd juizi-blocks
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Fire Up the Servers 🔥

1.  Create a new Plone site on your first run. It is multilingual, with a
    page showing one of each block in every language (see
    [Languages](#languages-)).

    ```shell
    make backend-create-site
    ```

2.  Start the backend at http://localhost:8080/.

    ```shell
    make backend-start
    ```

3.  In a new shell session, start the frontend at http://localhost:3000/.

    ```shell
    make frontend-start
    ```

Voila! Your Plone site should be live and kicking! 🎉 The home page sends
you to `/en`; the block showcase is at `/en/juizi-blocks`, and the dashboard
under Site Setup → Juizi Blocks (log in first).

### Local Stack Deployment 📦

Deploy a local Docker Compose environment that includes the following.

- Docker images for Backend and Frontend 🖼️
- A stack with a Traefik router and a PostgreSQL database 🗃️
- Accessible at [http://juizi-blocks.localhost](http://juizi-blocks.localhost) 🌐

Run the following commands in a shell session.

```shell
make stack-create-site
make stack-start
```

And... you're all set! Your Plone site is up and running locally! 🚀

## Project structure 🏗️

This monorepo consists of the following distinct sections:

- **backend**: Houses the API and Plone installation, utilizing pip instead of buildout, and includes a policy package named juizi.blocks.
- **frontend**: Contains the React (Volto) package.
- **devops**: Encompasses Docker stack, Ansible playbooks, and cache settings.

### Why this structure? 🤔

- All necessary codebases to run the site are contained within the repository (excluding existing add-ons for Plone and React).
- Specific GitHub Workflows are triggered based on changes in each codebase (refer to .github/workflows).
- Simplifies the creation of Docker images for each codebase.
- Demonstrates Plone installation/setup without buildout.

## Code quality assurance 🧐

To check your code against quality standards, run the following shell command.

```shell
make check
```

### Format the codebase

To format and rewrite the code base, ensuring it adheres to quality standards, run the following shell command.

```shell
make format
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Python code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | `zpretty` | XML and ZCML formatting  | -- |
| frontend | ESLint | Fixes most common frontend issues | [`frontend/.eslintrc.js`](./frontend/.eslintrc.js) |
| frontend | prettier | Format JS and Typescript code  | [`frontend/.prettierrc`](./frontend/.prettierrc) |
| frontend | Stylelint | Format Styles (css, less, sass)  | [`frontend/.stylelintrc`](./frontend/.stylelintrc) |

Formatters can also be run within the `backend` or `frontend` folders.

### Linting the codebase
or `lint`:

 ```shell
make lint
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Checks code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | Pyroma | Checks Python package metadata  | -- |
| backend | check-python-versions | Checks Python version information  | -- |
| backend | `zpretty` | Checks XML and ZCML formatting  | -- |
| frontend | ESLint | Checks JS / Typescript lint | [`frontend/.eslintrc.js`](./frontend/.eslintrc.js) |
| frontend | prettier | Check JS / Typescript formatting  | [`frontend/.prettierrc`](./frontend/.prettierrc) |
| frontend | Stylelint | Check Styles (css, less, sass) formatting  | [`frontend/.stylelintrc`](./frontend/.stylelintrc) |

Linters can be run individually within the `backend` or `frontend` folders.

## Languages 🌐

The dashboard and every Juizi block are available in:

| Language | Code | Status |
| --- | --- | --- |
| English | `en` | Source language (British English) |
| French | `fr` | Translated |
| Portuguese | `pt` | Translated |
| Portuguese (Brazil) | `pt_BR` | Translated |
| Spanish | `es` | Translated |
| Afrikaans | `af` | Translated |
| German | `de` | Scaffolding only: falls back to English until translated |

That covers what editors see (the sidebar, the prompts on the canvas, the
dashboard) and what visitors see or hear (default button text such as "Read
more", the Redirect's countdown, the names screen readers announce for arrows
and dots, dates and numbers).

> **These translations were produced by AI** (Claude, Anthropic's AI
> assistant) and have not yet been reviewed by native speakers. They are
> tested for completeness and for technical correctness, not for tone or
> local usage. **We welcome feedback and collaboration:** if a wording is
> wrong, awkward or not what your region would say, please
> [open an issue](https://github.com/juizi-com/juizi-blocks/issues) or send a
> pull request. Corrections from native speakers and translations into
> further languages are very welcome.

### Which language a site gets

The blocks follow the language Volto renders the site in: the site's language
in Plone, with Volto told about it (for a single-language site, start Volto
with `SITE_DEFAULT_LANGUAGE=fr`, or set `config.settings.defaultLanguage` and
`supportedLanguages` in the project's config). The add-on doesn't set or
override the site's language.

Afrikaans isn't in Volto 18's own list of interface languages, so Volto would
render an Afrikaans site in English. The add-on adds it to that list
(`EXTRA_LANGUAGES` in `src/config/settings.ts`); as a result "Afrikaans" is
also offered in Volto's personal preferences. Volto's own interface (toolbar,
core blocks) has no Afrikaans translation yet and stays in English.

Not translated: the default colour and theme names the dashboard starts with
(they are site data, renamed in the dashboard), text editors have already
saved in a block, and the error messages the backend returns if a save is
rejected (the dashboard checks the same rules first, in the editor's
language).

### The development site is multilingual

This repository's own site runs in all six languages, so every translation
can be seen in place:

| Language | Block showcase page |
| --- | --- |
| English | `/en/juizi-blocks` |
| French | `/fr/juizi-blocks` |
| Portuguese | `/pt/juizi-blocks` |
| Portuguese (Brazil) | `/pt-br/juizi-blocks` |
| Spanish | `/es/juizi-blocks` |
| Afrikaans | `/af/juizi-blocks` |

Each page holds a Hero, a Content Row, a Carousel, a second Carousel in its
Reviews style (with made-up reviews), a Gallery and a Callout, written in that
language; the pages are translations of one another, so the
language switcher moves between them. The Redirect block sends visitors away
from the page it is on, so it has a page of its own, `…/juizi-blocks/redirect`,
reached from the Callout; it sends visitors back to the showcase.

- Backend: `make create-site` sets this up on a new site (the example content
  profile, `juizi.blocks:initial`). For a site that already exists, run
  `make create-language-demo` in `backend/`; it is safe to run again. The code
  is in `backend/src/juizi/blocks/setuphandlers/language_demo.py`, the words
  in `language_demo_texts.py`.
- Frontend: `frontend/volto.config.js` loads the add-on as
  `volto-juizi-blocks:languageDemo`, which switches Volto to multilingual with
  these languages. Only this repository's site does that.

Installing the add-on on another site does none of this: neither package
changes a site's languages.

Volto renders pages that aren't content (the dashboard, other control panels)
in the language of the site root when they are loaded directly, which is
English here. Reached from a page in another language without reloading, they
stay in that language.

### Where the translations live

- Frontend: `frontend/packages/volto-juizi-blocks/locales/<code>/LC_MESSAGES/volto.po`
  (one entry per message, with the English text in the `#. Default:` comment).
- Backend: `backend/src/juizi/blocks/locales/<code>/LC_MESSAGES/juizi.blocks.po`
  (the add-on's name and the registry field descriptions).

To correct a translation, edit the `msgstr` in the `.po` file. To add a
language, copy a language folder, change the `Language` headers and translate
(or leave `msgstr ""` to fall back to English), then add the code to
`TRANSLATED` in `src/locales.test.js`, which checks that every listed language
is complete, keeps every `{placeholder}` and is valid for react-intl.

After adding or changing text in the code, regenerate the translation files:

```shell
make i18n
```

### Writing translatable blocks

- Every string an editor or visitor can read is a message: each block has a
  `messages.js` (`defineMessages`, ids `juizi-<block>-<name>`), and
  `_shared/messages.js` holds what several blocks share.
- Components use `useIntl()`. Schemas and choice lists use
  `translator(intl)` from `_shared/i18n.js`: `const t = translator(args.intl)`,
  then `title: t(messages.heading)`. Without `intl` (tests) it returns English.
- Block titles and descriptions (`src/blocks/messages.js`) use the English
  text as the message id, because Volto's block chooser looks a block's
  `title` up that way.
- Dates and numbers: `formatDate(value, options, intl.locale)` and
  `formatNumber(value, intl.locale)`.
- Apostrophes in translations are typographic (’): a straight `'` before `{`
  starts a quoted section in react-intl's message syntax.

## Contributors

- Karel Calitz (Juizi) [karel@juizi.com]
- Claude (Anthropic), AI coding assistant, via Claude Code

## Credits and acknowledgements 🙏

Generated using [Cookieplone (1.1.0)](https://github.com/plone/cookieplone) and [cookieplone-templates (8e49881)](https://github.com/plone/cookieplone-templates/commit/8e498811980e38b7db5d5cb0f5645256feaa8799) on 2026-09-29 07:51:29.370335. A special thanks to all contributors and supporters!
