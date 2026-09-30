# Hero block (`juiziHero`)

A page header or a themed content band, in one block. It replaces the older `customHero` and `buttonRow` blocks, which the legacy content transform converts as pages load (`src/legacy/`, keeping their original data under `legacyData`; see `COMPATIBILITY.md`).

Shared parts (dashboard, colours and buttons, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

## Display styles

The editor chooses one first:

- **Hero** — a full-width page header with background image or video, the page title and description, breadcrumbs, logo, and buttons or buttons to each heading on the page.
- **Section** — a themed content band inside the page with its own heading, description, a solid background colour (or image) and buttons.

## Registration

Listed in `src/blocks/index.ts` (`view: HeroView`, `edit: HeroEdit`, `juiziSchema: HeroSchema`). The Edit is the shared `makeBlockEdit`; this block's own logic (first-choice defaults, side-image seeding, button labels) is in `index.js`.

## First choice

On the first choice, `index.js` seeds defaults (never overwriting data):

- **Hero** → uses the page title and description; primary page heading on.
- **Section** → its own heading: "Use page title" and "Use page description" off, so the Title and Description fields show straight away. Until a heading is typed, the canvas shows "Add a heading in the sidebar." (editors only).

Saved Section bands without `usePageTitle` keep showing the page title (unset still means "use it"), so live pages don't change.

## Sidebar

| Panel | Fields |
|---|---|
| Options | Display style |
| Content | Use page title → Title, Use page description → Description, Text above the title, Show publication date, Show event details, Logo (Hero only), Show breadcrumbs |
| Background | Hero: Use page preview image, image, video, position, overlay. Section: colour, image, position, overlay |
| Side image | Image, and once set: alt text, vertical alignment, on mobile |
| Buttons | Buttons display, then buttons (or heading options), Use smaller buttons |
| Layout | Text alignment, side-by-side, top/bottom padding (shared padding scale), full width |
| Advanced | Primary page heading, hide title visually, extra style name |

## Text above the title: publication date / event details

Two switches under Content can fill the "Text above the title" line:

- `showPublicationDate` — for news items: the item's `effective` date, e.g. "15 January 2024".
- `showEventDetails` — for Event items: `start`/`end` and `location`, e.g. "13 - 14 Nov 2024 | Cape Town" or "13 Nov - 25 Dec 2024 | Cape Town". A single date when there's no end date, it's open-ended, or it starts and ends the same day. The location only when the item has one.

Both work in every mode and do nothing on an item without the underlying field. A typed preheader always wins; with both switches on, event details win.

## Buttons

| Buttons display | Behaviour |
|---|---|
| `buttons` | Per-button label, link, style and arrow |
| `list` | The same buttons as inline links separated by vertical bars |
| `toc` | "Buttons to each heading on this page": generated from the page's main headings and sub-headings (H2/H3), styled by `tocButtonStyle` |

- A button with no label uses its linked page's title (`autoFillButtonLabels` in `index.js`).
- A button without a link (or any text) is never shown to visitors. Editors see it flagged ("Add a link" / "Add a label", dashed outline) **only while the Hero has nothing else in it** (no heading, text or finished button): otherwise the prompt read as a request to add something the editor may not want.
- **Use smaller buttons** adds the shared `btn-small` size (`config/buttons.scss`) to every button, including TOC buttons.
- TOC buttons take their label from the heading text, so headings need to be descriptive; a heading like "Overview" used twice gives two identical buttons.

## Background

**Hero style:** image or video at `z-index: 0`, an overlay at `z-index: 1` (the one intentional inline colour: `overlayStyle` maps to an `rgba()` over the image). Overlays: Gradient (default), None, Black/White/Brand colour at 30/50/70%. Text is white over an image or video (`hero-block--has-bg`). The gradient gives roughly 3:1 where text usually sits, depending on the image; a 50% or 70% black overlay is safer. Background video is Hero-only; background image works in both styles.

**Section style:** `backgroundColor` from the colour list, applied inline with its text colour, plus `.bg-dark` / `.bg-light`. The background colour still sets the text colour when a background image is added on top, and the field's help text says so once there's an image: a dark colour gives light text, a light colour dark text. With "None", text stays dark over the image.

## Primary page heading and the page's own title

**Primary page heading** (`isPrimaryHeading`, Advanced) makes the title an `<h1>` (otherwise `<h2>`), and hides the page's own title and publication date, since the Hero now provides them. Default: on for Hero, off for Section. One per page: a Hero marked as the primary heading warns in the editor when another Hero on the page is too ("Another block is already the main heading for this page…").

The hiding is CSS on the Hero's own modifier, so it's right in server-rendered HTML, works for any number of Heroes and cleans up by itself (browsers from late 2023 onwards):

```css
body:has(.hero-block--primary-heading) .documentFirstHeading { display: none; }
body:has(.hero-block--has-breadcrumbs) .breadcrumbs { display: none; }
```

This replaced `<body>` classes set during render (`has-hero-primary-heading`, `has-hero-breadcrumbs`). **Site themes that targeted the old body classes need the new selectors.**

**In the editor**, hiding the Title block's text left what looked like an empty block. There the page title shows faded (40%) instead, with a note above it: "This title is hidden on the page because a Hero block is set as the primary page heading. To show it again, untick “This is the primary page heading” in the Hero block’s Advanced settings." The note is drawn by CSS on `#page-edit` / `#page-add`; its words are the message `titleHiddenNote`, which the Hero hands to the stylesheet as `--juizi-hero-title-note` in the editor's language.

Only rely on the Hero's `<h1>` when it actually renders a title (page title or a typed one). Don't add `role="banner"`: Volto already renders the site header, and `<section>` + `<h1>` gives the right structure without the collision.

**Hide title visually** (`hideTitle`) keeps the title in the outline for screen readers and search engines (`visually-hidden`), for designs that don't need a visible heading. Never `display: none` for this.

## Breadcrumbs

`<nav aria-label="Breadcrumb">`; the current page is a `<span aria-current="page">`, not a link; separators are `aria-hidden`. With **Show breadcrumbs** on, the wrapper gets `hero-block--has-breadcrumbs` and the page's own breadcrumbs are hidden (above); make sure that selector matches the theme's breadcrumb container.

- Crumbs follow the block's text colour, underlined on hover only (shared link rules).
- The current page crumb is hidden visually by default (it's in the page title already). Restore it with `.hero-breadcrumbs [aria-current="page"] { display: inline; }`.
- The whole trail is hidden when it's only Home → this page (`data-depth="2"`). Restore it with `.hero-breadcrumbs[data-depth="2"] { display: flex; }`.

## Background media and motion

Background images, videos and overlays are `aria-hidden`. Videos carry `data-reducemotion="pause"` and pause for visitors who ask for less motion.

## Happy path — draft, confirm in first-time editor test

1. Add a **Hero** block at the top of the page. The canvas lists the two display styles.
2. Under **Options**, choose **Hero (page header)**. The page's title and description appear.
3. Under **Background**, pick a background image (or switch on **Use page preview image**).
4. Under **Buttons**, add a button: choose its link; the label fills in from the linked page.
5. Publish. The page's own title isn't shown twice.

For a band further down the page: add a Hero, choose **Section (content band)**, type the **Title** and **Description**, pick a **Background colour**, add buttons, publish.

## Decisions and trade-offs (2026-09 audit)

- Section bands use their own heading by default; saved ones keep today's behaviour (H1).
- Page title/breadcrumb hiding moved to CSS `:has()`; site themes need the new selectors (H2).
- Dates in the site's language; British English for English, e.g. "13 November 2024" (H6).
- Unfinished buttons are hidden from visitors and flagged for editors (H7), only while the Hero is otherwise empty.
- Alignment is a Left / Centre / Right choice, not icon buttons (X10).
- Renders inside `BlockWrapper`: the outer `block juiziHero` container carries `type-*`, `align-*` and `tone-*`; `hero-block` itself no longer carries `block` (S5/S7).
- The anchor id for same-page links is unchanged (the heading's slug on the published page).
- No `<h3>` or deeper heading option: the block defines sections; sub-headings belong in the body content.

## Known issues

- The TOC mode finds headings by climbing the DOM from the block (`useBlockLayoutHeadingTOC`); in unusual layouts it can fall back to the whole page.
