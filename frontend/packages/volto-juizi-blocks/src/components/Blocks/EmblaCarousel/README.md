# Carousel block (`emblaCarousel`)

Slides the editor adds, or pages found automatically from site content, shown as a carousel of image slides, cards, reviews, or a scrolling logo strip. Built on Embla.

Shared parts (dashboard, colours and buttons, shared styling and tokens, links, the block toolkit, the carousel-style controls it shares with the Gallery, and the conventions every block follows) are in the repository's root `README.md`.

---

## Registration

Registered through the block list in `src/blocks/index.ts` (`view: EmblaCarouselView`, `edit: EmblaCarouselEdit`, `juiziSchema: emblaCarouselSchema`). The Edit is the shared `makeBlockEdit`; this block's own logic (first-choice defaults, slide links stored as single objects, slide names in the sidebar) is in `index.js`.

`EmblaCarousel` blocks from earlier add-ons are converted as pages load, and current blocks saved with only `mode` are repaired to `displayMode` (`src/legacy/`).

## Dependencies

`embla-carousel-react`, `embla-carousel-autoplay`. The logo strip is CSS only. The Reviews style's stars are the `Star` icon from `lucide-react`.

---

## First choice

`displayMode` comes first; nothing else shows until it's chosen. The canvas shows the shared start screen with a description of each style (editors only; visitors see nothing). The outer `WrappedEmblaCarousel` is hook-free, so Embla's hooks only mount once a style exists.

After a style is chosen and there are no slides, editors see what to do next, under any heading: "No reviews yet. Add reviews in the sidebar under Reviews." in the Reviews style, otherwise "No slides yet. Add slides in the sidebar under Slides, or switch on 'Fill automatically from site content'…", or, with site content, "Your content query found nothing to show…". While the query loads, a skeleton in the slides' shape shows (editors and visitors). With nothing to show, visitors see nothing at all.

---

## Display modes

| Mode | Description | Embla needed |
|---|---|---|
| `full` | Image with text overlay | Yes |
| `image-only` | Image only, no text | Yes |
| `image-top` | Image above content | Yes |
| `reviews` | Reviews: what people said, with a name and optional stars | Yes |
| `logo-marquee` | Scrolling logo strip (CSS only) | No |

---

## Reviews

A display style, not a block of its own: reviews need everything the Carousel already has (scrolling, arrows, dots, heading, colours), so a separate block would have put two carousels in the chooser. The older standalone `EmblaRatings` block isn't converted; no site in `old-block-setups` uses it.

**A review is a slide with its own labels.** The same stored fields are used, so what the editor typed carries over when the style changes:

| Sidebar label | Stored as | Notes |
|---|---|---|
| Review text | `content` | |
| Star rating | `rating` | `'0'`–`'5'` as a string (Volto's select only shows the label of a string value); "No stars" or nothing chosen shows no stars. The view reads it with `parseInt` |
| Name | `heading` | Names the review in the sidebar list, and is the review's link when it has one |
| Organisation or role | `organisation` | New field, only used by this style |
| Picture | `image` | Shown small and round; decorative (`alt=""`), because the name beside it says who it is |
| Link | `link` | The name becomes the link; with "Make entire review clickable" it stretches over the review |

**What the sidebar leaves out in this style:** "Fill automatically from site content" and the filter buttons (pages have no rating or reviewer), and the slide button fields (a review has no button). A carousel that was filled automatically before its style was changed ignores the saved query and shows its own reviews; the query stays in the data and comes back if the style is changed back.

**Wording:** the options this style shares with the others are named after reviews ("Reviews visible at once", "Equal height reviews", "Review background colour").

**States:**

- No reviews: editors see "No reviews yet. Add reviews in the sidebar under Reviews."; visitors see nothing.
- A review with no text, name or stars: flagged for editors (`block__unfinished`), left out for visitors, so the dots and arrows match what's shown.
- A link but no name: editors get a warning; visitors see the review without a link.

**Layout** (`carousel.css`, "Reviews style"): picture, stars, text, name. Reviews start at the top of the slide so they line up across different lengths. Without a review background colour the text follows the block's colour; with one, the review becomes a card with padding and the shared card radius. The theme's own `blockquote` and `figcaption` looks are reset (the published page indents every blockquote with an id selector, hence the `#page-document` rule).

**Arrows:** a new Reviews carousel starts with the arrows below (`arrowPosition: 'below'`), since arrows on the sides would sit over the words. If an editor chooses "On each side", the reviews move in to make room (`carousel-base.css`).

**Stars:** `--juizi-review-star-color` on light backgrounds and `--juizi-review-star-color-on-dark` on dark ones (tokens in `juizi-common.scss`), chosen from the review's background colour if it has one, else the block's tone. Empty stars are outlines, so full and empty differ in shape and not only in colour.

**Autoplay:** in this style autoplay also waits while the pointer is over the carousel, because a review is read rather than glanced at.

---

## Background and text colour

`backgroundImage` and `backgroundColor` are inline styles on the `.embla` section (image over colour, `cover`, centred; no extra layer or overlay). The tone (`tone-dark` / `tone-light`) sets the block's text colour, and the heading and intro text both follow it, so they always match; a background colour's own text colour wins over the tone. Only over a background image does the editor choose ("Text over the background image", `textTone`).

## Arrows and the "More" button

`arrowPosition` and `moreButtonPosition` are separate fields.

- **Arrows** (`arrowPosition`): on each side of the carousel (`bottom`, the stored value from when it was labelled "Below the carousel", kept so saved carousels don't change), in a row below it (`below`), or beside the heading (`top`). The row below is always rendered; on larger screens CSS shows it only for `below` (and overlays it on the sides for `bottom`), on phones it's where the arrows always are (shared controls).
- Arrows only show when not every slide is in view (`slides.length > effectiveSlidesToShow`).
- **Arrow style** (`arrowStyle`) applies to every position: `default` ("Standard") or a button colour (`solid__…` / `outline__…`). Saved carousels without one show "Standard", which is what they render.
- **"More" button** (`headerLinkText` / `headerLinkUrl` / `headerLinkStyle`): beside the heading (top) or below the carousel (bottom, aligned with `moreButtonAlign`). On phones a top "More" button stays up top; only the arrows move down.

## Filter on phones

With filter buttons, phones get a native dropdown labelled "Show:" instead of the row of tabs (`.embla__filter-select`), which doesn't fit a narrow screen. Both set the same filter.

## Removed: "Centre active card"

`centeredPeek` was removed (only one site used it, and it dropped it). Saved carousels with it on now scroll like the others; the stored value is ignored.

## Picture shape

`imageAspectRatio` (Image only and Image above content): `original` ("As uploaded", the default) or a `width:height` shape such as `16:9`. View.jsx turns it into `--slide-image-ratio: 16 / 9` and the class `has-image-ratio` on the block; every picture then fills the slide's width at that shape (`aspect-ratio` + `object-fit: cover`, edges trimmed). Offered as named shapes rather than sizes so editors can click through them and see the effect. The text-overlay style uses the picture as a background, so it doesn't offer this.

## Logo strip

- Shows the heading and intro text above the logos.
- Scrolls only when the logos don't all fit across. `View.jsx` adds up the logos' own widths (the still row wraps, so its own width can't be used), again as each picture loads and when the strip resizes.
- While it fits, **Logo alignment** (`logoAlignment`: left, centre (default) or right) places the still row.
- Editors see a note when the strip is still because everything fits, and when their own device's reduce-motion setting is pausing it for them.
- Logos use the slide heading as alt text (set it to the organisation's name) and, with a link, open in a new tab.

## Time on each slide

`autoplayDelay`: 4, 6, 8 or 10 seconds, default 8. The view falls back to 8 seconds too, so a carousel where nobody touched the setting runs at what the sidebar shows (it used to run at 4).

## Button arrow icon

A right-arrow can be added to any "Read more"-style button:
- **Manual slides**: per-slide `buttonArrow` toggle in the slide sub-schema.
- **Listing slides**: single `listingButtonArrow` toggle applies the arrow to every query-generated result's button.

Rendered via the `SlideButtonArrow` SVG in `View.jsx`, styled by `.embla__slide-btn-arrow` in `carousel.css` — sized in `em`, inherits colour via `currentColor`, nudges right on hover/focus, disabled under reduced motion.

## Date placement

`renderDate()` output now renders directly under the slide heading (`<h3>`) rather than above it, in both the full/overlay and image-top layouts. `.slide-date` no longer forces right alignment — it inherits `text-align` from the block's `alignment` setting via `.carousel-slide-inner`, so it follows left/center/right like everything else in the slide.

## Image above content — hiding the image

`hideCardImage` (Card layout fieldset, `image-top` mode only) hides each card's image, even when a slide has one set. Useful for text-only cards within an otherwise image-led carousel. It only gates the `<img>`/`.card-media` markup — the underlying `imageUrl` is still resolved, so switching the option back off doesn't require re-selecting the image. Not offered for `full` (image with text overlay) mode, since the image there is the slide's background rather than an optional card element.

When no image is shown — either because `hideCardImage` is on, or because the slide simply has no image set — the `.card` element gets a `no-image` class, mirroring the existing `.carousel-slide-inner.no-image` convention used in `full` mode. There's no default CSS rule keyed off it yet (the current `card-content` padding already looks fine either way), but it's there as a hook for theme-level styling — e.g. removing `card-media`'s reserved space or adjusting `card-content` spacing when a design calls for it.

## Filled from site content (listing mode)

When "Fill automatically from site content" is on, slides are pulled from a Plone catalog query via `searchContent`. The editor's own slides can follow the found pages with "Also show slides I add myself".

"Filter buttons by tag" is offered with site content only (the tags come from each found page); a carousel that already had tags saved keeps the field. Editors are told when a tag matches nothing ("No results tagged 'Events', so its button is hidden.").

The block dispatches its search under the block's Volto UID as a Redux subrequest key, so multiple carousel blocks on the same page maintain separate result sets.

Path criteria using `absolutePath` (UID-based) are resolved to real paths via a secondary subrequest before the main search fires.

---

## Accessibility

Section, heading and link structure follow the shared conventions (root README): block heading `<h2>`, slide headings `<h3>`. Specific to this block:

### Navigation controls

**Arrow buttons** carry `aria-label="Previous slide"` / `"Next slide"` in every position. The icon is an inline SVG (`NavArrowIcon`) marked `aria-hidden`. The row below that isn't in use is `display: none`, so screen readers don't meet the arrows twice. Shape: the shared button shape; `--arrow-shape` overrides the radius for carousel arrows only.

**Dot navigation** buttons carry `aria-label="Go to slide N"`, `role="tab"`, and `aria-selected` reflecting the current position. The dot container has `role="tablist"` and `aria-label="Slide navigation"`.

**Filter tabs** use `role="tablist"`, `role="tab"`, and `aria-selected`. The tablist has `aria-label="Filter content"`. On phones the tabs are replaced by a native `<select>` with a visible "Show:" label.

### Clickable slides

When "Make entire card clickable" is on, each slide has **one real link** (Volto's `UniversalLink`: router navigation for internal pages, a new tab for other sites): the slide's button, or its heading when there's no button, or its picture in Image only mode. CSS stretches that link over the whole slide (`.embla__stretched-link::after`; the slide's background layers move behind its content with `isolation: isolate`). Screen readers hear one link named by its text; there are no nested controls and the keyboard works natively. Add a heading to every slide when this option is on. When the heading is the link (button hidden or not set), it keeps the heading's own look: no link colour or underline.

### Reviews

Each review is a `<figure>`: the text in a `<blockquote>`, the name and organisation in its `<figcaption>`. The stars are one `role="img"` element named "Rated 4 out of 5" (in the site's language); the five icons inside are `aria-hidden`. The picture is decorative. A review has at most one link, the name. Checked with axe (WCAG 2.1 A and AA rules) on the test page at desktop and phone widths: no violations.

### Images

- **image-only mode:** The slide image uses `alt={slide.heading}`. If the heading is empty, `alt=""` marks the image as decorative. Add a heading to every slide that has a meaningful image.
- **image-top mode:** Same — `alt={slide.heading || ''}`.
- **full / overlay mode:** Background images are applied via CSS `backgroundImage` on the inner div. CSS pseudo-elements (`::before` for the image, `::after` for the gradient overlay) are not in the accessibility tree and require no annotation.
- **Logo marquee:** Logo images use `alt={slide.heading || ''}`. Set the slide heading to the organisation name so each logo has a meaningful alt text.

### Autoplay and reduced motion

Autoplay is disabled entirely when the user has enabled "Reduce motion" in their OS accessibility settings. The `window.matchMedia('(prefers-reduced-motion: reduce)')` check runs at component initialisation. The carousel still functions — it just does not advance automatically.

The logo marquee CSS animation is also paused via a `@media (prefers-reduced-motion: reduce)` rule in `carousel.css`. No JavaScript is involved; the pause applies automatically.

### Background decoration

CSS pseudo-elements (`::before` for background images, `::after` for gradient overlays) are not in the accessibility tree. No `aria-hidden` annotation is needed or possible on pseudo-elements. Meaningful content must always be in the heading and text fields, not implied by background images.

### Slide text over pictures

In the text-overlay style, slide text sits on the picture with a gradient overlay, roughly 3:1 where text usually sits, depending on the picture. Per-slide background colours set the slide's text colour (`slide-bg-dark` / `slide-bg-light`).

---

## Known implementation notes

### `blockId` uniqueness

The wrapper `id` is derived from `data.title` with a 6-character block id suffix (e.g. `our-news-a3f9c1`), or `embla-{id-prefix}` without a title (`_shared/anchors.js` `blockAnchorId`, same format as before).

### CSS pseudo-elements and `aria-hidden`

The `carousel-slide-inner::before` (background image) and `::after` (gradient overlay) pseudo-elements cannot receive `aria-hidden` — they are not DOM elements. They are, however, excluded from the accessibility tree by default, so no annotation is needed. This is a safe exception to the standard `aria-hidden` practice applied to background divs in HeroBlock and ContentRow.

### Error boundary

`WrappedEmblaCarousel` wraps the carousel in the shared `BlockErrorBoundary`: on an error, editors see "This block couldn't be displayed. Try undoing your last change…", visitors see nothing, and the error is logged to the console. It resets when the block's data changes.

### Filter tabs and scroll reset

When the active filter tag changes, the carousel calls `embla.reInit()` and scrolls to position 0. This re-initialises Embla's internal scroll snaps for the new slide set. Without the `reInit()` the snap positions may be calculated for the previous (longer) slide count, causing the carousel to scroll past the available slides.

---

## Happy path — draft, confirm in first-time editor test

1. Add a **Carousel**. The canvas lists the four display styles.
2. Under **Content**, choose a **Display style**, e.g. **Image above content**. The canvas says there are no slides yet.
3. Add a **Heading**, then add slides under **Slides**: heading, picture, link, button text.
4. Or switch on **Fill automatically from site content** and set **Which pages to show**.
5. Adjust **Cards visible at once** under Scrolling & behaviour if needed; publish.

Reviews:

1. Add a **Carousel** and choose **Reviews** as the display style. The canvas says there are no reviews yet.
2. Add a **Heading**, then **Add Review**: the review text, a star rating if there is one, the person's name, and optionally their organisation, a picture and a link.
3. For several side by side, raise **Reviews visible at once** and pick a **Review background colour** under Background; publish.

## Decisions and trade-offs (2026-09 audit)

- Configured-but-empty prompts, a loading skeleton, and nothing for visitors when empty (C1).
- Shared error boundary with an editor message (C2).
- Links through the shared, server-safe helpers; no `window` reads while rendering (C3). **Still to confirm on a running site: a server render of a page with an external slide link.**
- Text and dot colour follow the background colour; only over a background image does the editor choose (C4). Saved carousels without an image switch to the derived tone.
- The logo strip scrolls only when its logos don't fit (measured in the browser; the server renders a still row) (C5). This replaced a rule under which query-fed strips with a result limit could never scroll.
- Filter buttons are a site-content feature (C6).
- Times and sizes are named choices; unusual saved values show as "Custom (…)" (C7).
- Picture-less slides in Image only mode are left out for visitors and flagged for editors (C8).
- One real link per clickable slide (C9).
- Dates in the site's language; British English for English, e.g. "13 November 2024".
- Arrow positions renamed and a real "below" added; arrows sit below on phones; "Centre active card" removed; picture shape as named aspect ratios.
- **Reviews style (2026-09-30):** added as a display style instead of porting the standalone ratings block. Reuses the slide's fields under review labels; no automatic fill; name is the one link; unfinished reviews hidden from visitors; arrows start below.
- **First render matches the server (2026-09-30):** the number of cards visible used to be read from the window's width for the first render, so on phones every carousel showing more than one card failed hydration ("Hydration failed… server HTML was replaced"). It now starts from the large-screen number and corrects itself on mount. Affects every style.
- The block renders inside `BlockWrapper` (`@kitconcept/volto-bm3-compat`), which adds the outer `block emblaCarousel` container with `type-*`, `align-*` and `tone-*` classes.
