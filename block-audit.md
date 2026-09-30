# Juizi block audit

**Date:** 2026-09-29
**Standard:** `volto-block-standards` skill (first version, 2026-09-29), section 11 procedure, section 9 checklist
**Scope:** review only. No block code or skill files were changed.

## Environment

| | |
|---|---|
| Volto | 18.32.1 (`frontend/mrs.developer.json`, `core/packages/volto/package.json`) |
| Volto Light Theme | 7.8.6 (pinned in `frontend/package.json` overrides and the add-on's dependencies) |
| Global block model | 2 (VLT sets `config.settings.blockModel = 2`; nothing in this repo changes it) |
| Lint | `pnpm lint` clean (0 warnings) |
| Unit tests | `pnpm test`: 9 suites, 70 tests, all passing |

**Block Model v3 docs checked** (volto-light-theme.readthedocs.io, conceptual guide) and compared with the VLT 7.8.6 source in `node_modules`. The docs and our skill don't fully agree. See "Proposed skill updates" (P1). In short:

- The framework draws both containers, not the block. VLT's `StyleWrapperV3` renders `<div class="block {type} category-{category} …"><div class="block-inner-container">…</div></div>` around the block's View.
- In **view mode**, VLT 7.8.6 only uses that wrapper when the **global** `config.settings.blockModel === 3` (`RenderBlocks.jsx` falls back to the v2 renderer otherwise). In **edit mode**, `EditBlockWrapper.jsx` checks the **per-block** `blockModel`. If you set `blockModel: 3` on one block while the global setting is still 2, edit and view markup would differ.
- `@kitconcept/volto-bm3-compat` is already a dependency of the add-on (`package.json`), but no block imports it.

## 1. Inventory

### Blocks defined in this repo

All of them are registered through the explicit list in `frontend/packages/volto-juizi-blocks/src/blocks/index.ts`. `config/blocks.ts` then installs them into `blocksConfig` under the "Juizi" chooser group. It's a list, not a directory scan, so `_shared/` can't be picked up as a block ✔.

Paths below are relative to `frontend/packages/volto-juizi-blocks/src/components/Blocks/`.

| Block id | Chooser title | Folder | Edit component |
|---|---|---|---|
| `juiziHero` | Hero | `HeroBlock/` | own `Edit.jsx` |
| `contentRow` | Content Row | `ContentRow/` | own `Edit.jsx` |
| `emblaCarousel` | Carousel | `EmblaCarousel/` | own `Edit.jsx` |
| `emblaGallery` | Gallery | `EmblaGallery/` | own `Edit.jsx` |
| `redirectBlock` | Redirect | `Redirect/` | own `Edit.jsx` (inline form, no sidebar) |
| `juiziCallout` | Callout | `Callout/` | shared `components/BlockEdit/BlockEdit.jsx` (`makeBlockEdit`) |

Shared code: `_shared/BlockPlaceholder.jsx`, `_shared/block-placeholder.css`, `components/BlockEdit/BlockEdit.jsx`, `config/colors.js`, `config/buttons.scss`, `theme/juizi-common.scss`.

The legacy content transform (`legacy/`) converts old block types (`customHero`, `buttonRow`, `multiCard`, `iconLinkRow`, `EmblaCarousel`) into the blocks above when a page loads. They are not registered as blocks of their own.

### Blocks from installed Juizi add-ons

**None.** The only Juizi add-on in this project is `volto-juizi-blocks`, and it lives in this repo (`frontend/packages/`). `volto.config.js` loads only that add-on plus VLT.

The add-on pulls in third-party block add-ons: kitconcept banner, button, carousel, heading, highlight, introduction, logos, separator and slider; eeacms accordion; plonegovbr social media; plus VLT's own blocks. **They were not evaluated.** They aren't Juizi blocks, and this skill doesn't govern them. Editors do see them next to ours, though. See the cross-block consistency section on the chooser.

## 2. Summary

Nothing here "passes FTE". Every block is either **ready for FTE** (a human can run the test now) or **not ready** (known hesitation points should be fixed first).

| Block | Source | Has initial view | Edit spreads props into View | Block Model v3 | Colours from master list | README | Overall |
|---|---|---|---|---|---|---|---|
| Hero | repo | ✔ shared `BlockPlaceholder`, per-mode descriptions | ✔ | ✘ (no `blockModel`, no `category`, own containers) | ✔ via `getBlockColorList` (+ "None", justified) | ✔ (partly stale, no happy path) | **Not ready** (2 Must fix) |
| Content Row | repo | ◐ hand-rolled; names don't match the dropdown; no descriptions; "Image card" hidden by VLT CSS | ✔ | ✘ | ✔ | ✔ (stale, no happy path) | **Not ready** (3 Must fix) |
| Carousel | repo | ✔ shared, per-mode descriptions; ✘ no empty state | ✔ | ✘ | ◐ picker ✔, but text tone is a manual field | ✔ (no happy path) | **Not ready** (3 Must fix) |
| Gallery | repo | ✔ shared, empty state ✔; mode descriptions are jargon | ✔ | ✘ | ◐ adds raw `#ffffff`; manual text tone | ✔ (no happy path) | **Not ready** (1 Must fix) |
| Redirect | repo | ◐ inline form on canvas; unconfigured message leaks to live site | ✘ (by design, see P3) | ✘ | n/a | ✘ | **Not ready** (1 Must fix) |
| Callout | repo | ✔ shared, per-type descriptions; one-off empty hint | ✔ (`makeBlockEdit`, also passes `isEditMode`) | ✘ | ✔ | ✘ | **Not ready** (0 Must fix; closest to ready) |

## 3. Per-block findings

Format: **priority** · rule broken · what the editor experiences · where.

"Verified" means read in the code. None of these were reproduced in a running browser. Three findings are marked **(verify in browser)** because the code strongly suggests them, but the runtime effect needs confirming.

---

### 3.1 Hero (`juiziHero`)

**Already meets the standard (keep these patterns):**

- The mode picker uses the shared `BlockPlaceholder` with per-mode descriptions. Edit mode is detected with `typeof props.onChangeBlock === 'function'`, and view mode returns `null` (`View.jsx:586-610`).
- `Edit` renders `<View {...props} />`.
- Only the mode field shows until a mode is chosen. Choosing a mode the first time seeds defaults without overwriting data (`Edit.jsx:23-52`).
- Progressive disclosure is good: title and subtitle fields appear only when "Use page title/description" is off, side-image options only once an image is chosen, TOC options only in TOC mode, and the overlay only when there's a background image.
- The logo/side-image clash is handled for the editor ("Locked to 'Above title'…"), not left to break silently.
- Colours come from `getBlockColorList('juiziHero')`, `getColorChoices` and `isColorDark`, plus `getColorTextStyle` for text.
- Accessibility is strong: `section` with `aria-labelledby`, an h1/h2 choice, a visually hidden title option, decorative media is `aria-hidden`, video pauses under reduced motion, and the breadcrumbs are a proper `nav`.
- The TOC mode has an edit-only empty message.
- `button` labels auto-fill from the link title.

**Before building / structure**

- **Must fix** · §3 initial view (no publishable placeholder content), §7 mismatched assumptions · **Section mode shows the page's title and description, not the editor's own heading.**
  - `getInitialDataForMode('section')` seeds `title: 'Block title'` but doesn't set `usePageTitle`/`usePageDescription`. Both View and schema treat "unset" as `true` (`View.jsx:624-625`, `schema.js:77-78`).
  - An editor adds a mid-page Section band and sees the page title repeated. The Title field is hidden. To write their own heading they have to find "Page defaults" → untick "Use page title", and then they meet the seeded "Block title" text, which is publishable.
- **Must fix** · §7 state always visible · **Two Hero blocks on one page fight over body classes.** **(verify in browser)**
  - `View.jsx:726-745` adds or removes `has-hero-primary-heading` and `has-hero-breadcrumbs` on `<body>` during every render. The last block to render wins.
  - A page with a Hero (primary heading on) followed by a Section (primary heading off) removes the class. The page's default title and date (`style.css:454-459`) come back, and the page shows the title twice.
  - Nothing cleans up when a Hero is deleted in the editor.
- **Should fix** · §5 controls next to what they affect · **Section mode shows two separate "Background" panels.**
  - `schema.js:163` and `schema.js:184` both define fieldset id `background`: image/position/overlay in one, colour in the other. That's also a duplicate React key.
- **Should fix** · §5 plan the sidebar in the order the editor thinks · The first fieldset ("Options") puts heading semantics ("This is the primary page heading", "Hide title visually") and "Custom CSS class" straight after the mode, before any content.
  - The editor's first decisions after picking a mode are about accessibility plumbing.
  - The fieldset order is: Options → Content → Side image → Page defaults → Background → Buttons → Layout. "Page defaults" holds the switches that decide whether the title field even exists, but it sits below Content.

**During**

- **Should fix** · §6 editor copy:
  - "Block mode", "Preheader", "Auto-generate from page headings (TOC)", "Include H2 headings" / "Include H3 headings", "Custom CSS class" (`schema.js:249`), "Full-bleed".
  - The `showBreadcrumbs` description is 80+ words of implementation detail.
  - "Center" (`schema.js:422`) should be "Centre".
- **Should fix** · §6 SA/British English (visitor-facing) · Dates are formatted `en-US` (`View.jsx:68`, `View.jsx:632`), so a news item shows "November 13, 2024".
- **Should fix** · §3 no publishable placeholder content · A button with no label renders "Click here" (`View.jsx:402`), or "Link" in list mode. A button with no link renders `href="#"`. The editor gets no warning, and it looks publishable.
- **Nice to fix** · §4.3 wrapper classes · Has `hero-block block type-{mode}` ✔. Alignment sits on the inner element (`hero-block__inner--align-*`), not as `align-*` on the wrapper. Tone is `bg-dark`/`bg-light`, not `tone-*`.
- **Nice to fix** · `enableStyling: true` in `blocks/index.ts:72` isn't read by Volto, VLT or this add-on. It's dead configuration.

**Before shipping**

- **Most likely editor mistake:** adding a Section band and publishing it with the page title repeated (see the first Must fix).
- **README** (`readme.md`) exists but:
  - says "three modes" (there are two)
  - documents the colour system more than the block
  - has no happy path
  - still names plone.org as the target

**Hesitation points for the human FTE:** the Section band showing the page title; the two "Background" panels; "Preheader"; "Page defaults"; what "TOC" means.

---

### 3.2 Content Row (`contentRow`)

**Already meets the standard:**

- `variation` comes first, and nothing else shows until it's chosen.
- `Edit` spreads props into `View`.
- Switching variation keeps headings, text and links (`migrateItems`). The description tells the editor so.
- The items fieldset stays visible even with zero items. The code comment explains why, which is a good pattern.
- Colours come from `getBlockColorList('contentRow')`.
- Statistics are accessible: the animated number is hidden from screen readers and a single final value is announced. The count-up respects reduced motion, and so does the mobile carousel's autoplay.
- Hooks sit only in child components (`CountUp`, `MobileCarousel`), so the early placeholder return is safe without a separate wrapper.

**Before building / structure**

- **Must fix** · §2 core task, §7 · **Editors can't choose "Image card" at all.** *(Added after the first draft; the developer pointed to the CSS.)*
  - VLT 7.8.6 hides the fourth option of every select whose field id is `variation`: `.inline.field.field-wrapper-variation .react-select__menu-list [id$='-option-3'] { display: none; }` (`volto-light-theme/src/theme/blocks/_listing.scss:2-8`). It's meant to hide Event Calendar in Listing blocks, but it matches any field with that id.
  - Content Row's style field is `variation`, and its fourth choice is `card` / "Image card" (`schema.js`). The dropdown shows only Numbered, Icon and Statistics, while the start screen lists "Image card" (and "Image above"). The editor can't get to either.
  - Juizi has an override for this in another theme (`display: block !important` on the same selector), but it isn't in this repo. That override is sitewide, so it also shows Event Calendar in Listing blocks again, which undoes what VLT meant to do.
  - Hero (`blockMode`), Carousel and Gallery (`displayMode`) and Callout (`calloutType`) use other field ids, so they aren't affected. The Carousel's "Image above content" is visible.
  - Fix options: rename the field (for example to `displayMode`, which matches Carousel and Gallery) and migrate saved data. `legacy/blocks.js` `repairCurrentBlock` already does this kind of repair. Or scope an override to Content Row. Reordering the choices would only hide a different option.
- **Must fix** · §3 "never renders placeholder content that could be published by accident" · **Choosing a style seeds three or four items of dummy content** (`Edit.jsx:18-115`): "First step / Describe this step.", "Statistic label" with values 1000+ / 250% / 42, "Card title / Card description. / Read more".
  - To the editor these look finished. A time-pressured editor who changes only the first item publishes the rest.
- **Must fix** · §3.1 mode picker (shared component, per-mode descriptions) · **The placeholder names options that aren't in the dropdown.**
  - The hand-rolled placeholder (`View.jsx:781-790`) lists "Numbered · Statistics · Icon · Image above · Image card".
  - The dropdown offers Numbered / Icon / Statistics / Image card. "Image above" is a sub-option of Image card ("Image layout", in a second fieldset).
  - The editor looks for "Image above" in the list and can't find it. There are no descriptions either.
- **Should fix** · §5 order the sidebar the way the editor thinks · Items (the core task) is the **last** fieldset: Options → Header → Options (again) → Layout → Mobile → Items.
  - Two fieldsets are both titled "Options".
  - Block background colour and padding sit in the first "Options", above the heading.
- **Should fix** · §3.2 configured-but-empty · With a style chosen and all items removed (and no heading), the block renders an empty `<section>`. The editor sees a blank area and gets no prompt.

**During**

- **Should fix** · §7 visible feedback **(verify in browser)** · The sidebar form's `key` includes `items.length` (`Edit.jsx:217`), so adding or removing an item remounts the whole form. The editor probably loses their scroll position and the open item, just after adding one.
- **Should fix** · §5 sensible defaults · Column-width choice `'60-30'` is labelled "60% / 30%" and maps to `[60, 30]` (`schema.js:541`, `View.jsx:864`). *(Corrected: the values are flex-grow ratios, so this gives a two-thirds / one-third split. The layout is fine and the label is wrong. See CR7 in `block-audit-actions.md`.)*
- **Should fix** · §6 editor copy:
  - "Preheader", "Item label (sidebar only)" on every item (a second title the editor has to keep in sync with Heading), "Count-up duration (ms)" (`schema.js:497`), "Custom CSS class".
  - The heading description mentions "same-page TOC links".
  - "Center".
- **Nice to fix** · §4.3 wrapper classes · `content-row content-row--{variation} …`: no `block`, no `type-{variation}`.
- **Nice to fix** · `import * as LucideIcons from 'lucide-react'` (`View.jsx:2`) pulls every Lucide icon into the bundle. The Callout block already avoids this (`Callout/icons.js` header comment).
- **Nice to fix** · README says statistics count up "on scroll", but `CountUp` starts on mount. Server-rendered HTML shows `0` until JavaScript runs.

**Before shipping**

- **Most likely editor mistake:** publishing seeded "Describe this step." items.
- **README** (`Readme.md`) is stale:
  - The registration snippet shows `group: 'common'`, `mostUsed: true` and `multiCard`/`iconLinkRow` aliases that no longer exist. Those types are converted by `legacy/` now.
  - It warns about a React 19 crash that belongs to another project.
  - Its "Block model v3" section describes mode-gating, not BM3.
  - There's no happy path.

**Hesitation points:** "Image card" missing from the dropdown; the placeholder/dropdown mismatch; which seeded items are real; finding Items at the bottom; "Item label (sidebar only)" vs "Heading".

---

### 3.3 Carousel (`emblaCarousel`)

**Already meets the standard:**

- Mode picker via the shared `BlockPlaceholder`, with good plain-language descriptions.
- Hook-free outer wrapper (`WrappedEmblaCarousel`, `View.jsx:1200-1215`). This is the reference pattern.
- `Edit` spreads props (`<View {...props} id={block} />`), with a unit test for it (`Edit.test.jsx`).
- Only the mode field shows until a mode is chosen, and the listing fields appear only with "Use content query".
- Reduced motion is respected. The marquee has its own options fieldset. Wrapper carries `type-{mode}`, `align-*` and `tone-*`.
- Colour pickers use `getBlockColorList('emblaCarousel')`.

**Before building / structure**

- **Must fix** · §3.2 configured-but-empty · **After picking a display style, the canvas shows nothing.** Slides start empty and there's no "add slides" prompt. The same happens when a content query returns no results.
  - The editor has just followed the placeholder's instruction and the block apparently disappeared. The Gallery block shows the right pattern (`EmblaGallery/View.jsx:505-511`).
- **Must fix** · §7 error messages / know the error boundary · `CarouselErrorBoundary` renders `null` on any error (`View.jsx:94`). In the editor the block silently vanishes, with no message and no next step.
- **Must fix (verify first)** · §8 stability **(verify in browser)** · `renderLink` reads `window.location.hostname` during render for any `http…` link (`View.jsx:636`).
  - A manually added slide with an external link and a button label would throw on the server render.
  - `isExternalHref` in Hero and Content Row wraps the same check in `try` and doesn't have this problem.
- **Should fix** · §4.4 colours, §7 · **Text colour is a manual choice.**
  - `textTone` ("Heading & dots colour", `schema-base.js:453`) defaults to Dark, whatever the background.
  - An editor who picks a dark background gets dark headings on it until they find a second setting in the same panel. `isColorDark()` already knows the answer. The block background also doesn't use `getColorTextStyle`.
- **Should fix** · §6, §5 · "How to use" (`marqueeHelp`, `schema-base.js:470`) is a **string field**, so it renders as an editable text box. The editor can type into it, and what they type is saved.
  - Its text is jargon: "Image items", "Link items with a linked preview image", "results limit (batch size)".
- **Should fix** · §7 visible feedback · "Filter tabs" shows for manually added slides, but manual slides have no tags field. Tabs only appear when a slide's `Subject` matches (`View.jsx:383-420`). The editor types tags and nothing happens.

**During**

- **Should fix** · §6 editor copy:
  - "Use content query", "Time between slides (ms)", "Logo height (px)" / "Gap (px)" / "Padding (px)", "Custom CSS class", "On screens 768px wide and below".
  - "Arrow colour" offers button choices ("Blue — Solid", "Blue — Outlined", `schema-base.js:390`).
  - Three different fields are all titled "Button style".
  - "Center".
- **Should fix** · §3 no publishable placeholder · Image-only slides without an image render the text "No image" on the live site (`View.jsx:1062`).
- **Should fix** · §8 accessibility · Clickable slides are `div role="button"` that navigate (`View.jsx:1038`). That's a link announced as a button, and the slide's own button sits inside it (interactive inside interactive). Space doesn't `preventDefault`, so pressing it also scrolls the page.
- **Nice to fix** · §4.3 · Wrapper has no generic `block` class. External-link detection differs from the other blocks (`startsWith('http')` vs `isExternalHref`). Clickable internal slides do a full page load (`window.location.href`), not router navigation.
- **Nice to fix** · The dashboard description says "Embla carousel…" (developer term; admin-facing).

**Before shipping**

- **Most likely editor mistake:** picking a style, seeing nothing, and deleting the block, or leaving an invisible empty block on the page.
- **README** exists; no happy path. Its "Block model v3" section describes mode-gating, not BM3.

**Hesitation points:** the empty canvas after the mode choice; where slides are added; the manual text tone; the "How to use" box.

---

### 3.4 Gallery (`emblaGallery`)

**Already meets the standard:**

- Mode picker and configured-but-empty state both use the shared `BlockPlaceholder`. The empty message says what's missing and what to do: "No pictures found. Add some to this page, or choose a different image source…". This is the reference pattern.
- `sourceMode` sits directly under `displayMode`.
- Hook-free wrapper. `Edit` spreads props.
- Wrapper is `gallery block type-{mode} align-* tone-*` ✔ (the only block that meets §4.3 fully).
- The lightbox is `role="dialog"` + `aria-modal`, closes on Escape, moves focus in and back out, and has labelled controls.

**Before building / structure**

- **Must fix** · §6 editor copy, §3.1 "what each option gives them" · **Mode descriptions are developer language** (`View.jsx:684-692`):
  - "Grid of blocks: equal-ish thumbnails with a configurable column count per breakpoint".
  - "Masonry: CSS-column layout, collapsing to a single column on mobile so item order stays predictable".
  - "Blocks" means something else to a Volto editor, and "Masonry", "breakpoint" and "CSS-column" mean nothing to them. This is the block's first screen.
- **Should fix** · §7 visible feedback **(verify in browser)** · There's no loading state. While the image request is in flight, `items` is empty, so the editor probably sees "No pictures found" flash, or stay up on a slow site, before the images arrive.
- **Should fix** · §4.4, §7 · Manual `textTone` ("Heading colour", `schema-base.js:254`), same problem as the Carousel. "Active thumbnail border colour" adds raw `#ffffff` outside the master list (`schema-base.js:232`). That's allowed with a stated reason, but none is given.

**During**

- **Should fix** · §7 feedback · In Masonry, "Columns (mobile)" is shown but ignored below 540px, where the CSS forces one column (`gallery-base.css:107`). The editor changes it and nothing happens on a phone.
- **Should fix** · §6 copy:
  - "Current item's contents", "Include content types", "Link (with a preview image)", "Content query".
  - "Screens 769–992px wide", "Gap between images (px)", "Thumbnail height (px)", "Time between slides (ms)", "Custom CSS class".
- **Should fix** · §8 accessibility · Images open the lightbox through `div role="button"` (`View.jsx:457`). The same Space-key issue as the Carousel.
- **Nice to fix** · Block background doesn't use `getColorTextStyle`.

**Before shipping**

- **Most likely editor mistake:** choosing "Current item's contents" on a page with no images inside it. That's handled well by the empty-state message.
- **README** exists and documents known trade-offs honestly (masonry reading order, duplicated resolvers). No happy path.

**Hesitation points:** the mode descriptions; "Current item's contents"; the flash of "No pictures found".

---

### 3.5 Redirect (`redirectBlock`)

**Already meets the standard:**

- The canvas explains itself: "Redirect visitors to …", "Visitors will be redirected automatically. Editors are not redirected."
- Logged-in users see a preview line, not a redirect.
- The countdown is announced (`role="status"`).

**Before building / structure**

- **Must fix** · §3 "never renders … on the live site", §6 · **With no URL set, anonymous visitors see "Redirect block: no URL configured."** (`View.jsx:52`). The editor saves an empty block and the public page shows a developer-style error.
- **Should fix** · §7 dangerous actions · Adding this block takes the page away from every visitor, but the canvas treats it like any other block. The most likely mistake is picking the current page itself, or a page that redirects back, which gives visitors an endless redirect loop. Nothing checks for it.
- **Should fix** · §7 know the error boundary · The redirect happens only in the browser, after a 3-second countdown (`history.push` or `window.location`). Crawlers and no-JS visitors get the original page, and search engines keep indexing it. If a real server-side redirect is the intent, the editor should use Plone's URL management. Say so in the block, or handle it on the server.
- **Should fix** · §4.1 · Uses `mode === 'edit'` (`View.jsx:28`), which the skill says isn't reliable. It works today only because `Edit` never renders `View`.

**During**

- **Nice to fix** · The label "Redirect visitors to" and the widget title "Redirect URL" say the same thing twice. "URL" is mild jargon.
- **Nice to fix** · Hard-coded colours in `redirect-block.less`. `var(--lightgrey)` / `var(--grey)` have no fallbacks.
- **Nice to fix** · No `block` class, no BM3.

**Before shipping**

- **README missing.**
- **Most likely editor mistake:** saving without a URL, or pointing at the page itself.

**Hesitation points:** what visitors will see while it counts down; whether search engines follow the redirect.

---

### 3.6 Callout (`juiziCallout`)

**Already meets the standard:**

- Type picker via the shared `BlockPlaceholder`, with per-type descriptions (`types.js`).
- No schema defaults, so choosing a type isn't skipped. The code comment explains why.
- Choosing a type seeds the icon.
- Older callouts without a type still render (`isCalloutConfigured`).
- Colours use `getBlockColorList` and `getColorTextStyle`. The field labels are clear ("Text colour follows the background automatically", "Same as text").
- The only block with translatable strings (`defineMessages`).
- Lucide icons are imported individually.
- Uses the shared `makeBlockEdit`.
- Has unit tests.

**Before building / structure**

- **Should fix** · §7 mismatched assumptions · The type descriptions promise a difference ("Warning: something the reader needs to be careful about"), but the type only chooses the starting icon. No CSS targets `juizi-callout--{type}`.
  - An editor who picks "Warning" expects a warning-coloured box and gets a plain box with a triangle.
  - After the first choice, the type field disappears from the sidebar (`schema.js:56`), so they can't see or change what they picked.
- **Should fix** · §3.2 configured-but-empty · Uses a one-off `.juizi-block__placeholder` line inside the callout (`View.jsx:80`), not `BlockPlaceholder`. Whether that's actually worse for the editor is a fair question. See P4.

**During**

- **Nice to fix** · Icon colour and link colour choose from the background list with no contrast guard. The editor can pick an icon colour that matches the background.
- **Nice to fix** · Wrapper is `juizi-block juizi-callout juizi-callout--{type}`: no `block`, no `type-{type}`.
- **Nice to fix** · The dashboard description says "lucide icon" (admin-facing jargon).

**Before shipping**

- **README missing.**
- **Most likely editor mistake:** choosing a type for its look.

**Hesitation points:** "why doesn't Warning look like a warning?"

This is the closest block to "ready for FTE". Fixing the type/look mismatch probably gets it there.

---

## 4. Cross-block consistency

### Same task, different interaction (§7)

| Task | How the blocks differ |
|---|---|
| **Choosing the first option** | Field is called "Block mode" (Hero), "Display style" (Content Row, Carousel, Gallery) or "Callout type" (Callout). Content Row's placeholder is hand-rolled with bare names; the others use `BlockPlaceholder` with descriptions. Pick one label ("Display style" reads best) unless the difference means something. |
| **Adding items** | Hero buttons, Content Row items and Carousel slides all use `object_list`, but with different item titles. Content Row asks for a separate "Item label (sidebar only)". Carousel uses `titleField: 'heading'`, which is better: no duplicate field. Content Row pre-fills dummy items. The Carousel starts empty and shows no prompt. Gallery has no manual items at all (context or query only). |
| **Picking images** | All use `object_browser` in image mode. Alt text is handled three ways: Hero side image has an explicit "Alt text" field; Content Row and Carousel reuse the heading as alt text (the description says so); Hero background is declared decorative. That's defensible, but it should be one documented rule. |
| **Background colour** | "None (transparent)" (Hero, Content Row) vs "None" (Carousel, Gallery) vs a placeholder "None" with no stored value (Callout). The field sits in "Options" (Content Row), "Background" (Hero, Section), "Appearance" (Carousel, Gallery) or "Colours" (Callout). |
| **Text colour on a background** | Automatic via `isColorDark` / `getColorTextStyle` (Hero, Content Row, Callout) vs a manual "Heading colour" / "Heading & dots colour" field (Carousel, Gallery). |
| **Button styles** | Everyone uses `getButtonChoices` ✔. The Carousel also uses button choices for arrow colour, and the Gallery for "Arrow & lightbox control colour". |
| **Empty states** | `BlockPlaceholder` (Gallery); inline hint (Callout); inline notice (Hero TOC, `hero-toc-empty-notice`); nothing (Carousel, Content Row); visitor-visible error (Redirect). |
| **Error handling** | Carousel and Gallery each have their own identical error boundary that renders `null`. The others rely on Volto's. |
| **Sidebar order** | Hero: Options → Content → … → Layout. Content Row: Options → Header → Options → Layout → Mobile → Items. Carousel: Content → Card layout → Scrolling → Navigation → Appearance. Gallery: Content → Grid/Carousel → Appearance → Lightbox. Callout: Default → Colours. "Custom CSS class" appears in four blocks, three of them in the first or main panel. |
| **Units** | Milliseconds (Carousel, Gallery, Content Row), pixels (Carousel, Gallery), named sizes (Hero padding, logo size). |
| **Spelling** | "Center" in Hero, Content Row and Carousel; "Centre" in Carousel's "Centre active card". |
| **Edit-mode detection** | `typeof onChangeBlock === 'function'` (Hero, Content Row, Carousel, Gallery), an `isEditMode` prop from `makeBlockEdit` (Callout), `mode === 'edit'` (Redirect). |
| **i18n** | Only the Callout uses `defineMessages`. Everything else is hard-coded English. |
| **Block chooser** | All six Juizi blocks sit in a "Juizi" group next to kitconcept blocks with overlapping purposes: kitconcept Carousel/Slider vs our Carousel; Banner/Introduction vs our Hero; Highlight vs Hero section. An editor with no context sees two "carousel" blocks. That's a site-configuration decision (restrict or hide one set), not a block fix. |

### Duplicated code that `_shared` should replace

1. **`BlockPlaceholder` itself doesn't match the skill's spec.**
   - The component renders `block-placeholder {blockClass} {blockClass}--placeholder` with `block-placeholder__inner` and a `<ul>` of modes.
   - Its CSS hard-codes `#c7c7c7` / `#fafafa` / `#444`.
   - The skill specifies `{blockClass} block block--placeholder`, `block__placeholder-inner`, `<p>` with `<br />`, and `--light`/`--lightest`/`--grey`/`--dark` variables with fallbacks.
   - There's no `_shared/README.md` (the skill's §10 refers to one).
   - One of the two needs to change. See P2.
2. **Content Row's own placeholder** (`View.jsx:778-791`) plus leftover placeholder CSS in `ContentRow/style.css` and `HeroBlock/style.css:426-440` should go.
3. **The Callout's empty hint and the Hero TOC notice** are two more one-off empty states (see P4).
4. **Link helpers**: `getHref` / `isExternalHref` are copied in Hero and Content Row. The Carousel and Gallery have their own variants, and the Redirect has a regex. They should live in one `_shared/links.js`, which also fixes the Carousel server-render risk.
5. **Image scale resolvers** (`getImageUrl`, `resolveScales`, `getListingImageUrl`) are copied between Carousel and Gallery. The Gallery README already says so.
6. **Overlay choices and `overlayStyleToRgba`** are duplicated in Hero and Content Row (schema and view).
7. **Padding choices** (none/compact/default/spacious/extra-spacious) are duplicated in Hero and Content Row, with different labels ("Top padding" vs "Padding top").
8. **Slug and anchor-id generation** is written four times (Hero, Content Row, Carousel, Gallery).
9. **Error boundaries**: `CarouselErrorBoundary` and `GalleryErrorBoundary` are identical. One shared boundary that shows an edit-mode message and renders `null` for visitors would fix both Must fixes at once.
10. **`makeBlockEdit`**: the Callout's shared Edit already handles "render View + sidebar + first-choice seeding" (`getChangedData`). Hero, Carousel and Gallery each hand-write the same thing. It could become the default Edit.

## 5. Suggested order of work

Editor-facing problems come first, then structural ones. Every step below goes ahead only after the developer agrees (§11.5).

**Editor-facing**

1. **Redirect:** never render the "no URL configured" text to visitors; add a self-redirect guard. (Must)
2. **Hero:** Section mode shouldn't pull in the page title/description; fix the body-class conflict between several Hero blocks. (Must)
3. **Content Row:** make "Image card" selectable (VLT hides the fourth `variation` option); stop seeding dummy items; move to the shared `BlockPlaceholder` with the real option names and descriptions. (Must)
4. **Carousel:** add a configured-but-empty state; replace the silent error boundary (shared boundary, see §4 item 9); check and fix the server-render `window` access. (Must)
5. **Gallery:** rewrite the mode descriptions in editor language. (Must)
6. **Carousel and Gallery:** derive text tone from the background; remove the editable "How to use" field; handle filter tabs on manual slides; add a Gallery loading state; make Masonry's mobile columns honest. (Should)
7. **Callout:** make type and look agree, or stop implying they differ; keep the type visible. (Should)
8. **Copy pass across all blocks:** jargon, units, "Centre", the SA date format in the Hero, "Click here"/"No image" fallbacks. One consistent label for the first choice. (Should)
9. **Sidebar order:** Content Row's Items higher up; Hero's single Background panel; "Custom CSS class" into an "Advanced" fieldset in every block. (Should)
10. **Accessibility:** clickable cards and images as links or real buttons; Space-key handling. (Should)

**Structural**

11. Reconcile `BlockPlaceholder` with the skill (P2) and add `_shared/README.md`.
12. Pull the duplicated helpers into `_shared/` (§4 list).
13. Wrapper classes: `block` + `type-{mode}` + `align-*` / `tone-*` on the blocks that lack them.
14. READMEs: write them for Redirect and Callout; correct the stale Hero and Content Row ones; add a happy path to every block once the human FTE has been run.
15. Block Model v3: only when a block is being reworked anyway, and only after the global vs per-block question (P1) is settled for this VLT version.

### Changes that affect content already saved on live pages

These need a default for old data, a legacy-transform rule (`legacy/blocks.js` already has `repairCurrentBlock` for this) or an explicit decision:

- **Hero section title (step 2).** Existing Section blocks with no `usePageTitle` currently show the page title. If "unset" is reinterpreted as `false`, live pages switch to showing `data.title`, which may be "Block title" or empty. Safer: set `usePageTitle: false` / `usePageDescription: false` only in `getInitialDataForMode('section')` for new blocks, and leave old data alone, or migrate it on purpose.
- **Text tone (step 6).** Saved Carousel and Gallery blocks have `textTone: 'dark'` written by the first-choice defaults. If the tone is derived from the background, decide whether saved values still win. If they do, old dark-on-dark blocks stay as they are.
- **Content Row field rename (`variation` → e.g. `displayMode`).** Every saved Content Row stores `variation`. A rename needs a `repairCurrentBlock` rule that copies the old key, like the Carousel's `mode` → `displayMode`, or live blocks fall back to the empty start screen and render nothing for visitors.
- **Content Row `'60-30'` ratio.** *(Corrected: the values are flex ratios, so relabelling fixes it with no layout change. See CR7.)*
- **Removing `marqueeHelp`.** Harmless for rendering, but saved blocks may have stray `marqueeHelp` text in their data.
- **Gallery "Grid of blocks" wording.** Change the label only, not the stored value `blocks`.
- **Adding the generic `block` class.** It's additive, but VLT styles `.block` in places, so blocks may pick up new spacing. Check on a page with saved content.
- **Block Model v3.** It changes the outer markup, so any site CSS targeting the current wrappers (`hero-block`, `content-row`, `embla`, `gallery`) needs checking. Setting the global `blockModel = 3` changes rendering for **every** block, the third-party add-on blocks included.

## 6. Proposed skill updates (§12, not applied)

Each item says what to change and why. Wording is a proposal for the developer to accept, change or reject.

**P1. §4.2 Block Model v3: the opt-in advice and container ownership don't match VLT 7.8.6.**

- *Found:*
  - View rendering honours per-block `blockModel: 3` only when the global `config.settings.blockModel` is 3 (`RenderBlocks.jsx`). Edit rendering checks the per-block value regardless (`EditBlockWrapper.jsx`).
  - The outer `block {type} category-{category}` and inner `.block-inner-container` are rendered by VLT's `StyleWrapperV3`, not by the block.
  - `@kitconcept/volto-bm3-compat`'s `BlockWrapper` exists for exactly this dual-mode case, and it's already a dependency here.
- *Proposed change:* replace the first two bullets of §4.2 with:
  > - Opt in with `blockModel: 3` and a `category` in `blocksConfig`. In VLT 7.x, view mode only uses the v3 wrapper when `config.settings.blockModel = 3` globally, and blocks without `blockModel: 3` then keep the v2 wrapper. Setting the per-block key while the global setting is 2 gives different edit and view markup: don't.
  > - The framework renders both containers (outer `block {type} category-{category}`, inner `.block-inner-container`). The block's View renders content only, with no outer wrapper of its own. For blocks that must work under both models, wrap the View in `BlockWrapper` from `@kitconcept/volto-bm3-compat`.
- Also record the VLT version this was checked against (7.8.6).

**P2. §3.1 The `BlockPlaceholder` spec doesn't match the component.**

- *Found:* the class names, markup, list format and CSS variables all differ (see §4 item 1). The README that §10 points to doesn't exist in this repo.
- *Proposed change:* decide which one is canonical. Then either update the "Renders" block and the Styling bullet in §3.1 to the current markup, or open a task to change the component. Add "`_shared/README.md` exists in every project that copies the component" to §4.5.

**P3. §4.1 "Edit wraps View" doesn't fit blocks that aren't visual.**

- *Found:* the Redirect block's canvas is a form, and that's the right choice. There's nothing to preview except a countdown the editor must never trigger.
- *Proposed addition to §4.1:*
  > Exception: a block with no visual output for visitors (such as a redirect or a tracking snippet) may render an explanatory panel on the canvas instead of `View`. It must still say what visitors will get, and its View must never render editor messages to visitors.

**P4. §3.2 Configured-but-empty: say whether an in-block hint is acceptable.**

- *Found:* the Callout shows its empty hint inside the real callout frame (icon, background). That arguably teaches the editor more than a dashed box would. The Hero TOC notice does the same inside the buttons row.
- *Proposed:* either keep the strict rule and make both use `BlockPlaceholder`, or allow:
  > When the block's own frame is visible and helps the editor understand the result, a short hint inside it is acceptable, using the shared `.block__empty-hint` class (edit mode only).

  Pick one; right now the code does both.

**P5. §3 Seeded content.**

- *Found:* Content Row seeds dummy items that look publishable. The current wording ("never renders placeholder content that could be published by accident") is about what renders, and an editor could argue seeded data isn't "placeholder".
- *Proposed addition:*
  > Don't seed items with example text or numbers. Seed structure only (an empty item, or none) and let the empty state prompt the editor.

**P6. §4.4 Colours: the master list has moved, and text tone needs an explicit rule.**

- *Found:*
  - The master list is now managed in Site Setup → Juizi Blocks and loaded at runtime, with per-block narrowing via `getBlockColorList(id)`. It isn't a constant in `src/index.js`.
  - Two blocks offer a manual "Heading colour" field that fights `isColorDark()`.
- *Proposed replacement for §4.4:*
  > Background colour choices come from the site's colour list (Site Setup → Juizi Blocks, `MASTER_COLOR_LIST` in `config/colors.js`), read at schema time with `getBlockColorList('<blockId>')` and `getColorChoices()`. Text colour on a background is derived with `isColorDark()` / `getColorTextStyle()`. Don't give the editor a separate text-tone choice. A block may add options on top (e.g. "None") when it has a stated reason.

**P7. §6 Units.**

- *Found:* ms and px fields in three blocks.
- *Proposed addition to §6:*
  > Don't ask editors for milliseconds or pixels. Use seconds, or named sizes (Small / Medium / Large). Where a number is unavoidable, say what it looks like ("8 = eight seconds").

**P8. §4.5 / §10 Registration and shared Edit.**

- *Found:* this project registers blocks through a definition list (`blocks/index.ts`) that also feeds the dashboard toggles. The skill only mentions directory scans or explicit `index.ts` lists. `makeBlockEdit` already implements "Edit = View + sidebar + first-choice seeding" generically.
- *Proposed:*
  - Add to §4.5: "Where the project uses a block definition registry (`blocks/index.ts`), register there, not directly in `blocksConfig`."
  - Add `components/BlockEdit/makeBlockEdit` to §10 as the default Edit for blocks without inline editing.

**P9. §4.1 Edit-mode detection.**

- *Found:* `makeBlockEdit` passes `isEditMode` explicitly as well as the full props. It's clearer, and it can't be broken by a subset-props bug.
- *Proposed:* allow either `typeof props.onChangeBlock === 'function'` or an explicit `isEditMode` prop set by the shared Edit. Name `mode === 'edit'` as the one to avoid.

**P10. §10 Reference implementations.**

- *Found:* the references point to the plone.org rebuild. This repo carries the same blocks, and two of them have findings against the very pattern they're cited for:
  - HeroBlock (cited for its mode picker) seeds a hidden "Block title" and shows the page title in Section mode.
  - EmblaCarousel (cited for the hook-free wrapper) has no empty state and a silent error boundary.
- *Proposed:* point §10 at `juizi-blocks` (`frontend/packages/volto-juizi-blocks`) as the canonical source. Cite each block only for the specific pattern named, and add "Gallery" as the reference for the configured-but-empty state (it already is) and for wrapper classes (the only full §4.3 match).

**P11. §11 Auditing: include the chooser.**

- *Found:* third-party block add-ons that duplicate Juizi blocks (two carousels, two banner/hero types) sit right next to them in the chooser. That's a first-time-editor problem no single-block review catches.
- *Proposed:* add a step 0 to §11:
  > List every block the editor can add on the site, not just ours, and flag overlapping purposes for a site-level decision (hide, restrict or document).

**P12. §5 Don't name a block's own mode field `variation`.**

- *Found:* VLT 7.8.6 hides the fourth option of any select with field id `variation` (`theme/blocks/_listing.scss`), which made Content Row's "Image card" unreachable. `variation` also collides in name with Volto's built-in block variations.
- *Proposed addition to §5:*
  > Name the mode field `displayMode` (or another block-specific id), never `variation`, unless the block uses Volto's `variations` mechanism. Theme CSS targets `.field-wrapper-variation`.
- Also worth checking: a sitewide override of the VLT rule brings Event Calendar back in Listing blocks, so scoped fixes are better.
