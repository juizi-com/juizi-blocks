# Shared block code (`_shared/`)

Code every Juizi block uses: the start screen (`BlockPlaceholder`), edit-only hints (`EditHint`), the error boundary, `BlockWrapper`, the mobile carousel (`MobileCarousel`), rich text display (`RichText`), the shared messages and `translator` (`messages.js`, `i18n.js`), and the link, image, choice, format, anchor and item helpers. `RichText.jsx` also has `plainTextToRichText`, which lets a plain-text field move to the rich-text widget without losing saved text. Image overlays are in `config/gradients.ts`.

It's documented with everything else the blocks share in the repository's root `README.md`, under **Shared block toolkit** and **Conventions every block follows**.

## Accessibility helpers

- **`headingLevel.js`**: heading levels that never skip one, without changing how pages look. Blocks keep their tags (title `<h2>`, items `<h3>`) and add `aria-level` only where the tag would skip a level after the page's previous heading, worked out from the page's saved blocks (`properties`), so server and browser agree. `headingLevels(properties, blockId, { hasTitle })` gives `{ title, item }`; `levelAttrs(level, tagLevel)` gives the attribute (or nothing). Item components deep in a block read theirs from `ItemHeadingContext` / `useItemHeadingAttrs()`. Blocks nested in a grid aren't found and keep their tags. Used by Content row, Carousel and Data visualisation. Pricing tiers already uses `<h2>` tier names when it has no title.
- **`AutoplayToggle.jsx`**: the stop / start button for anything that moves on its own (WCAG 2.2.2), with `useAutoplayToggle(emblaApi)`. It renders nothing when autoplay is off or reduced motion is on.
- **`MobileCarousel`** is a named `group` with `aria-roledescription="carousel"` (not a second landmark: the block around it is one, often with the same name). Its slides say "slide, 2 of 5", its dots use `aria-current` and have 24px tap areas, and with autoplay it shows the `AutoplayToggle`.
- **`canDimText(colour, opacity)`** (`config/colors.js`): whether secondary text dimmed to `opacity` still meets 4.5:1 on a background colour. The Hero shows its preheader and breadcrumbs solid where it doesn't.
