# Block audit actions

Decisions from working through `block-audit.md`, issue by issue. At the end, this file is the work list for updating the blocks.

**Status:** `open` (not discussed yet) · `agreed` (action decided) · `implemented` (in the code, see Implementation at the end) · `applied` (skill change made) · `won't fix` · `deferred`

**Saved content:** any action that changes how blocks already on live pages render is marked **⚠ saved content**, with how old data is handled.

---

## Queue

Order follows the audit's suggested order of work: editor-facing Must fixes, then Should fixes, then Nice to fix, then structural work and skill updates.

### Must fix

| ID | Block | Issue | Status |
|---|---|---|---|
| R1 | Redirect | Visitors see "Redirect block: no URL configured." | implemented |
| H1 | Hero | Section mode shows the page title/description; hidden seeded "Block title" | implemented |
| H2 | Hero | Several Hero blocks fight over body classes (duplicate page title) | implemented |
| CR1 | Content Row | "Image card" hidden by VLT's `variation` CSS | implemented |
| CR2 | Content Row | Dummy items seeded on first style choice | implemented |
| CR3 | Content Row | Start screen names options not in the dropdown; hand-rolled placeholder | implemented |
| C1 | Carousel | No configured-but-empty state after picking a style | implemented |
| C2 | Carousel | Error boundary silently renders nothing | implemented |
| C3 | Carousel | `window` read during server render for external links (verify) | implemented |
| G1 | Gallery | Mode descriptions in developer language | implemented |

### Should fix

| ID | Block | Issue | Status |
|---|---|---|---|
| R2 | Redirect | No guard against redirecting to itself / loops | implemented |
| R3 | Redirect | Browser-only redirect after 3 s; crawlers keep the page | implemented |
| R4 | Redirect | Uses `mode === 'edit'` | implemented |
| H3 | Hero | Two "Background" panels in Section mode (duplicate fieldset id) | implemented |
| H4 | Hero | Sidebar order: heading semantics and CSS class before content | implemented |
| H5 | Hero | Editor copy (Block mode, Preheader, TOC, H2/H3, breadcrumbs text, Center) | implemented |
| H6 | Hero | Dates formatted `en-US` | implemented |
| H7 | Hero | "Click here" / "Link" / `href="#"` fallbacks for unfinished buttons | implemented |
| CR4 | Content Row | Items panel last; two panels called "Options" | implemented |
| CR5 | Content Row | No empty state when all items are removed | implemented |
| CR6 | Content Row | Sidebar form remounts when items are added (verify) | implemented |
| CR7 | Content Row | "60% / 30%" column ratio adds up to 90% | implemented |
| CR8 | Content Row | Editor copy (Preheader, Item label, ms, TOC, Center) | implemented |
| C4 | Carousel | Manual text tone instead of automatic | implemented |
| C5 | Carousel | "How to use" is an editable text field; jargon | implemented |
| C6 | Carousel | Filter tabs do nothing for manual slides | implemented |
| C7 | Carousel | Editor copy (query, ms, px, Arrow colour choices, three "Button style") | implemented |
| C8 | Carousel | "No image" text on the live site | implemented |
| C9 | Carousel | Clickable slides are `div role="button"`; nested interactive; Space key | implemented |
| G2 | Gallery | No loading state ("No pictures found" flash) (verify) | implemented |
| G3 | Gallery | Manual text tone; raw `#ffffff` thumbnail colour | implemented |
| G4 | Gallery | Masonry ignores "Columns (mobile)" below 540px | implemented |
| G4b | Gallery | Editor copy (Current item's contents, content types, px, ms) | implemented |
| G5 | Gallery | Images open lightbox via `div role="button"` | implemented |
| CO1 | Callout | Type promises a look it doesn't have; type hidden after choice | implemented |
| CO2 | Callout | One-off empty hint instead of shared component | implemented |

### Nice to fix

| ID | Block | Issue | Status |
|---|---|---|---|
| H8 | Hero | Wrapper: alignment/tone classes not on the wrapper | implemented |
| H9 | Hero | Dead `enableStyling` config | implemented |
| CR9 | Content Row | No `block` / `type-*` wrapper classes | implemented |
| CR10 | Content Row | Whole Lucide library bundled | implemented |
| CR11 | Content Row | Count-up starts on mount; server HTML shows 0 | implemented |
| C10 | Carousel | No `block` class; own external-link check; full page loads | implemented |
| C11 | Carousel | "Embla" in dashboard description | implemented |
| G6 | Gallery | Background doesn't use `getColorTextStyle` | implemented |
| R5 | Redirect | Duplicate label; hard-coded colours; no `block` class | implemented |
| CO3 | Callout | No contrast guard on icon/link colour | implemented |
| CO4 | Callout | No `block` / `type-*` wrapper classes | implemented |
| CO5 | Callout | "lucide" in dashboard description | implemented |

### Cross-block and structural

| ID | Issue | Status |
|---|---|---|
| X1 | One label for the first choice ("Display style"?) | implemented |
| X2 | One way to title items in lists (no separate "Item label") | implemented |
| X3 | One documented alt-text rule | implemented |
| X4 | Background colour: one "None" label and one panel name | implemented |
| X5 | "Custom CSS class" into an "Advanced" panel everywhere | implemented |
| X6 | Units: seconds and named sizes instead of ms/px | implemented |
| X7 | "Centre" everywhere (copy pass) | implemented |
| X8 | i18n: `defineMessages` in every block, or not | implemented |
| X9 | Block chooser overlap with kitconcept blocks (site decision) | implemented |
| X10 | Icon-only `align` widget for alignment (Hero, Carousel, Gallery), found at G4b | implemented |
| S1 | Reconcile `BlockPlaceholder` with the skill; add `_shared/README.md` | implemented |
| S2 | Shared helpers: links, image resolvers, overlays, padding, slugs | implemented |
| S3 | Shared error boundary with an edit-mode message | implemented |
| S4 | `makeBlockEdit` as the default Edit | implemented |
| S5 | Wrapper classes on every block | implemented |
| S6 | READMEs: write, correct, add happy paths | implemented |
| S7 | Block Model v3 approach for VLT 7.8.6 | implemented |

### Skill updates (proposals P1–P12)

| ID | Proposal | Status |
|---|---|---|
| P1 | BM3 opt-in and container ownership | applied |
| P2 | `BlockPlaceholder` spec vs component | applied |
| P3 | Exception to "Edit wraps View" for non-visual blocks | applied |
| P4 | In-block empty hints allowed or not | applied |
| P5 | No seeded example content | applied |
| P6 | Colours: dashboard list; derived text tone | applied |
| P7 | Units | applied |
| P8 | Block registry and `makeBlockEdit` | applied |
| P9 | Edit-mode detection | applied |
| P10 | Reference implementations | applied |
| P11 | Audit the chooser | applied |
| P12 | Don't name the mode field `variation` | applied |
| P13 | Alt-text rule (from X3) | applied |

---

## Decisions

Each entry: the decision, the action to take in the code, and saved-content handling where relevant.

<!-- Entries are added below as issues are resolved. -->

### R1 · Redirect: unconfigured message shown to visitors · agreed

**Decision:** with no destination set, visitors see nothing. Logged-in users see a plain-language notice in view mode. The edit canvas keeps its form.

**Action:**
- `Redirect/View.jsx`, no-URL branch: return `null` when the user isn't logged in.
- For logged-in users, replace "Redirect block: no URL configured." with: "This redirect has no destination yet, so visitors stay on this page. Edit the page to choose one."
- Keep the `redirect-block--unconfigured` styling for that notice.

**Saved content:** no data change. Pages with an empty Redirect block stop showing the message to visitors.

### H1 · Hero: Section mode shows the page title and description · agreed

**Decision:** a new Section band uses its own heading by default. The page-title options stay available.

**Action:**
- `HeroBlock/Edit.jsx`, `getInitialDataForMode('section')`: set `usePageTitle: false` and `usePageDescription: false`; remove `title: 'Block title'`.
- The Title and Description fields then show straight away (the schema already shows them when those switches are off).
- `HeroBlock/View.jsx`: in edit mode, when Section mode has no title to show, render a short edit-only hint in the title slot: "Add a heading in the sidebar." Visitors see nothing there.
- README: update the "Mode selection" defaults.

**Saved content:** ⚠ saved Section blocks without `usePageTitle` keep today's behaviour (unset still means "use the page title"). Only newly created Section bands change. Old data isn't migrated.

### H2 · Hero: several Hero blocks fight over body classes · agreed

**Decision:** replace the body-class changes with CSS `:has()`, and warn editors when two Hero blocks on a page are both the primary heading.

**Action:**
- `HeroBlock/View.jsx`: remove both `document.body.classList` blocks (`View.jsx:726-745`). Add wrapper modifiers instead: `hero-block--primary-heading` when `isPrimaryHeading`, and `hero-block--has-breadcrumbs` when breadcrumbs render.
- `HeroBlock/style.css:443-460`: change `body.has-hero-breadcrumbs …` and `body.has-hero-primary-heading …` to `body:has(.hero-block--has-breadcrumbs) …` and `body:has(.hero-block--primary-heading) …`.
- Edit-only warning: when this Hero has `isPrimaryHeading` and another `juiziHero` block in `props.properties.blocks` also has it, show a notice on the canvas: "Another block is already the main heading for this page. Untick 'This is the primary page heading' on one of them." Visitors never see it.
- README: replace the two "Body class mutation in render" notes.
- Check the browser support floor for the sites using this (`:has()` needs browsers from late 2023 onwards).

**Saved content:** no data change. ⚠ Any site theme CSS that targets `body.has-hero-primary-heading` or `body.has-hero-breadcrumbs` has to move to the new selectors. Check each site's theme before release.

### CR1 · Content Row: "Image card" hidden by VLT's `variation` CSS · agreed

**Decision:** rename the field from `variation` to `displayMode`, which matches Carousel and Gallery, and repair saved data as it loads.

**Action:**
- `ContentRow/schema.js`, `Edit.jsx`, `View.jsx`: rename the `variation` data key and field id to `displayMode` (about 44 uses). That includes the `handleChangeField` check, `isFirstSelect`, the `BlockDataForm` key and the items fieldset id.
- `legacy/blocks.js`: the `multiCard` and `iconLinkRow` converters (lines 217, 232, 260) write `displayMode`.
- `legacy/blocks.js` `repairCurrentBlock`: for `@type === 'contentRow'` with `variation` but no `displayMode`, copy it across (same pattern as the Carousel's `mode` → `displayMode`). Keep `variation` in the data so nothing is lost.
- `legacy/legacy.test.js`: update the expectations (lines 185, 212, 240) and add a test for the repair.
- Check afterwards that all four styles show in the dropdown, with VLT's CSS in place and without any site override.
- Covers P12 for this block.

**Saved content:** ⚠ every saved Content Row stores `variation`. The repair runs on load, so live pages keep rendering. Editors who save a page write `displayMode`. The repair must ship in the same release as the rename, or saved Content Rows render nothing.

### CR2 · Content Row: dummy items seeded · agreed (also resolves CR5)

**Decision:** choosing a style seeds no items. The canvas shows the shared empty prompt until the editor adds one.

**Action:**
- `ContentRow/Edit.jsx`: remove `defaultItems`. The first style choice sets `items: []` plus the layout defaults.
- `migrateItems`: when switching style, carry over only the editor's own `heading`, `text`, `link` and `@id`. Never add seed text or numbers. The item `title` falls back to the heading, not to "Item".
- `ContentRow/View.jsx`: when a style is set and `items` is empty, render `BlockPlaceholder` in edit mode with `blockClass="content-row"` and the prompt "No items yet. Add your first item in the sidebar under Items." Keep any header that has content above it.
- Visitors: with no items and no header content, return `null`, not an empty `<section>`.
- The Items fieldset is already visible with zero items; keep that.

**Saved content:** no change for saved blocks. They keep the items they have, including any seed text that was already published. Worth a content check on live sites for "Describe this step.", "Statistic label", "Card description." and "Item description.".

### CR3 · Content Row: start screen doesn't match the dropdown · agreed

**Decision:** four styles, shown on the shared start screen with descriptions. Image card's description covers both of its layouts.

**Action:**
- `ContentRow/View.jsx:778-791`: replace the hand-rolled placeholder with `BlockPlaceholder`, `blockClass="content-row"`, prompt "Select a display style in the sidebar to get started.", and modes:
  - **Numbered**: steps in order, each with a large number
  - **Icon**: short points, each with an icon
  - **Statistics**: key figures that count up when the page loads
  - **Image card**: cards with a picture, either behind the text or above it
- Put the modes in the same order as the dropdown. Reorder `schema.js` choices to match if needed; the order doesn't affect saved data.
- Remove the leftover `.content-row--placeholder` / `__placeholder-inner` CSS from `ContentRow/style.css`.
- If CR11 changes the count-up to "on scroll", update the Statistics wording to "when they come into view".

**Saved content:** no data change.

### C1 · Carousel: no configured-but-empty state · agreed

**Decision:** in edit mode, show a shared prompt worded for each case. Visitors see nothing when there are no slides.

**Action:**
- `EmblaCarousel/View.jsx`, inside `EmblaCarousel` after all hooks have run (hook order must not change): when `slides.length === 0`, render the heading and intro (if any), then `BlockPlaceholder` with `blockClass="embla"` and one of these prompts:
  - Manual slides: "No slides yet. Add slides in the sidebar under Slides, or switch on 'Use content query' to fill it automatically."
  - Content query, request finished, no results: "Your content query found nothing to show. Change its criteria in the sidebar."
  - Content query still loading (`state.search.subrequests[id].loading`): a skeleton, not text. *(Amended at G2: grey slide-shaped boxes at `slidesToShow`, shown to editors and visitors, `aria-hidden`, section `aria-busy`, no shimmer under reduced motion.)*
- If the filter tabs leave zero slides, that's an active filter, not an empty block, so don't show the prompt there (see C6).
- Visitors: when there are no slides, return `null` for the whole block, heading included.
- Use the same loading and empty wording pattern as the Gallery (G2), so both blocks behave alike.

**Saved content:** no data change. Saved carousels with no slides stop rendering an empty heading band for visitors.

### C2 · Carousel: silent error boundary · agreed (also resolves S3)

**Decision:** one shared error boundary for Carousel and Gallery. It shows a plain-language message in edit mode, renders nothing for visitors, and logs the error to the console.

**Action:**
- New `_shared/BlockErrorBoundary.jsx`: a class component with `getDerivedStateFromError` plus `componentDidCatch` (which logs with `console.error`). It takes an `isEditMode` prop.
  - Edit mode: render `BlockPlaceholder` with the block's `blockClass` and the prompt "This block couldn't be displayed. Try undoing your last change or checking its settings in the sidebar. If it keeps happening, contact your web team."
  - Visitors: render `null`.
- `EmblaCarousel/View.jsx`: delete `CarouselErrorBoundary`; `WrappedEmblaCarousel` uses `<BlockErrorBoundary blockClass="embla" isEditMode={isEditMode}>`.
- `EmblaGallery/View.jsx`: delete `GalleryErrorBoundary`; same change with `blockClass="gallery"`.
- The boundary should reset when the block's data changes (for example by keying it on a hash of `data`), so the editor's next change gets a fresh try without reloading the page.
- Document it in `_shared/README.md` (S1).

**Saved content:** no data change.

### C3 · Carousel: `window` read during server render · agreed (starts S2)

**Decision:** fix it now with one server-safe link helper shared by every block, then confirm with a server render.

**Action:**
- New `_shared/links.js`:
  - `getHref(link)`: accepts an array or an object, flattens with `flattenToAppURL`, and appends `/@@download/file` for `File` items. Returns `''`, not `'#'`, when there's no link, so callers can tell "no link" apart (see H7).
  - `isExternalHref(href)`: built on Volto's `isInternalURL` (`@plone/volto/helpers/Url/Url`). It reads `config.settings`, not `window`, so it gives the same answer on the server and in the browser.
- Use them in:
  - Carousel: `renderLink`, `handleSlideClick` and the three header-link checks (`View.jsx:636, 685, 912, 952, 1156`)
  - Hero and Content Row: replace their local copies
  - Gallery, if it links out
  - Redirect: replace the regex
- No component reads `window` during render. Only effects and event handlers may.
- **Confirm:** server-render a page with a manual Carousel slide that has an external link and a button label (for example with `curl` on the SSR URL, no JavaScript). Check the Carousel is in the HTML and there are no server errors.
- Covers the external-link part of C10.

**Saved content:** no data change. Internal links using an absolute site URL may now open in the same tab where they opened a new one before. That's the correct behaviour.

### G1 · Gallery: mode descriptions in developer language · agreed

**Decision:** plain labels and descriptions, on the start screen and in the dropdown. The stored values (`carousel`, `blocks`, `masonry`) stay the same.

**Action:**
- `EmblaGallery/schema-base.js` `displayMode` choices, and `GalleryPlaceholder` in `View.jsx:674-692`:
  - `carousel` → **Slideshow**: one large picture at a time, with small pictures underneath to click through
  - `blocks` → **Even grid**: pictures in neat rows, all cropped to the same size
  - `masonry` → **Natural grid**: pictures keep their own shape and fit together in columns
- Rename the sidebar fieldset titles to match: "Carousel behaviour" → "Slideshow behaviour", "Grid layout" stays.
- `carouselStyle` choices: "Large image with thumbnail strip" → "Large picture with small pictures below"; "Thumbnail strip only" → "Row of small pictures only".
- Watch out: Even grid has an "Equal height images" switch (default on). If the editor turns it off, "all cropped to the same size" stops being true. Either remove the switch (simplest; it's an edge-case option), or change the description to "pictures in neat rows and columns". **Decide when implementing (default: remove the switch, keep `equalHeight: true` behaviour for saved blocks).**
- README: update the "Display modes" table.

**Saved content:** no data change (labels only). If the "Equal height images" switch is removed, saved Even grids with `equalHeight: false` should still render uncropped. Keep reading the saved value.

### R2 · Redirect: self-redirects and loops · agreed

**Decision:** never redirect to the same page, and warn editors about it. Also stop loops between pages with a per-session loop breaker.

**Action:**
- Same-page guard:
  - Compare the flattened destination (without a trailing slash, query or hash) with the current content path (`state.content.data['@id']`, flattened).
  - If they match, visitors aren't redirected and the block renders nothing for them.
  - `Redirect/Edit.jsx`: show a warning under the link picker as soon as it matches: "This points to the page you're editing, so visitors would go round in circles. Choose a different page."
  - Logged-in users see the same warning in view mode.
- Loop breaker:
  - Before redirecting, read a small list from `sessionStorage` of `{ path, time }` for pages that redirected this visitor in the last 10 seconds.
  - If the current page is already in the list, don't redirect: render nothing and let the page show. Otherwise add it and redirect.
  - Wrap every storage call in `try/catch`. If storage isn't available, redirect as normal.
- Uses the shared `getHref` from C3 to resolve the destination.

**Saved content:** no data change. Saved Redirect blocks that point at their own page stop redirecting, which is what they should have done.

### R3 · Redirect: browser-only redirect after 3 seconds · agreed

**Decision:** keep today's behaviour (browser redirect after a 3-second countdown), and explain it on the edit canvas so editors know what visitors and search engines get.

**Action:**
- `Redirect/Edit.jsx`: replace the help line with: "Visitors see this page for a few seconds, then move on to the page you choose. You and other editors aren't redirected. Search engines keep listing this page; to move a page for good, ask your site administrator to set up a permanent redirect."
- README (S6): record the decision and the trade-off (no server redirect, pages stay indexed, no-JS visitors aren't redirected). Server-side redirect was considered: Volto's `server.jsx:302-303` turns a React Router `<Redirect>` into an HTTP redirect. It was declined for now.

**Saved content:** no change.

### R4 · Redirect: `mode === 'edit'` check · agreed

**Decision:** remove it. The logged-in check alone decides whether to redirect.

**Action:**
- `Redirect/View.jsx`: delete `isEditorCanvas` and the `mode` prop; `shouldRedirect = !isLoggedIn`.
- Add a comment: "Edit never renders View (the canvas is a form), so the only people who reach this view are visitors and logged-in users viewing the page."
- Remove the `// View mode inside editor (mode === 'edit')` comment in `redirect-block.less`.

**Saved content:** no change.

### H3 · Hero: two "Background" panels in Section mode · agreed

**Decision:** one "Background" panel. In Section mode the colour comes first.

**Action:**
- `HeroBlock/schema.js`: delete the second `background` fieldset (`schema.js:180-188`) and build the single one by mode:
  - Section: `backgroundColor`, then `backgroundImage`, `backgroundPosition`, and `overlayStyle` (only when there's background media)
  - Hero: unchanged (`backgroundImage` or `usePreviewImage`, `backgroundVideo`, `backgroundPosition`, `overlayStyle`)
- Only show `backgroundPosition` once there's an image or video. It does nothing without one.
- Update the README's fieldsets table.

**Saved content:** no change.

### H4 · Hero: sidebar order · agreed

**Decision:** merge "Page defaults" into the panels it controls, so each switch sits directly above its field. Heading semantics and the CSS class move to an "Advanced" panel at the bottom.

**Action:** `HeroBlock/schema.js` fieldsets, once a mode is chosen:
1. **Options:** `blockMode` only
2. **Content:**
   - `usePageTitle`, then `title` (when off)
   - `usePageDescription`, then `subtitle` (when off)
   - `preheader`, then `showPublicationDate`, `showEventDetails`
   - Hero mode only: `heroLogo`, `logoPosition`, `logoSize`
   - `showBreadcrumbs`
3. **Background** (as agreed in H3):
   - Hero mode: `usePreviewImage` first, then image or video, position, overlay
4. **Side image**
5. **Buttons**
6. **Layout:** `alignment`, `horizontalLayout`, `paddingTop`, `paddingBottom`, `isFullWidth`
7. **Advanced:** `isPrimaryHeading`, `hideTitle`, `customClass`

Notes:
- The "Page defaults" fieldset is removed.
- The field descriptions for `showPublicationDate` and `showEventDetails` that mention "the Preheader field above" still read correctly.
- `isPrimaryHeading` keeps its per-mode defaults (on for Hero, off for Section), so moving it to Advanced doesn't change the result.
- Covers X5 for the Hero.
- Update the README's fieldsets table.

**Saved content:** no change.

### H5 · Hero: editor copy · agreed

**Decision:** apply the proposed wording. "Display style" is provisional until X1.

**Action** (`HeroBlock/schema.js`, `View.jsx`):

| Field | New wording |
|---|---|
| `blockMode` title | Display style *(confirm at X1)* |
| Hero mode description (schema and start screen) | a full-width page header with title, description and background image |
| `preheader` title | Text above the title |
| `buttonsDisplayMode` choice `toc` | Buttons to each heading on this page |
| `useH2` / `useH3` titles | Include main headings / Include sub-headings |
| `isPrimaryHeading` description | Makes this the main heading of the page. Use it for the first and most important block. Only one block per page should have this. |
| `showBreadcrumbs` description | Shows where this page sits in the site (for example Home / About) above the title. Hidden on top-level pages. |
| `customClass` title | Extra style name (for your web team) |
| `backgroundPosition` choice | Centre |
| TOC empty notice (`View.jsx`) | No headings on this page yet. Add some below and they'll appear here as buttons. |

- Also update `showPublicationDate` / `showEventDetails` descriptions that say "the Preheader field above" to "the 'Text above the title' field".
- Mode choice labels "Hero (page header)" and "Section (content band)" stay.

**Saved content:** no change (labels only).

### H6 · Hero: dates formatted `en-US` · agreed (extended to Carousel and Content Row)

**Decision:** use `en-GB` for every date and number the blocks format, for example "13 November 2024".

**Action:**
- New `_shared/format.js`:
  - `formatDate(value, options)` using `toLocaleDateString('en-GB', options)`
  - `formatNumber(n)` using `toLocaleString('en-GB')`
  - These give the same output on the server and in the browser.
- Hero: `View.jsx:68` (event month) and `:631-634` (publication date) use `formatDate`.
- Carousel: `View.jsx:282` (slide dates) uses `formatDate`. Found while checking H6; it was also `en-US`.
- Content Row: `View.jsx:226, 228, 450` (statistics) use `formatNumber`. These called `toLocaleString()` with no locale, so the server and the visitor's browser could format differently, e.g. "1,000" vs "1 000", and the page could flicker when it loads.

**Saved content:** no data change. Dates and numbers on live pages change format.

### H7 · Hero: unfinished buttons · agreed

**Decision:** visitors never see an unfinished button. Editors see it flagged on the canvas.

**Action** (`HeroBlock/View.jsx`, `HeroButtons`):
- Label: `btn.label`, else the link's title (`link.title`), else none. The existing save-time auto-fill in `Edit.jsx` stays.
- Visitors: skip any button with no link (`getHref` returns `''`, see C3) or no label. When no buttons are left, the buttons row doesn't render.
- Edit mode: render unfinished buttons with the extra class `hero-button--unfinished` (dashed outline, reduced opacity). The text is "Add a link" when the link is missing, or "Add a label" when only the label is missing.
- Remove the "Click here" and "Link" fallbacks and `href="#"`.
- Apply the same rule wherever other blocks render editor-defined buttons: Content Row "View all" and card buttons, Carousel slide and header buttons. Content Row and Carousel already skip buttons without a link, so there it's only the edit-mode flag.

**Saved content:** no data change. Saved buttons with no link disappear from live pages. They were dead `#` links before.

### CR4 · Content Row: sidebar order · agreed

**Decision:** panels follow the canvas from top to bottom, with Items second.

**Action:** `ContentRow/schema.js` fieldsets, once a style is chosen:
1. **Options:** `displayMode` only (renamed in CR1)
2. **Heading:** `preheaderText`, `headerText`, `descriptionText`, `blockImage` (+ position), `showViewAll` (+ its fields)
3. **Items** ("Statistics" for the statistics style): `items`
4. **Style panel**, named for what it controls:
   - Numbered: "Number position"
   - Icon: "Icon position"
   - Statistics: "Counting" (`statsFormatK`, `statAnimationMs`)
   - Image card: "Card look" (`imageCardStyle`, `overlayStyle`)
5. **Layout:** `columns` / `sideBySideLayout` (+ ratio, align), `headerAlignment`, `itemsAlignment`
6. **Background & spacing:** `backgroundColor`, `paddingTop`, `paddingBottom`
7. **On mobile:** `mobileCarousel` (+ autoplay, dots)
8. **Advanced:** `customClass`

Notes:
- Only one panel is called "Options".
- `headerAlignment` and `itemsAlignment` move from Header to Layout.
- Covers X5 for Content Row.

**Saved content:** no change.

### CR6 · Content Row: sidebar remounts when items change · agreed

**Decision:** stop remounting the form when the number of items changes, then test it in the browser.

**Action:**
- `ContentRow/Edit.jsx:217`: key the `BlockDataForm` on the display style only: `` key={`contentrow-${safeData.displayMode || 'none'}`} ``.
- Keep `ensureIds` so every item has an `@id` for the sortable list.
- **Browser test** in every style:
  - add, remove and reorder items, and confirm the open item stays open and nothing crashes
  - switch style with items present
  - remove all items, then add one
- If a crash comes back, fix the cause (missing `@id`). Don't put the key back.

**Saved content:** no change.

### CR7 · Content Row: "60% / 30%" column option · agreed

**Finding corrected:** the widths are flex-grow ratios (`style.css:61-68`), so `60-30` already gives a two-thirds / one-third split. The layout is fine; only the label is wrong.

**Decision:** keep every stored value and layout, and relabel in plain words.

**Action** (`ContentRow/schema.js`, `sideBySideRatio`):
- Title: "Column widths (heading / items)"
- Choices, ordered from narrowest heading to widest:
  - `25-75`: Narrow heading (quarter / three quarters)
  - `40-60`: Slightly narrow heading (40% / 60%)
  - `50-50`: Equal (half / half), the default
  - `60-30`: Wider heading (two thirds / one third)
  - `75-25`: Wide heading (three quarters / quarter)
- Add a comment beside `sideBySideRatioMap` in `View.jsx` saying the values are ratios, not percentages, and the `60-30` key is kept for saved content.

**Saved content:** no change. Keys and layouts are unchanged.

### CR8 · Content Row: editor copy · agreed

**Decision:** apply the proposed wording. Also remove the separate item label and replace the millisecond field with named speeds (confirm again at X2 and X6).

**Action** (`ContentRow/schema.js`, `Edit.jsx`):

| Field | New wording / change |
|---|---|
| `preheaderText`, item `preheader` | Text above the heading |
| item `title` | Remove from every item schema. Set `titleField: 'heading'` on the numbered, icon and card item schemas, and `titleField: 'label'` on statistics, the same way the Carousel's slides already work. |
| `headerText` description | The main heading for this row. Screen readers use it to name this section, so even a short heading helps. |
| `statAnimationMs` | "Counting speed", a select: `1000` Quick (1 second) · `2000` Normal (2 seconds) · `3000` Slow (3 seconds). Stored values stay in ms. |
| `statsFormatK` | Shorten thousands (1 000 → 1k) |
| stat `value` / `suffix` / `extraInfo` | Number / After the number (e.g. % or +) / Small print |
| `iconPosition` choice `inline` | To the right of the text |
| `columns` | Columns on large screens. Description: "Phones always show one column." |
| `sideBySideLayout` | Heading beside the items (large screens) |
| numbered/icon item `backgroundColor` | Item background colour |
| `customClass` | Extra style name (for your web team) |
| alignment choices | Centre |

Also:
- `Edit.jsx` `migrateItems` and `ensureIds`: stop writing `title`.

**Saved content:**
- Saved items keep their `title` in the data. It's no longer shown or used. Items with no heading or label appear in the sidebar list under a generic name, whatever the widget shows by default. Check that it's readable.
- Saved `statAnimationMs` values other than 1000, 2000 or 3000 still animate at their stored speed. When the saved value isn't one of the three, add it to the choices as "Custom (N seconds)" so the select isn't blank.

### C4 · Carousel: manual text tone · agreed (also covers G3's text tone)

**Decision:** text and dot colour follow the background colour automatically. A tone choice appears only when there's a background image, because an image can't be judged automatically.

**Action:**
- Carousel (`schema-base.js`, `View.jsx`):
  - Tone class: when `backgroundImage` is set, use the saved `textTone` (default Light). Otherwise, when `backgroundColor` is a colour, use `isColorDark(backgroundColor) ? 'tone-light' : 'tone-dark'`. Otherwise (transparent) use `tone-dark`.
  - Apply `getColorTextStyle(backgroundColor)` to the wrapper, as Hero and Content Row do.
  - Schema: show `textTone` only when `backgroundImage` is set, retitled "Text over the background image" with choices Light / Dark and a Light default.
  - `Edit.jsx`: stop seeding `textTone: 'dark'` on the first mode choice.
- Gallery (`schema-base.js`, `View.jsx`): the Gallery has no background image, so the tone is always derived. Remove the `textTone` field, apply `getColorTextStyle`, and stop seeding `textTone`. (This also covers G6.)
- Slide background (`slideBackgroundColor`) already uses `isColorDark`; no change.

**Saved content:** ⚠
- Saved Carousels with a background image keep their chosen tone.
- Saved Carousels and Galleries without one switch to the derived tone. Where an editor had set Light on a light or transparent background (unreadable anyway), text becomes dark. Where they had left Dark on a dark background, text becomes light. Both are fixes, but the output changes on live pages.

### C5 · Carousel: editable "How to use" field, plus the logo strip's scroll rule · agreed

**Decision:** delete the help field and put a short plain-language note into the style description. Also replace the query-limit rule so a logo strip scrolls only when the logos don't fit.

**Action:**
- `EmblaCarousel/schema-base.js`:
  - Remove `marqueeHelp` from the `marquee` fieldset and from `properties`.
  - `displayMode` description when `displayMode === 'logo-marquee'`: "Only each slide's picture is shown, as a logo. Give a slide a link to make its logo clickable."
- README: move the technical detail there: query results use their image or preview image, Link items open in a new tab, and the scroll rule below.
- Scroll rule (`View.jsx`, `isMarqueeStatic`):
  - Remove the `slides.length <= marqueeBatchSize` logic. Found during this review: a query can never return more than its limit, so any query-fed strip with a limit set never scrolled.
  - Instead, measure after layout (in an effect, plus a `ResizeObserver`) whether the logo track is wider than its container. Scroll only when it is, otherwise show a still row. The same rule applies to manual and query strips.
  - The server renders the still row, and the browser switches to scrolling after measuring. That's acceptable, because the animation is decorative.
  - Keep `pauseOnHover` and reduced-motion handling.

**Saved content:**
- Saved blocks may still hold `marqueeHelp` text; it's ignored.
- ⚠ Logo strips on live pages can change behaviour: query-fed strips with a limit start scrolling when they overflow, and manual strips with few logos stop scrolling.

### C6 · Carousel: filter tabs on manual slides · agreed

**Decision:** filter tabs are a content-query feature, and editors get feedback when a tag matches nothing.

**Action:**
- `EmblaCarousel/schema-base.js` / enhancer: show `filterTags` only when `useListing` is on, **or** when the block already has `filterTags` saved (so saved manual carousels keep the setting visible and editable).
- Retitle it "Filter buttons by tag". Description: "Tags, separated by commas, e.g. News, Events. Each tag becomes a button above the carousel, plus 'All'. Uses the tags set on each page."
- Edit mode: under the carousel, list tags with no matching results, e.g. "No results tagged 'Events', so its button is hidden." Visitors see nothing.
- Keep the render logic as it is (`slide.subjects || slide.link?.Subject`).
- **Check while implementing:** whether manual slides picked with the object browser store the linked page's `Subject`. If they do, filtering on manual slides already works for some saved content, which is why the saved-value exception above exists.

**Saved content:** no data change. Saved manual carousels with `filterTags` keep the field and whatever filtering works today.

### C7 · Carousel: editor copy · agreed

**Decision:** apply the proposed wording. Time and size fields become named choices that store the same ms/px/seconds values as today (confirm again at X6).

**Action** (`EmblaCarousel/schema-base.js`, `emblaListingSchemaEnhancer.js`):

| Field | New wording / change |
|---|---|
| `useListing` | Fill automatically from site content. Description: "Shows pages that match rules you set, instead of slides you add one by one." (in both files) |
| `query` | Which pages to show |
| `appendManualSlides` | Also show slides I add myself |
| `slidesToShow` / `minSlidesOnMobile` descriptions | On large screens / On phones |
| `autoplayDelay` | "Time on each slide": `4000` 4 seconds · `6000` 6 seconds · `8000` 8 seconds (default) · `10000` 10 seconds |
| `marqueeSpeed` | "Scroll speed": `30` Slow · `20` Normal (default) · `12` Fast |
| `logoHeight` | "Logo size": `32` Small · `48` Medium (default) · `64` Large |
| `logoGap` | "Space between logos": `16` Tight · `32` Normal (default) · `48` Wide |
| `logoPadding` | "Space around each logo": `4` Small · `8` Normal (default) · `16` Large |
| `slideButtonStyle` / `listingButtonStyle` / `headerLinkStyle` | Slide button style / Button style for found pages / "More" button style |
| `headerLinkText` / `headerLinkUrl` | "More" button text / "More" button link |
| `slideButtonLinkStyle`, `listingButtonLinkStyle` | Show as a text link |
| `arrowStyle` | Arrow buttons |
| `hideDots` | Hide dots |
| `outerClassName` | Extra style name (for your web team), moved to a new "Advanced" panel (covers X5 here) |
| alignment choices (`moreButtonAlign`) | Centre |
| `messages.defaultTitle` | Carousel |

- Also update `headerLinkText`'s description, which refers to "More button position".

**Saved content:** no data change. When a saved value isn't one of the named choices (e.g. `autoplayDelay: 5000`, `logoHeight: 40`), add it to that block's choices as "Custom (…)" so the select isn't blank, and keep rendering it as stored. Use the same helper as CR8.

### C8 · Carousel: "No image" text on the live site · agreed

**Decision:** in Image only mode, visitors never see a slide without a picture. Editors see it flagged.

**Action** (`EmblaCarousel/View.jsx`):
- In `image-only` mode, filter out slides with no image (`imageFor(slide)` empty) for visitors **before** counting pages, dots and loop. That way the dots and arrows match what's shown.
- If that leaves no slides, C1's rules apply: nothing for visitors, the prompt for editors.
- Edit mode: keep the slide, rendered as a dashed box (the same look as `hero-button--unfinished` in H7) with the text "Add a picture to this slide in the sidebar."
- Remove `<div className="image-placeholder">No image</div>` and its CSS.

**Saved content:** no data change. Picture-less slides disappear from live Image only carousels.

### C9 · Carousel: clickable slides are fake buttons · agreed

**Decision:** use one real link per slide and stretch its click area over the card with CSS.

**Action** (`EmblaCarousel/View.jsx`, `carousel.css`):
- When `clickableSlides` is on and the slide has a link:
  - Remove `role="button"`, `tabIndex`, `onClick` and `onKeyDown` from `.carousel-slide-inner`, and delete `handleSlideClick`.
  - The slide's button link, or the heading if there's no button, is the only link. Render it with Volto's `UniversalLink`: router navigation for internal links, and new-tab handling from the C3 helper.
  - Give that link the class `embla__stretched-link`. CSS: `.carousel-slide-inner { position: relative }` and `.embla__stretched-link::after { content: ''; position: absolute; inset: 0; }`.
  - In Image only mode (no heading or button shown), wrap the image in the link, with the image's alt text (the slide heading) as the link name.
- Keep a visible focus style on the link. With the overlay, the focus ring should outline the whole card (`.carousel-slide-inner:focus-within`).
- Card links shouldn't be treated as draggable, so a swipe doesn't trigger navigation. Embla's default drag threshold handles this; confirm by swiping on a touch device.
- Also resolves the full-page-load part of C10.
- Consistency follow-up: Content Row's `ImageCardItem` wraps the whole card in an `<a>` when there's a link but no button style. Consider the same stretched-link pattern there (goes with S2).

**Saved content:** no data change.

### G2 · Gallery: no loading state · agreed

**Decision:** while pictures load, show a skeleton in the chosen layout, for editors and visitors alike. "No pictures found…" appears only after the request has finished with no results.

**Action** (`EmblaGallery/View.jsx`, `gallery-base.css`):
- Loading means the relevant subrequest (`contextSubId` or `querySubId`) has `loading: true`, or hasn't been dispatched yet while a source is configured.
- Skeleton by mode:
  - Even grid / Natural grid: two rows of grey tiles at the configured column count (`--cols-*`). Natural grid uses tiles of mixed heights.
  - Slideshow: one large grey box, plus a row of small boxes at `thumbnailHeight` (the strip style shows only the small boxes).
- The skeleton is `aria-hidden`. The section gets `aria-busy="true"` while loading.
- Any shimmer animation is off under `prefers-reduced-motion`. Use `--light` / `--lightest` with fallbacks, as the placeholder does.
- When loading finishes: show the pictures; or, with no results, `BlockPlaceholder` for editors and nothing for visitors.
- **Consistency (decided):** the Carousel uses a skeleton too; C1 has been amended. Put the skeleton tile styles in `_shared/` so both blocks share them.

**Saved content:** no data change.

### G3 · Gallery: raw `#ffffff` thumbnail highlight · agreed (text tone already covered by C4)

**Decision:** keep the field, but offer only the site's colour list, and default to a colour that contrasts with the block background.

**Action** (`EmblaGallery/schema-base.js`, `config/colors.js`):
- `activeThumbColor`: `choices: getColorChoices(getBlockColorList('emblaGallery'))`. Drop the `['#ffffff', 'White']` entry.
- Default: a new helper `getContrastingColor(bgColorValue, list)` in `config/colors.js`. It returns the first colour in the list whose lightness is opposite to the background's (a transparent or unknown background counts as light), which mirrors `getDefaultButton`. Retitle the field "Highlight around the current picture".
- View: when no colour is saved, apply the same contrasting default, so blocks that never set it still get a visible highlight.

**Saved content:** saved blocks with `activeThumbColor: '#ffffff'` keep rendering white. To keep the select from going blank, add "White (earlier setting)" to that block's choices when it's the saved value (the "Custom (…)" pattern from CR8 and C7).

### G4 · Gallery: Natural grid ignores mobile columns · agreed

**Decision:** in Natural grid (masonry), hide "Columns (mobile)" and explain that phones always show one column.

**Action:**
- `EmblaGallery/schema-base.js`: show `columnsMobile` only in Even grid (`blocks`). In Natural grid, set the `columnsTablet` description to "Phones always show one column, so pictures stay in order."
- `gallery-base.css`: today masonry uses `--cols-mobile` between 541px and 768px and only forces one column at 540px and below. Once the field is hidden, that middle range would still use a value the editor can't see. So in masonry, force one column across the whole mobile range (≤ 768px, matching the field's old "768px and below" description). Even grid is unchanged.
- README: update the masonry trade-off note.

**Saved content:** ⚠ saved Natural grids show one column between 541px and 768px wide (usually two before). Phones at 540px and below are unchanged.

### G4b · Gallery: editor copy · agreed

**Decision:** apply the proposed wording. Pixel and millisecond fields become named choices storing the same values.

**Action** (`EmblaGallery/schema-base.js`, `emblaGallerySchemaEnhancer.js`):

| Field | New wording / change |
|---|---|
| `sourceMode` | "Where the pictures come from": `context` Pictures inside this page · `query` Pictures from across the site |
| `sourceMode` description | 'Pictures inside this page' shows the pictures stored in this page. 'Pictures from across the site' finds them using rules you set. |
| `contextItemTypes` | "What counts as a picture": `Image` Pictures · `Link` Links that have a preview picture |
| `query` (enhancer) | Which pictures to show |
| `columnsDesktop` / `columnsTablet` / `columnsMobile` | Columns on large screens / Columns on tablets / Columns on phones (no pixel descriptions; G4's note on tablets in Natural grid) |
| `gap` | "Space between pictures": `0` None · `6` Small · `12` Normal (default) · `24` Large |
| `thumbnailHeight` | "Size of the small pictures": `60` Small · `90` Medium (default) · `120` Large. Drop the aspect-ratio description. |
| `autoplayDelay` | "Time on each picture": `4000` · `6000` · `8000` (default) · `10000`, shown as seconds |
| `arrowStyle` | Arrow buttons |
| `enableLightbox` | Enlarge pictures when clicked. Description: "When off, clicking a picture opens its own page." |
| `showCaptionOnItem` / `showCaptionInLightbox` | Show picture titles on the page / Show picture titles in the enlarged view |
| fieldset `lightbox` title | Enlarged view |
| `outerClassName` | Extra style name (for your web team), in a new "Advanced" panel (covers X5 here) |
| `messages.defaultTitle` | Gallery |

**Saved content:** no data change. Saved values that aren't one of the named choices get a "Custom (…)" choice (same helper as CR8, C7 and G3).

### G5 · Gallery: fake buttons open the enlarged view · agreed

**Decision:** each picture is a real `<button>` when the enlarged view is on, and a real link to the picture's page when it's off.

**Action** (`EmblaGallery/View.jsx`, `gallery-base.css`):
- Replace `clickableProps` (`View.jsx:455-464`) with a small `GalleryItemTrigger` component:
  - Enlarged view on: `<button type="button" className="gallery__trigger" onClick={() => openLightbox(index)} aria-label={…}>`
  - Enlarged view off: `UniversalLink` to the picture's page
  - It wraps the `<img>`.
- Name: "Enlarge: {picture title}", or "Enlarge picture {n} of {total}" when there's no title. The `<img>` inside gets `alt=""` so the name isn't read twice.
- CSS `.gallery__trigger`: reset button styles (`all: unset` plus `display: block; cursor: pointer`). Keep a visible `:focus-visible` outline.
- In Slideshow mode, the thumbnail strip's own click-to-select handlers should also be buttons. Check that they are when implementing.
- Lightbox return focus (already implemented) now lands on a real button.

**Saved content:** no change.

### CO1 · Callout: type promises a look it doesn't have · agreed

**Decision:** each type seeds its starting icon **and** colours. Which site colours each type uses is set once per site in the Juizi Blocks dashboard. The type stays visible, and editors can change it.

**Action:**
- **Settings (frontend and backend):**
  - Extend `BlockColorConfig` (`settings/types.ts`) with `calloutTypes?: Record<string, { background?: string; icon?: string }>`, holding master-list colour names, only under `blocks.juiziCallout`.
  - Backend: `_validate_block` (`backend/src/juizi/blocks/settings.py:201-215`) currently rebuilds each block config from `colors` / `themes` / `defaultTheme` only, so it would **drop** the new key. Add validation that keeps `calloutTypes` for `juiziCallout` and drops colour names that don't exist, as it does for `colors`.
  - Mirror any default in `DEFAULT_COLOR_CONFIG` (frontend `constants.ts` and backend). Default: no colours per type.
  - Add backend tests.
- **Dashboard:** in the "Colours per block" area for Callout, add a small table: one row per type (Information, Tip, Warning, Success, Announcement), each with a background colour and an icon colour chosen from the site list or left empty.
- **Callout (`types.js`, `index.js`, `schema.js`):**
  - `getInitialDataForType(type)` also seeds `backgroundColor` and `iconColor` from the dashboard mapping, when set.
  - Changing type later: swap the icon only when the current icon is the previous type's icon. Swap each colour only when it still equals the previous type's seeded colour. Anything the editor changed stays.
  - Schema: keep `calloutType` visible after configuration, as the first field of the Default panel. The type descriptions stay.
- `View.jsx` doesn't change; it already renders from `icon`, `backgroundColor` and `iconColor`.

**Saved content:** no change. Saved callouts keep their stored icon and colours. Callouts from before types existed (no `calloutType`) show the type field empty; choosing a type only fills colours they haven't set.

### CO2 · Callout: one-off empty hint · agreed (sets the direction for P4)

**Decision:** in-frame hints are fine when the block's own frame helps the editor, but they all go through one shared component. `BlockPlaceholder` stays for whole-block states (no mode chosen, nothing to show at all).

**Action:**
- New `_shared/EditHint.jsx` + `_shared/edit-hint.css`:
  - `<EditHint isEditMode={…} tone="hint" | "warning">{text}</EditHint>` renders nothing unless `isEditMode` is set.
  - Class `block__edit-hint` (plus `block__edit-hint--warning`). Italic, muted, uses `--grey` / `--dark` with fallbacks.
  - Include an `aria-live="polite"` option for warnings that appear after a change (R2, H2).
- Use it for:
  - Callout empty text (`View.jsx:80`, replacing `.juizi-block__placeholder`)
  - Hero TOC notice (`hero-toc-empty-notice`)
  - Hero title hint (H1)
  - Hero duplicate-primary-heading warning (H2)
  - Redirect same-page warning (R2)
  - Carousel unmatched-tag notice (C6)
- H7's unfinished buttons and C8's picture-less slides keep their dashed element styling, but take their text from `EditHint`.
- Delete `.juizi-block__placeholder` from `theme/juizi-blocks.scss` and `.hero-toc-empty-notice` from `HeroBlock/style.css`.
- Document both shared components in `_shared/README.md` (S1): when to use which.

**Saved content:** no change.

### H9 · Hero: dead `enableStyling` config · agreed

**Action:** delete `enableStyling: true` from the `juiziHero` definition in `blocks/index.ts:72`. Nothing reads it (checked in Volto core, VLT 7.8.6 and this add-on).

**Saved content:** no change.

### CR10 · Content Row: whole Lucide library bundled · agreed

**Decision:** import only the icons editors can choose, as the Callout does.

**Action:**
- `config/iconChoices.js`: export a map of name → individually imported Lucide component for every icon in `iconChoicesList`.
- Also include the icons the legacy converter maps to (`legacy/blocks.js` `ICONS`: Link, Home, Folder, User, Pencil, Briefcase, Fingerprint, BellRing), plus `Circle` as the fallback.
- `ContentRow/View.jsx`: replace `import * as LucideIcons` with that map. `IconItem` looks up the map, then `customSvgMap`, then falls back to `Circle`.
- **Before release:** list the icon names used by saved Content Row items on each live site, and add any that are missing to the map.

**Saved content:** ⚠ a saved icon that isn't in the map shows the fallback circle. The pre-release check above prevents that.

### CR11 · Content Row: count-up timing and server output · agreed

**Decision:** the server renders the real number. In the browser, the count-up runs once when the statistic comes into view.

**Action** (`ContentRow/View.jsx`, `CountUp`):
- Initial state is the final value, so server HTML and no-JS visitors see the real number.
- In an effect, observe the element with `IntersectionObserver`. The first time it's at least half visible, animate from 0 to the value over the chosen speed (CR8), then disconnect.
- Reduced motion, or no `IntersectionObserver`: no animation; the number stays as rendered.
- Reset and re-run when `end`, `duration` or `formatK` change in edit mode, so editors see their change.
- CR3: the Statistics description becomes "key figures that count up when they come into view". Fix the README wording to match.

**Saved content:** no data change.

### C11 + CO5 · Dashboard descriptions · agreed

**Action** (`blocks/index.ts`, `components/Blocks/Callout/index.js`):
- Carousel: "Slides you add or pages found automatically, shown as a carousel, card row or scrolling logo strip."
- Callout: "Highlighted message with an icon and an optional link."

**Saved content:** no change.

### R5 · Redirect: duplicate label and hard-coded colours · agreed (wrapper class decided in S5)

**Action:**
- `Redirect/Edit.jsx`: remove the `redirect-block__label` span. The link picker's title becomes "Send visitors to".
- `redirect-block.less`:
  - Replace the hex colours (`#e0b84a`, `#fff8e6`, `#7a5c00`, `#b8d9b8`, `#f4faf4`, `#5a8a5a`) with site/VLT variables and hard-coded fallbacks, e.g. `var(--theme-high-contrast-color, #f4faf4)`. Pick the exact variables when implementing.
  - Add fallbacks to `var(--grey)` and `var(--lightgrey)`.

**Saved content:** no change.

### CO3 · Callout: icon/link colour can vanish on the background · agreed

**Decision:** warn in edit mode. All colours stay available.

**Action** (`Callout/View.jsx`):
- When `backgroundColor` is set and `iconColor` (or `linkColor`) is the same colour, or has the same lightness (`isColorDark` on both), show an `EditHint` with `tone="warning"` (CO2):
  - Icon: "The icon colour is hard to see on this background. Choose a lighter or darker one under Colours."
  - Link: the same wording with "link colour".
- Visitors see nothing.
- A lightness match is a rough test. It can warn about a pair that's fine, or miss a poor one. Swap in a real contrast-ratio check later if it misfires.

**Saved content:** no change.

### X1 · Label for the first choice · agreed

**Decision:** "Display style" in Hero, Content Row, Carousel and Gallery. The Callout keeps "Callout type", because it picks a purpose, not a layout.

**Action:**
- Hero `blockMode` title → "Display style" (confirms H5).
- Every start-screen prompt: "Select a display style in the sidebar to get started." The Hero changes from "Select a block mode…".
- Content Row, Carousel and Gallery already use "Display style"; no change.

### X2 · Naming items in lists · agreed (implemented through CR8)

**Decision:** list items take their name from their own heading (`titleField`). There's no separate label field. Content Row changes as in CR8; the Carousel already works this way. Hero buttons use `titleField: 'label'`, so the button list shows each button's text.

### X3 · Alt text · agreed

**Decision:**
- A content image uses its item's heading as alt text, and every such image field says so in its description.
- An image with no heading is decorative (`alt=""`).
- Background images are always decorative.
- Images with no nearby heading keep their own text: the Hero side image keeps its "Alt text" field; Gallery pictures use the picture's title.

**Action:**
- Check every image field's description states the rule. Content Row card and block image, and Carousel slides, already do. Add it to the Content Row `blockImage` description ("The block heading is used to describe this image to screen reader users.").
- Hero `heroLogo` is decorative (`alt=""`); say so in its description.
- Write the rule into each README's accessibility section (S6), and propose it for the skill (P13 below).

### X4 · "No background colour" and where the field sits · agreed

**Decision:** the choice is labelled "None" everywhere.

**Panel names:**
- Content Row: "Background & spacing" (CR4)
- Hero: "Background" (H3)
- Carousel: a "Background" panel for background image, background colour, text over the image (C4) and slide background colour, split out of "Appearance"
- Gallery: a "Background" panel for background colour and the thumbnail highlight (G3)
- Callout: keeps "Colours" (it has several colour fields)

**Action:**
- Hero and Content Row `['transparent', 'None (transparent)', 'light']` → `'None'`.
- Callout `backgroundColor`: add an explicit `['transparent', 'None']` first choice, not just the placeholder, so editors can go back to no background. Keep the "Same as text" placeholder for icon and link colours.
- Carousel and Gallery: create the "Background" panels described above. "Appearance" keeps alignment and full width.

**Saved content:** no data change. `transparent` stays the stored value.

### X5 · X6 · X7 · Advanced panel, units, "Centre" · agreed (implemented through the per-block entries)

- **X5:** "Extra style name (for your web team)" moves to an "Advanced" panel in Hero (H4), Content Row (CR4), Carousel (C7) and Gallery (G4b). Callout and Redirect have no such field.
- **X6:** time and size fields become named choices storing the old values, with a "Custom (…)" choice for unusual saved values: Content Row (CR8), Carousel (C7), Gallery (G4b). Put the "Custom (…)" choice builder in `_shared/` (S2).
- **X7:** "Centre" in every choice list touched by H5, CR8 and C7. Check the Gallery and Callout for any remaining "Center" when implementing.

### X8 · Translatable strings · agreed (no sweep)

**Decision:** don't convert every block to `defineMessages` in this round. The sites are English-only (`config/settings.ts` sets `supportedLanguages: ['en']`). The Callout keeps its messages. Other blocks move to `defineMessages` whenever they're rebuilt later. The copy changes in this round stay as plain strings.

### X9 · Overlapping blocks in the chooser · agreed (site-by-site)

**Decision:** no default in code. Each site's admin decides in Site Setup → Juizi Blocks which overlapping blocks to switch off.

**Action:**
- Add-on README: an "Overlapping blocks" section listing the pairs so admins can decide:
  - kitconcept Carousel and Slider vs Juizi Carousel
  - kitconcept Banner and Introduction vs Juizi Hero
  - kitconcept Highlight vs Juizi Hero (Section)
- Note that switching a block off only hides it from the chooser; pages already using it keep rendering (`settings/toggles.ts`, `restricted`).
- Add the check to each site's launch checklist.

**Saved content:** no change.

### X10 · Icon-only alignment control · agreed

**Decision:** replace Volto's icon-only `align` widget with a text select, as Content Row already does.

**Action:**
- Hero `alignment`, Carousel `alignment` and Gallery `alignment`: remove `widget: 'align'` / `actions`, and use `choices: [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']]`, keeping each block's default.
- Put the choices in a shared helper (S2), since four blocks use them.

**Saved content:** no change (same stored values).

### S1 · `BlockPlaceholder` vs the skill · agreed (sets the direction for P2)

**Decision:** the component keeps its markup, and its CSS moves to the skill's colour variables. The skill is updated to describe the real markup.

**Action:**
- `_shared/block-placeholder.css`: replace `#c7c7c7` / `#fafafa` / `#444` with `var(--light, #ddd)` (dashed border), `var(--lightest, #f9f9f9)` (background), `var(--grey, #888)` (text) and `var(--dark, #111)` (mode names). Centre the content, and give `.block-placeholder__inner` `max-width: 480px; margin: 0 auto`.
- Keep the markup: `block-placeholder {blockClass} {blockClass}--placeholder`, `block-placeholder__inner`, `block-placeholder__prompt`, and `<ul class="block-placeholder__modes">` with "**Name** — description".
- New `_shared/README.md`, covering:
  - `BlockPlaceholder`: props, when to use it (no mode chosen, nothing to show at all), the edit-mode check, and view mode returning `null`
  - `EditHint` (CO2) and `BlockErrorBoundary` (C2)
  - the helpers from S2
  - the hook-free wrapper pattern
- Remove leftover placeholder CSS from `HeroBlock/style.css:426-440` and `EmblaCarousel/carousel-base.css:345` (comment only).

**Saved content:** no change.

### S2 · Shared helpers · agreed (links already agreed in C3)

**Decision:** move every duplicated helper into `_shared/` this round, and delete each block's copy as it switches over.

**Action**, new modules in `_shared/`:
- `links.js`: `getHref`, `isExternalHref` (C3)
- `images.js`: `getImageUrl`, `resolveScales`, `getListingImageUrl` from Carousel and Gallery
- `overlays.js`: `overlayChoices` and `overlayStyleToRgba` from Hero and Content Row
- `spacing.js`: the padding choices (none / compact / default / spacious / extra-spacious), with one label style ("Top padding" / "Bottom padding") for both blocks
- `anchors.js`: slug and anchor-id generation (Hero, Content Row, Carousel, Gallery)
- `choices.js`: `withSavedChoice(choices, savedValue, formatLabel)` for the "Custom (…)" choices (CR8, C7, G3, G4b), and `alignmentChoices` (X10)
- `format.js`: `formatDate`, `formatNumber` (H6)
- `skeleton.css`: skeleton tiles (G2, C1)

Also:
- Unit tests for `links`, `choices` and `format`.
- Document everything in `_shared/README.md` (S1).
- `_shared/` stays outside the block registry (`blocks/index.ts` is an explicit list).

**Saved content:** no change. Behaviour should be identical; the Content Row padding labels change wording only.

### S4 · `makeBlockEdit` as the default Edit · agreed

**Decision:** Hero, Content Row, Carousel and Gallery use the shared `makeBlockEdit`, like the Callout. Redirect keeps its own Edit (P3).

**Action** (`components/BlockEdit/BlockEdit.jsx`):
- Add a `getFormData(data)` option, which transforms the data given to the form: Content Row's `ensureIds`, and the Carousel's slide-link array normalising.
- Keep `getChangedData(id, value, data)`:
  - Hero: first-mode defaults (H1), side-image seeding, button label auto-fill (currently in both `onChangeField` and `onChangeBlock`; move both into one path)
  - Content Row: first style choice and style switching (CR2)
  - Carousel and Gallery: first-mode defaults
- Allow an optional `formKey(data)`, for blocks that still need to remount the form: the Carousel's `useListing` / `displayMode` / `appendManualSlides` key, and the Gallery's `sourceMode` / `displayMode` key. Content Row keys on the display style only (CR6).
- The schema comes from each block's `juiziSchema` in `blocks/index.ts` (not Volto's `blockSchema`, see L3). Move each block's schema function there. The Carousel and Gallery enhancers run inside their schema function as now.
- Delete `HeroBlock/Edit.jsx`, `ContentRow/Edit.jsx`, `EmblaCarousel/Edit.jsx` and `EmblaGallery/Edit.jsx`, and move their helper logic into each block's `index.js`, as the Callout does.
- Every View receives both the full props and `isEditMode` (P9).
- Keep `EmblaCarousel/Edit.test.jsx`'s intent: add a test that `makeBlockEdit` passes `onChangeBlock` and `isEditMode` to the View.
- Style import: `ContentRow/Edit.jsx` and `HeroBlock/Edit.jsx` import `style.css`. Their Views import it too, so removing the Edit imports is safe. Confirm when implementing.

**Saved content:** no change.

### S5 + S7 · Wrapper classes and Block Model v3 preparation · agreed

**Decisions:**
- S5: every block carries the full set: `block`, its BEM class, `type-{mode}`, and `align-*` / `tone-*` where it has them.
- S7: prepare for Block Model v3 now by wrapping each block's View in `BlockWrapper` from `@kitconcept/volto-bm3-compat` (already a dependency).

**How the two fit together** (checked in `volto-bm3-compat` `BlockWrapper.tsx`):
- Under the v2 model, `BlockWrapper` renders `<div class="block {@type} {className}">` around the block. Under v3 it renders nothing and lets VLT draw the containers.
- So the generic `block` class comes from `BlockWrapper`, and our modifiers go in its `className`.
- Each block's own outer element keeps its BEM class but **drops** `block`. That applies to Hero and Gallery, which have it today; otherwise there'd be two nested `.block` elements.

**Action:**
- Each View's top level: `<BlockWrapper {...props} className={cx('type-' + mode, align && 'align-' + align, tone && 'tone-' + tone)}>`, around the existing outer element (`section.hero-block`, `section.content-row`, `section.embla`, `section.gallery`, `.juizi-callout-wrapper`, `.redirect-block-wrapper`).
- Hero keeps its inner `hero-block__inner--align-*` classes and `bg-dark` / `bg-light`, so existing site CSS keeps working, and also gets `align-*` / `tone-*` on the wrapper (H8).
- Placeholders and the error boundary render inside `BlockWrapper` too, so edit and view markup match.
- Tone for the class: Carousel and Gallery from C4. Hero, Content Row and Callout from `isColorDark(backgroundColor)`.
- `BlockWrapper` needs `props.blocksConfig` and `props.data['@type']`. Volto passes both to block views; confirm for blocks inside containers (grid).
- **Check on pages with saved content:** VLT styles `.block` (margins and spacing). The new outer div can change spacing around every Juizi block. Compare before and after on a page with each block.
- **Later, when switching to v3 (not this round):** set `blockModel: 3` and a `category` on every Juizi block **and** the global `config.settings.blockModel = 3` in the same release. `BlockWrapper` checks the per-block key and VLT's view renderer checks the global one, so doing only one leaves the blocks with no container at all (P1). The `className` modifiers passed to `BlockWrapper` are dropped under v3, so move them to VLT's style data or to the block's own element at that point.

**Saved content:** no data change. ⚠ Every Juizi block on live pages gets an extra outer `div.block.{type}`. Site CSS using child selectors on the old outer elements, or VLT's `.block` spacing, may shift layouts. Check each site's theme.

### S6 · READMEs · agreed

**Decision:** write the missing READMEs, correct the stale ones, record this round's decisions, and include a **draft** happy path per block, marked "to confirm in FTE".

**Action:**
- New: `Redirect/README.md`, `Callout/README.md`.
- Correct `HeroBlock/readme.md` (rename to `README.md` for consistency):
  - two modes, not three
  - drop plone.org as the target
  - move the colour-system section to a shared doc (`config/README.md` or `_shared/README.md`) and link to it
  - document the new fieldsets
- Correct `ContentRow/Readme.md`:
  - registration via `blocks/index.ts`
  - remove the React 19 warning and the `multiCard` / `iconLinkRow` alias snippet
  - rename its "Block model v3" section to "First choice"
  - add real BM3 notes (S7)
- Carousel and Gallery: rename their "Block model v3" sections to match, and update to this round's changes.
- Every README follows the skill's §4.5 list: registration, dependencies, modes, happy path, known issues. Add a "Decisions and trade-offs" section listing the relevant decisions from this file (for example R3's browser-only redirect, G4's one column on phones, C6's query-only filters, X9's overlapping blocks).
- Draft happy paths: written from the post-fix behaviour as a numbered list from "Add the block" to "Publish", headed **"Draft, confirm in first-time editor test"**. Replace them after the human FTE.

**Saved content:** no change.

### P1 · Skill §4.2 Block Model v3 · accepted

**Skill change** (apply at the end, per §12): replace the first two bullets of §4.2 with the wording in `block-audit.md` P1, and add:
> `BlockWrapper` checks the block's own `blockModel`, while VLT's view renderer checks the global setting. Set both in the same release, or blocks lose their containers.

Record "checked against VLT 7.8.6" and add a change-log line.

### P3 · Skill §4.1 exception for non-visual blocks · accepted

**Skill change:** add the exception wording from `block-audit.md` P3 to §4.1. Redirect is the example.

### P5 · Skill §3 no seeded example content · accepted

**Skill change:** add to §3:
> Don't seed items with example text or numbers. Seed structure only (an empty item, or none) and let the empty state prompt the editor.

### P6 · Skill §4.4 colours · accepted (with the background-image exception)

**Skill change:** replace §4.4 with the P6 wording in `block-audit.md`, and add:
> A text-tone choice is allowed only where text sits on a background image, which can't be judged automatically. Show it only when an image is set.

### P7 · Skill §6 units · accepted (plus saved values)

**Skill change:** add the P7 wording to §6, and add:
> When a numeric field becomes named choices, keep the stored values, and show an unusual saved value as a "Custom (…)" choice so the field isn't blank. (Helper: `_shared/choices.js` `withSavedChoice`.)

### P8 · Skill §4.5 / §10 registry and shared Edit · accepted

**Skill change:**
- §4.5: "Where the project uses a block definition registry (`blocks/index.ts`), register there, not directly in `blocksConfig`."
- §4.1 / §10: "Blocks without inline editing use `makeBlockEdit(View, { getChangedData, getFormData, formKey })` as their Edit." List `components/BlockEdit/BlockEdit.jsx` in §10.

### P9 · Skill §4.1 edit-mode detection · accepted

**Skill change:** replace the §3.1 bullet "Detect edit mode with `typeof props.onChangeBlock === 'function'`…" with:
> Views read the `isEditMode` prop set by `makeBlockEdit`. Code that can't rely on it (a component used outside `makeBlockEdit`) uses `typeof props.onChangeBlock === 'function'`. Never `props.mode`.

Update the §3.1 usage example to match.

### P10 · Skill §10 reference implementations · accepted (apply after the fixes land)

**Skill change**, made once this round's fixes are merged so the references show fixed code: point §10 at `juizi-blocks` (`frontend/packages/volto-juizi-blocks`) and cite each block for one pattern only:
- **Hero:** mode picker with per-mode descriptions; own-heading default for Section (H1)
- **Gallery:** configured-but-empty state and loading skeleton (G2)
- **Carousel and Gallery:** hook-free wrapper; shared `BlockErrorBoundary` (C2)
- **Callout:** `makeBlockEdit`; in-frame `EditHint` (CO2)
- **Redirect:** the non-visual block exception (P3)
- **`_shared/README.md`:** `BlockPlaceholder`, `EditHint`, helpers

### P11 · Skill §11 audit the chooser · accepted

**Skill change:** add step 0 to §11:
> List every block the editor can add on the site, not just ours, and flag overlapping purposes for a site-level decision (hide, restrict or document). Switching a block off in the dashboard hides it from the chooser only; saved content keeps rendering.

### P12 · Skill §5 mode field name · accepted

**Skill change:** add to §5:
> Name a layout-choice field `displayMode`. A purpose-based first choice may use its own id (e.g. `calloutType`). Never use `variation` unless the block uses Volto's `variations` mechanism: VLT's CSS hides the fourth option of any `.field-wrapper-variation` select.

### P13 · Skill alt-text rule · accepted

**Skill change:** add to §8 (Accessibility):
> Content images use their item's heading as alt text, and the image field's description says so. Images with no heading, and all background images, are decorative (`alt=""`). Images with no nearby heading get their own alt field or use their own title.

### P2 · Skill §3.1 `BlockPlaceholder` markup · accepted

**Skill change:** replace the §3.1 "Renders" block with:
```html
<div class="block-placeholder {blockClass} {blockClass}--placeholder">
  <div class="block-placeholder__inner">
    <p class="block-placeholder__prompt">{prompt}</p>
    <ul class="block-placeholder__modes">
      <li><strong>Name</strong> — description</li>
    </ul>
  </div>
</div>
```
The Styling bullet stays as written; the component now follows it (S1). Add to §4.5: "`_shared/README.md` documents the shared components."

### P4 · Skill §3.2 in-frame hints · accepted

**Skill change:** replace "Don't add one-off `.block-name--empty` classes…" in §3.2 with:
> Use `BlockPlaceholder` when the whole block has nothing to show. When the block's own frame helps the editor (a callout with no text yet, a button row with no buttons), show a short hint inside it with `_shared/EditHint`, edit mode only. Don't add one-off empty-state classes.

### Legacy safeguards (added after the compatibility check) · agreed

These three came from checking the agreed changes against the content the legacy transform converts (`legacy/`, `COMPATIBILITY.md`). Without them, older content would break.

**L1 · CR1 rename ships with its repair and tests.**
- The rename, the converter updates, the `repairCurrentBlock` rule for `contentRow` and the `legacy.test.js` changes land in one commit.
- Update the tests' assertions to `displayMode`, don't delete them. Add a test that a saved Content Row with only `variation` renders its style.

**L2 · `getHref` accepts plain string links.**
- The Redirect's `resolveUrl` accepts a string URL as well as `[{ '@id' }]`. Older content may hold either shape.
- `_shared/links.js` `getHref` handles strings, single objects, arrays, and empty values. Add unit tests for each shape.
- Without this, a Redirect saved with a string URL would stop redirecting without any error.

**L3 · S4 schemas stay out of Volto's defaults mechanism.**
- Decision: register block schemas under a Juizi config key, `juiziSchema`, which `makeBlockEdit` reads. Don't use Volto's `blockSchema`.
- The reason: once a block has a `blockSchema`, VLT's renderer calls `applyBlockDefaults` on every saved block at render time (`@plone/volto/helpers/Blocks/Blocks.js:557-580`). That merges each field's `default` into data that lacks the field. Converted blocks would suddenly get button and arrow styles (the `getDefaultButton()` defaults), carousels would start looping, and so on.
- The Callout moves from `blockSchema` to `juiziSchema` too, so all blocks work the same way.
- Schema functions accept both call shapes, `({ intl, props })` and `({ data, formData, intl })`, and read the block data from whichever is present.

---

## Applying this file

1. **Code, in the audit's order:** editor-facing fixes first, then structural ones. Ship the Content Row rename (CR1) and its legacy repair in the same release.
2. **Before release**, the checks named in the entries:
   - H2: `:has()` browser floor, and site theme CSS using the old body classes
   - C3: server render of an external slide link
   - C6: whether manual slides store `Subject`
   - CR6: browser test of the item list
   - CR10: icons used on live sites
   - S5/S7: spacing around every block on pages with saved content
   - G4, C4, C5: layouts that change on live pages
3. **Skill:** apply P1–P13 per §12 (P10 after the code lands), and add a change-log line.
4. **After release:** run the human first-time editor test per block, and replace the draft happy paths (S6).

---

## Implementation (2026-09-29)

All agreed actions are in the code. The checks in the repository pass: `pnpm lint` (0 warnings), Prettier, Stylelint, `pnpm test` (103 tests, 17 new), backend `pytest` (43, 4 new). **Nothing has been run in a browser or against a running site.**

The block code was never in git, so there's no diff against the audited state. For comparison: `old-block-setups/acqf/components/Blocks` (older than the audited version), and a snapshot of the audited state for every file not yet changed at that point, in the session scratchpad (`snapshot-mid-implementation/state.tar`).

### Where the code differs from a recorded action, and why

- **X2 / CR8, naming list items:** the actions said `titleField: 'heading'`. VLT's list widget (`volto-light-theme/src/components/Widgets/ObjectList.tsx`) doesn't support `titleField`; it shows `item.title` or "Item #n" (so the Carousel's existing `titleField` never did anything). Instead, `_shared/items.js` `withItemTitles` fills `title` from the heading (statistics: label; Hero buttons: label) on every change, and there's no title field in the item forms. Same result for the editor.
- **S2:** the padding choices live in `_shared/choices.js`, not a separate `spacing.js`.
- **Anchors (H-, CR-):** the published page passes the block id as `id`, not `block`, so Hero and Content Row anchors on live pages never had the id suffix. They're kept exactly as they were, so existing links keep working. Known issue, documented in the Content Row README: two Content Rows (or Hero Sections) with the same heading on one published page share an anchor id.
- **C9 follow-up, done in Content Row too:** image cards with a link but no button style wrapped the whole card in a link around the button link (invalid nested links). The button is now the one real link, and a mouse-only cover link (`aria-hidden`, out of the tab order) keeps the card clickable.
- **G2 / C1 consistency:** a Gallery with no pictures shows visitors nothing at all, heading included, like the Carousel.
- **G1:** the "Equal height images" switch was removed as the default suggested; saved Even grids with it off still render uncropped.
- **H3, possibly a wrong finding:** the Hero README said Volto merges fieldsets that share an id into one panel, so editors may never have seen two "Background" panels. The fix (one panel) is harmless either way.
- **Tests and `BlockWrapper`:** Volto's Jest setup doesn't transpile `@kitconcept/volto-bm3-compat` (TypeScript source), and overriding `moduleNameMapper` in `jest-addon.config.js` drops Volto's own mappings. So tests use a manual mock (`_shared/__mocks__/BlockWrapper.jsx`) with the same block model 2 markup. The site build uses the real package, which VLT lists as an add-on.
- **Found while implementing:** the add-on's `.gitignore` had a bare `README.md`, which ignored every block README (and would have ignored the new ones). It's now `/README.md`, so only the package-root copy is ignored.
- **Found after implementing (2026-09-30), S5/S7 layout regression:** `juizi-common.scss` gave each block its full-width outer layer with `.blocks-group-wrapper > .hero-block` (etc.). With `BlockWrapper`, the direct child is now `div.block.{type}`, which VLT narrows to the container width (`.blocks-group-wrapper > *`), and the Juizi rule no longer matched. So on published pages every Juizi block would have lost its full-width background. Fixed: the wrapper div is made full width (`.blocks-group-wrapper > .block:has(> {outer})`), and the outer-layer rule also matches `> .block > {outer}`. Not caught by tests (they mock `BlockWrapper` and have no page layout). The same change moved the file to `@use 'sass:list'` / `list.nth`, which removes the Dart Sass `global-builtin` deprecation warning.
- **Translations:** `pnpm --filter volto-juizi-blocks i18n` was run for the Callout's new messages (`locales/`).

### Still to check on a running site (before release)

- **C3:** server-render a page with a manual Carousel slide that has an external link and a button label; the Carousel is in the HTML and there are no server errors. (Every `window` read in the block views is inside an effect or handler or behind `typeof window`, and a Jest render passes, but Volto's Jest setup can't run without `window`.)
- **CR6:** add, remove and reorder Content Row items in every style; the open item stays open.
- **C9 / G5:** keyboard and screen reader check of clickable slides and gallery pictures; a swipe on a touch device doesn't follow a slide link.
- **C5:** logo strips on live pages: which now scroll or stop scrolling.
- **H2:** browsers used by each site support `:has()`; site theme CSS using `has-hero-primary-heading` / `has-hero-breadcrumbs` moved to the new selectors.
- **S5/S7:** spacing around every Juizi block on pages with saved content (new outer `div.block.{type}` from `BlockWrapper`).
- **CR10:** icon names used by saved Content Row items on each live site are all in `lucideIconMap`.
- **C6:** whether manual slides picked with the object browser store `Subject`.
- **G4, C4:** the live layout and colour changes noted in those entries.
- **CO1:** the dashboard's new "Callout types" table saves and reloads (backend validation is unit-tested).
- **TypeScript:** `npx tsc --noEmit` in the add-on reports one error inside Volto core (`MaybeWrap.tsx`, a type-only import under this add-on's `verbatimModuleSyntax`), pulled in through `volto-bm3-compat`. `tsc` isn't one of the project's scripts; lint and the build don't run it.
- **Human first-time editor test** per block; replace the draft happy paths in the READMEs.

### Skill updated (2026-09-30)

P1–P13 are applied to `~/.claude/skills/volto-block-standards/SKILL.md` (the previous version is in the session scratchpad, `SKILL.before.md`). P10 was applied with the code, since the fixes landed in the same round. The update also records the patterns this round set up, so new blocks and audits of older blocks follow them:
- the canvas-state table (start screen, empty, loading, unfinished item, error)
- `makeBlockEdit` + `juiziSchema`, and why not `blockSchema`
- `BlockWrapper` and wrapper classes
- the `_shared/` toolkit table
- saved and legacy content (new section 4.6)
- real links and buttons, and server-safe rendering
- checking git before changing code
- the audit → actions file workflow
