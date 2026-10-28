# Pricing tiers block (`pricingTiers`)

Price cards side by side: each tier has a name, an optional tag ("New", "Most chosen"), a price, a price note, a description, a list of features and a button. Optional title and description above the cards, and small print below them.

Shared parts (dashboard, colours, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

The block stands on its own: it doesn't depend on the membership tool or any other add-on, and works with and without Volto Light Theme.

## Registration

Defined in `index.js` and listed in `src/blocks/index.ts`. The Edit is the shared `makeBlockEdit` (`normalizeData` gives tiers ids and names them in the sidebar list after the tier name; `getFormData` shows the mobile options ticked when they've never been set). The schema is registered as `juiziSchema`. `usesColors: true` puts it in the dashboard's "Colours per block" table.

Uses the shared `MobileCarousel` and `RichText` (`_shared/`), also used by the Content Row.

## What the editor sees

| State | Editor | Visitor |
| --- | --- | --- |
| No tiers yet | the title and description if typed, and a start prompt: add your first tier under **Tiers** | nothing |
| A tier without a name | the card, outlined (`block__unfinished`), with "Add a tier name. Visitors won't see this tier until it has one." | the tier is left out |
| Button text without a link, or a link without text | the button, outlined, with "Add a link" or "Add button text" | the button is left out |
| Error | the shared error message (`BlockErrorBoundary`) | nothing |

There is no display style to choose: the block does one thing, so the first thing the editor does is add a tier.

## Sidebar

The panels follow the canvas from top to bottom.

1. **Heading**: **Title** (an `h2`, names the section through `aria-labelledby`) and **Description** (rich text).
2. **Tiers**: the list of tiers (drag to reorder, "+ Tier" to add). Each tier: **Tier name**, **Tag**, **Price**, **Price note**, **Description** (rich text), **Features** (rich text), **Button text**, **Button link**, **Button style**, **Card colour for this tier**, **Tag colour for this tier**. Under the list, once a tier has a name: **Highlighted tier** (None, or one of the named tiers).
3. **Below the tiers**: **Small print** (rich text).
4. **Card colours**: **Card colour**, **Tag colour** and **Button style** for all tiers.
5. **Layout**: **Cards in a row on large screens** (2 to 5, 4 when empty).
6. **Background & spacing**: **Background colour** (with a real "None"), **Top padding**, **Bottom padding** (Default when empty).
7. **On mobile**: **Swipe through the tiers on phones** (on unless switched off), then, while it's on: **Start on the highlighted tier** (only once a tier is highlighted), **Autoplay** (hidden while starting on the highlighted tier), **Arrows** (None, Above the cards, On each side in the middle, Below the cards), **Arrow style** (once there are arrows: Standard, or a colour from the button list) and **Show dots under the cards**.
8. **Advanced**: **Extra style name (for your web team)**.

No field has a schema default.

## How it looks

- **Cards in a row:** the chosen number from 992px, two in a row from 769px, one below that (or the carousel). Extra tiers start a new row. Cards in a row are the same height and their buttons line up along the bottom (the features grow to fill the space).
- **Order on a card:** tag and name, price and price note, description, a line, features, button. The tag sits above the name by default; a site theme can put it beside the name (see the comment at `.juizi-pricing__tier-head` in `style.css`).
- **Price:** free text, so "R 49 450", "R 950 / year" and "Let's scope it" all work. A price with no digits is shown a size smaller (`juizi-pricing__price--words`).
- **Features:** a plain list without bullets, one line each, whether the editor types lines or a bulleted list.
- **Highlighted tier:** a little taller than the others and in front of them, with the class `juizi-pricing__tier--highlighted` for themes. Its colours are its own settings (give it a card colour and a button style). In the mobile carousel, where only one card shows, it isn't taller.
- **Colours:** a card without a colour is a plain card (`juizi-pricing__tier--plain`, white by default). With a colour, the text follows it (`bg-dark` / `bg-light`, `getColorTextStyle`). A tier's own card colour or tag colour replaces the one for all tiers.
- **Buttons:** fill the card's width, except "Text only". The style is the tier's own, else (on a tier with its own card colour) an outlined button that stands out against that colour, else the style for all tiers, else an outlined button that stands out against the card colour for all tiers. Nothing is stored until the editor picks a style, so changing a card colour never leaves a button behind that no longer shows up.
- **Mobile carousel:** one whole card at a time, without a shadow (the carousel's viewport would clip it to a hard edge), loops, optional dots and autoplay (never with reduced motion), equal card heights. Themes that give cards a shadow scope it to `.juizi-pricing__grid`.
- **Start on the highlighted tier:** phones open the carousel on the highlighted tier rather than the first one, and autoplay is off (the field is hidden and a saved autoplay is ignored), so visitors stay on it. If the highlighted tier is removed or cleared, the carousel starts on the first card and autoplay works as set.
- **Arrows (phones):** previous / next buttons above, below, or one on each side of the card. On each side they have columns of their own, so the card narrows to make room and they never cover its text. Standard arrows are outlined in the text colour; a colour gives them that button's look. None with a single tier.

Everything visual is a token in `theme/juizi-common.scss` (`--juizi-pricing-*`: card background, outline, padding, gap, how much taller the highlighted tier is, tag colours, price sizes, the line's colour, small print size, slide width). The block is in the shared lists there, so it gets the two layers (full-width band, centred content), padding classes, title/description/item type, card corners and shadow (`--juizi-card-radius`, `--juizi-card-shadow`) and the no-VLT layout.

## Classes

| Class | What |
| --- | --- |
| `juizi-pricing` | the section (outer layer); `--mobile-carousel`, `--pad-top-*`, `--pad-bottom-*`, `bg-*`, plus the Extra style name |
| `juizi-pricing__inner` | the centred content |
| `juizi-pricing__header`, `__title`, `__description` | above the cards |
| `juizi-pricing__grid`, `__grid--columns-{2-5}` | the cards on larger screens |
| `juizi-pricing__tier` | a card; `--plain`, `--highlighted`, `bg-dark` / `bg-light` |
| `juizi-pricing__tier-head`, `__label`, `__name` | tag and name |
| `juizi-pricing__price-wrap`, `__price`, `__price--words`, `__price-note` | the price |
| `juizi-pricing__tier-description`, `__features`, `__action` | the rest of the card |
| `juizi-pricing__disclaimer` | the small print |
| `juizi-pricing__embla…` | the mobile carousel (`MobileCarousel`) |
| `pricing-button` | the button (with `btn-unified` classes from `getButtonClasses`) |

## Accessibility

- A `<section>`, named by the title when there is one.
- With a title, tier names are `h3`; **without one they're `h2`**, so the page doesn't skip a level (on juizi.com the cards sit right under the page's opening band, with no title of their own). This differs from the convention that item headings are `h3`.
- The tag comes before the name in the page, so screen readers hear "Most chosen, Popular". The highlighted tier is marked only visually: say it in the tag if it matters.
- The carousel is a labelled region (the block's title, else "Pricing tiers") with labelled dot buttons; the grid and the carousel are both in the page, and CSS hides the one not in use, so only one is ever read.

## Happy path (draft, confirm in first-time editor test)

1. Add the block from the Juizi group in the block chooser. The canvas says to add a first tier under **Tiers** in the sidebar.
2. Click **+ Tier**. Type the tier name, price and price note; add a description and the features, one per line; add button text and choose the button's page.
3. Repeat for each tier. Drag tiers to change their order.
4. Optional: pick the **Highlighted tier** and give that tier its own card colour and button style so it stands out.
5. Optional: a title and description above, small print below.
6. Save. Check the page on a phone: swipe through the cards.

Hesitation points found in a walk-through (for the first-time editor test to confirm):

- The per-tier colour fields sit at the bottom of each tier's form; an editor looking for "how do I make one card green" may look under **Card colours** first. Its help text says each tier can have its own colour.
- The highlighted tier only gets taller: an editor may expect it to change colour too. The field's help says to give it its own card colour.
- **Highlighted tier** appears only once a tier has a name.

## Site-specific looks

A site theme can target the block's classes. juizi.com (`volto-juizi2026`) puts the tag beside the name and lifts the cards into the band above with the Extra style name `overlap-hero`; that's site CSS, not a block option, so other sites aren't affected. juizi.vlt.pretty has its own styling in `theme/_juizi-blocks.scss`.

## Saved content

A new block: no older content or legacy conversion to protect. Moving the Content Row's carousel and rich text renderer to `_shared/` keeps its markup and class names exactly as they were (`ContentRow.test.jsx` passes unchanged).
