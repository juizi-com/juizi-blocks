# Gallery block (`emblaGallery`)

Pictures from the current page or from across the site, as a slideshow, an even grid or a natural grid, with an optional enlarged view. Sibling to the Carousel, built on the same conventions. Deliberately smaller in scope: no per-picture manual entry — every picture comes from the current page or a content query.

Shared parts (dashboard, colours and buttons, shared styling and tokens, links, the block toolkit, the carousel-style controls it shares with the Carousel, and the conventions every block follows) are in the repository's root `README.md`.

---

## Registration

Registered through the block list in `src/blocks/index.ts` (`view: EmblaGalleryView`, `edit: EmblaGalleryEdit`, `juiziSchema: emblaGallerySchema`). The Edit is the shared `makeBlockEdit`; first-choice defaults are in `index.js`.

## Dependencies

`embla-carousel-react` and `embla-carousel-autoplay` for the slideshow. The grids are plain CSS grid / CSS columns.

---

## Display styles

Stored values are unchanged; the labels are what editors see.

| Value | Label | Description |
|---|---|---|
| `carousel` | Slideshow | One large picture at a time, with small pictures underneath to click through (see `carouselStyle` below) |
| `blocks` | Even grid | Pictures in neat rows, all cropped to the same size |
| `masonry` | Natural grid | Pictures keep their own shape and fit together in columns; one column on phones so they stay in order |

`carouselStyle` (carousel mode only):
- `featured` ("Large picture with small pictures below") — large image with a synced thumbnail strip below it (clicking a thumbnail scrolls the main image; clicking the main image opens the lightbox)
- `strip` ("Row of small pictures only") — thumbnails only, no featured image; clicking any thumbnail opens the lightbox directly

The thumbnail strip is a second, independent `useEmblaCarousel` instance
(`thumbViewportRef`/`thumbEmbla` in `View.jsx`), not a plain `overflow-x`
row — this was a late change: an early version used native scroll with
`scroll-snap`, but the native scrollbar looked out of place directly under
a smooth Embla carousel. In `featured` style the two instances are synced
one-way (main carousel's `select` event calls `thumbEmbla.scrollTo(idx)`);
clicking a thumbnail still drives the main carousel via `embla.scrollTo`.
In `strip` style there's no main carousel to sync with — the thumbnail
Embla instance is the carousel, complete with its own prev/next arrows and
autoplay (the main viewport hook stays mounted per the rules of hooks, it
just renders nothing).

`strip` style also sizes images considerably larger than the `featured`
thumbnail row — `thumbnailHeight` (default 90px, always shown once carousel
mode is selected) sets a height and lets each image's own aspect ratio
decide its width, rather than cropping to a fixed box. The same field
drives both carousel styles: bump it up for `strip`'s large-image feel, or
leave it small for a conventional `featured` thumbnail row. Capped at
`min(height, 60vh)` (`40vh` under 540px) so an oversized value doesn't take
over small screens. Requested image resolution scales with it too, so a
large value isn't served a stretched 160px scale.

`activeThumbColor` (shown only for `featured` style, since `strip` has no
persistent "current" thumbnail) sets the border colour on whichever
thumbnail matches the large image currently shown.

### Arrows, row alignment and hover

Arrows follow the shared carousel-style controls (root README). Gallery specifics:

- **Arrow position** (`arrowPosition`, Slideshow behaviour): `sides` (default, over the large picture or the ends of the row) or `below`. **Arrow style** (`arrowStyle`) sits beside it and also styles the enlarged view's buttons; both are hidden while "Hide arrows" is on. A picked colour makes them unified buttons (`btn-unified`): the same colours and hover as every other button, at their own square size.
- One `renderArrows(api)` in `View.jsx` draws them for the large picture (`embla`) and for the `strip` row (`thumbEmbla`), inside that part's own wrapper so "sides" centres on it.
- `View.jsx` measures whether the row of small pictures is wider than the block (`thumbsOverflow`, again as each small picture loads and on resize). In `strip` style the arrows only show when it is.
- While the row fits, **Small pictures alignment** (`rowAlignment`: left (default), centre, right) places it.
- On larger screens with a mouse, pictures zoom slightly inside their frame on hover (`scale(1.05)`) as a cue that they can be clicked: grid pictures, the large picture and the small pictures. Not on touch, not with reduced motion. Small pictures have rounded frames so the zoom and the "current picture" highlight stay inside the corners.

### Heading and intro text

Both follow the block's text colour (`tone-*`, or the background colour's own text colour), so they always match.

As with EmblaCarousel, nothing else appears in the sidebar until a display
style is chosen. No `displayMode` set → placeholder in edit mode, `null` in
view mode.

---

## Image source

`sourceMode` — default `context`, pulls images (and Link items with a
linked preview image) from the current page's direct children via
`searchContent` with `path.depth: 1`. `contextItemTypes` controls which
content types count (`Image`, `Link`, or both).

`sourceMode: 'query'` reuses EmblaCarousel's listing-mode query transform
practically verbatim, including the two-step `resolveuid` path resolution
for queries built against a specific folder. One simplification versus the
carousel: the query transform here passes every non-path criterion straight
through as `{ [criterion.i]: criterion.v }` rather than routing it through
EmblaCarousel's `keyMap` — fine for the portal_type/Subject/review_state
criteria a plain image query typically uses, but worth widening if a more
exotic query index turns up in practice.

---

## Lightbox

`Lightbox.jsx` is a single component shared across all three display modes,
mounted once per gallery block and rendered via `ReactDOM.createPortal` to
`document.body` so it sits above whatever stacking context the block is in.

- Keyboard: `Esc` closes, `←`/`→` navigate
- Touch: swipe left/right navigates (50px threshold)
- Focus: moves to the close button on open, returns to the triggering
  thumbnail/grid item on close — same pattern screen-reader users get from
  the carousel's clickable-slide handling
- Background scroll is locked while open (`document.body.style.overflow`)

`enableLightbox` (default on) can be switched off, in which case clicking an
image opens its own page in a new tab instead (a link with
`target="_blank"`; the thumbnail strip opens it with `window.open`).

`showCaptionOnItem` and `showCaptionInLightbox` are separate toggles —
one for the caption shown on the thumbnail/grid item itself, one for the
caption shown in the lightbox — rather than a single field driving both,
since a site may well want a caption on hover in the grid but a cleaner
lightbox, or the reverse.

---

## Known simplifications / open follow-ups

- **Image resolvers** are shared with the Carousel in `_shared/images.js`
  (they used to be copied between the two).
- **Masonry accessibility trade-off.** CSS-column masonry reflows top-to-
  bottom per column, which doesn't match visual reading order once there's
  more than one column. Accepted for desktop; one column across
  the whole phone range (768px and below) so small-screen and keyboard
  users aren't affected; the "Columns on phones" field is hidden for
  Natural grids.
- **No manual "pick individual images" mode.** Only `context` and `query`
  sourcing exist, per the brief. If a future site needs to hand-pick a
  gallery from images scattered across the site rather than one folder or
  query, that's a third `sourceMode` (`manual`) with an `object_list` of
  images — same shape as EmblaCarousel's `slides` field, minus the
  scaffolding around it being blocked by the (now resolved) React
  dual-instance issue.

---

## States

- **No style chosen:** the shared start screen (editors only).
- **Loading:** a skeleton in the chosen layout, for editors and visitors (`_shared/skeleton.css`); the block is `aria-busy`.
- **Nothing found:** editors see "No pictures found. Add some to this page, or choose a different image source in the sidebar."; visitors see nothing at all.
- **Error:** the shared `BlockErrorBoundary` (editor message; nothing for visitors).

## Happy path — draft, confirm in first-time editor test

1. Upload pictures into the page (or have them somewhere on the site).
2. Add a **Gallery**. The canvas lists the three styles.
3. Under **Content**, choose a **Display style**, e.g. **Even grid**. The page's pictures appear.
4. Optionally add a **Heading**, or choose **Pictures from across the site** and set **Which pictures to show**.
5. Publish. Clicking a picture enlarges it.

## Decisions and trade-offs (2026-09 audit)

- Plain labels and descriptions; stored values unchanged (G1). The "Equal height images" switch was removed: Even grids crop to the same size; saved grids with it off still render uncropped.
- Loading skeleton, and nothing for visitors when there are no pictures (G2).
- The highlight around the current picture comes from the site's colours only, defaulting to one that contrasts with the background; saved `#ffffff` keeps rendering and shows as "White, earlier setting" (G3).
- Natural grids use one column across the whole phone range (768px and below), and the "Columns on phones" field is hidden for them (G4). Saved natural grids show one column between 541px and 768px wide, where they used to show two.
- Pictures open the enlarged view through real `<button>`s, or are real links when the enlarged view is off (G5).
- Text colour follows the background colour; there's no text-colour field (C4, G6).
- The block renders inside `BlockWrapper` (`@kitconcept/volto-bm3-compat`), which adds the outer `block emblaGallery` container with `type-*`, `align-*` and `tone-*` classes; `gallery` itself no longer carries `block`.
- Image helpers are shared with the Carousel (`_shared/images.js`).
