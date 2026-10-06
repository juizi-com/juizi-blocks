# Content Row block (`contentRow`)

A row of items in one of four display styles: numbered steps, icon items, statistics that count up, and image cards (picture behind the text or above it).

Shared parts (dashboard, colours and buttons, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

---

## Registration

Registered through the block list in `src/blocks/index.ts` (`view: ContentRowView`, `edit: ContentRowEdit`, `juiziSchema: ContentRowSchema`). The Edit is the shared `makeBlockEdit`; this block's own logic is in `index.js`: layout defaults for each style, keeping the editor's headings, text and links when the style changes, item ids for the sortable list, and naming each item in the sidebar after its heading.

`multiCard` and `iconLinkRow` blocks from earlier add-ons are converted to this block as pages load (`src/legacy/`).

## Dependencies

- `lucide-react`: icons are imported one by one in `src/config/iconChoices.js` (`lucideIconMap`), not the whole library.
- `embla-carousel-react`, `embla-carousel-autoplay`: the optional mobile carousel.

---

## First choice

The style field is `displayMode`. It was `variation` until it turned out VLT's CSS hides the fourth option of any select whose field id is `variation` (it's meant to hide Event Calendar in Listing blocks), which made "Image card" impossible to choose. Saved blocks with only `variation` are repaired as they load (`repairCurrentBlock` in `src/legacy/blocks.js`), as are plone.org's blocks saved with `iconLeft: true` (now `iconPosition: 'left'`).

Nothing else shows in the sidebar until a style is chosen; the canvas shows the shared start screen with a description of each style.

Choosing a style adds **no items**: the canvas says "No items yet. Add your first item in the sidebar under Items." (editors only; with no items and no heading, visitors see nothing). Switching style keeps the editor's own headings, text and links and adds nothing else.

## Display styles

| Key | Label | Notes |
|---|---|---|
| `numbered` | Numbered | Steps in order, each with a large number |
| `icon` | Icon | Short points, each with an icon |
| `statistics` | Statistics | Key figures that count up when they come into view |
| `card` | Image card | Cards with a picture behind the text (overlay) or above it ("Card look" → Image layout) |

## Sidebar panels

Options (display style) → Heading → **Items** → a panel named for the style (Number position / Icon position / Counting / Card look) → Layout → Background & spacing → On mobile → Advanced.

Items are named in the sidebar list after their heading (statistics: their label). There's no separate "item label" field: VLT's list widget shows `item.title`, which `index.js` fills in from the heading whenever the list changes.

---

## Icon system

The icon variation uses **Lucide React** for rendering. The icon picker in the sidebar is populated from `src/config/iconChoices.js`.

### Available Lucide icons

| Key | Label | Category |
|---|---|---|
| `Globe` | Globe | Communication |
| `Mail` | Mail | Communication |
| `Phone` | Phone | Communication |
| `MessageCircle` | Message | Communication |
| `Send` | Send | Communication |
| `Rss` | RSS | Communication |
| `Users` | People | People & organisation |
| `User` | Person | People & organisation |
| `UserCheck` | Person (verified) | People & organisation |
| `Building` | Building | People & organisation |
| `Briefcase` | Briefcase | People & organisation |
| `GraduationCap` | Education | People & organisation |
| `BookOpen` | Book | Content & media |
| `FileText` | Document | Content & media |
| `Newspaper` | News | Content & media |
| `Video` | Video | Content & media |
| `Mic` | Microphone | Content & media |
| `Link` | Link | Navigation & links |
| `ExternalLink` | External link | Navigation & links |
| `ArrowRight` | Arrow right | Navigation & links |
| `Home` | Home | Navigation & links |
| `MapPin` | Location | Navigation & links |
| `Search` | Search | Actions |
| `Download` | Download | Actions |
| `Upload` | Upload | Actions |
| `Share2` | Share | Actions |
| `Star` | Star | Actions |
| `Heart` | Heart | Actions |
| `Bookmark` | Bookmark | Actions |
| `Check` | Check | Actions |
| `BarChart2` | Chart | Data & tech |
| `TrendingUp` | Trending up | Data & tech |
| `Shield` | Shield | Data & tech |
| `Lock` | Lock | Data & tech |
| `Code` | Code | Data & tech |
| `Database` | Database | Data & tech |
| `Leaf` | Leaf | General |
| `Sun` | Sun | General |
| `Zap` | Lightning | General |
| `Award` | Award | General |
| `Flag` | Flag | General |
| `Clock` | Clock | General |
| `Calendar` | Calendar | General |
| `Settings` | Settings | General |
| `HelpCircle` | Help | General |
| `Info` | Info | General |

### Adding Lucide icons

Import the icon in `iconChoices.js`, add it to `lucideIconMap`, add its key to `lucideChoiceKeys`, and give it a name in `src/config/iconMessages.js` (then `make i18n` and translate it). The key must match the Lucide component name exactly (PascalCase), e.g. `'BookOpen'`. An icon saved on a page that isn't in `lucideIconMap` shows the fallback circle, so before removing an icon, check that no live page uses it.

### Adding custom SVG icons

Drop any `.svg` file into:

```
src/components/Blocks/ContentRow/icons/
```

The file is picked up automatically at build time via `require.context` — no other changes needed. The filename (without extension) becomes the icon key:

```
plone-logo.svg  →  key: 'plone-logo'  →  label: 'Plone Logo'
```

Custom icons appear in the editor dropdown after the Lucide icons. They go through Volto's svg-loader (any `.svg` under an `icons/` folder) and are rendered with Volto's `Icon` component.

Use `fill="currentColor"` (or `stroke="currentColor"`) in the SVG rather than a fixed colour, so the icon follows the item's text colour. Figma exports often hard-code `fill="white"`, which makes the icon invisible on a light background.

The lookup order in View.jsx is: **`lucideIconMap` → custom SVG → fallback Circle**.

---

## "View all" button position

When "Show 'View all' button" is enabled, "View all" button position controls where it sits: above the items alongside the heading (`header`, the default), or below the items grid (`below`). The header itself only reserves space for the button when its position is `header` — with position set to `below` and no other heading content, the header row doesn't render at all.

## Block padding

`paddingTop` and `paddingBottom` use the shared padding scale (root README) through `content-row--pad-*` classes. Both default to `default` (4rem), the block's previous fixed padding.

## Alignment and links

- **Heading alignment** and **Items alignment** are independent. The item buttons follow Items alignment only (left, centre or right); the block's outer wrapper also carries `align-<heading alignment>`, so button rules are scoped to the items grid.
- When a Numbered, Icon or Statistic item has a link, the whole item content is wrapped in one `<a>`, made a flex container that copies the item's own layout, so a linked item looks the same as an unlinked one (a linked statistic's value centres like its label).
- Item links follow the item's text colour and have no underline; links inside an item's rich-text description stay underlined (shared link rules).

## Mobile carousel

When "Carousel on mobile" is enabled, items become a horizontally scrollable Embla carousel on small screens. The grid layout is restored on desktop. Autoplay is automatically disabled for users who have enabled reduced motion in their OS settings.

---

## Accessibility

Section, heading and link structure follow the shared conventions (root README). Specific to this block:

### Headings

The block heading (`headerText`) is `<h2>`, item headings `<h3>`; `<h1>` isn't available (always mid-page content). Use `<h4>` and below inside an item's rich text.

### Numbered variation — decorative numbers

The large step numbers are rendered as `aria-hidden="true"` `<div>` elements, not heading tags. This is intentional: the numbers are decorative sequencing, not structural headings. Rendering them as `<h2>` alongside the block's own `<h2>` heading would pollute the heading outline and confuse screen reader navigation. The step heading inside each item (`<h3>`) carries the semantic weight.

The `numberHeadingLevel` field that previously allowed choosing h1/h2/h3 for numbers has been removed for this reason.

Numbered items carry the same `iconCircleColor` field as icon items (labelled "Number circle colour" in the sidebar). Setting it places the number inside a coloured circle, matching the icon variation's circle treatment. Leave it on "None" to keep the plain faded number.

### Statistics variation — screen reader announcement

The count-up animation is hidden from screen readers (`aria-hidden="true"` on the animated span). A visually-hidden `<span>` containing the final formatted value is announced instead — for example "1k+ People supported" — giving a clean single reading rather than a stream of intermediate numbers.

The `label` field in each statistic item is also `aria-hidden` in the visual display, since it is included in the visually-hidden combined announcement. It remains visible on screen.

The count-up animation is skipped entirely for users who have enabled reduced motion in their OS settings. The final value is shown immediately instead.

### Icon variation

Icons are `aria-hidden="true"` — they are decorative. The item heading and description carry the meaning. Every icon item should have a heading; an icon with no heading and no text produces a visually meaningful but semantically empty item.

### Image cards

Background images in the overlay card style are applied as CSS `background-image` on an `aria-hidden` div — they are decorative. Meaningful content belongs in the heading and description fields.

In the image-above style, the card image uses the item heading as its `alt` text. If the heading is empty, the image is treated as decorative (`alt=""`). Add a heading to every card that has a meaningful image.

### Mobile carousel

Carousel dot buttons have `aria-label="Go to slide N"`. The carousel wrapper has `role="region"` and `aria-label="Content carousel"`, making it a named landmark. Autoplay is disabled when the user has requested reduced motion.

---

## Known implementation notes

### `anchorId` uniqueness

The wrapper `id` is derived from `headerText`. A short block-id suffix (first 6 characters) is added only where Volto passes `props.block`, which is the editor; the published page passes `id` instead, so live anchors are the plain heading slug. That's kept as it is so existing same-page links keep working, but it means **two Content Rows with the same heading on one published page get the same anchor id**. Changing it would break links to those anchors; if it's changed, do it together with a check of the links on live sites. (The heading's own `id`, used by `aria-labelledby`, is separate.)

### `headerText` rendering

`headerText` is a plain string field rendered via `safeString()`, not `dangerouslySetInnerHTML`. If you need rich text in the block heading, switch the field to a `richtext` widget and update the render accordingly.

---

## Happy path — draft, confirm in first-time editor test

1. Add a **Content Row**. The canvas lists the four styles.
2. Under **Options**, choose a **Display style**, e.g. **Icon**. The canvas says there are no items yet.
3. Under **Heading**, type a heading ("How we help").
4. Under **Items**, add an item: pick an icon, type a heading and description. Repeat.
5. Optionally set the columns under **Layout** and a colour under **Background & spacing**.
6. Publish.

## Decisions and trade-offs (2026-09 audit)

- Style field renamed `variation` → `displayMode`, with a repair for saved blocks (CR1).
- No example items are seeded (CR2); the start screen matches the dropdown (CR3).
- Items come second in the sidebar (CR4).
- Column widths keep their stored keys; `'60-30'` is labelled "two thirds / one third", which is what it always did, since the values are flex ratios (CR7).
- Counting speed is Quick / Normal / Slow; unusual saved values show as "Custom (…)" (CR8).
- Statistics render the real number on the server and count up once in view (CR11).
- Image cards with a link but no button style used to wrap the whole card in a link around the button link; now the button is the one real link and a mouse-only cover link (hidden from screen readers and the keyboard) makes the card clickable.
- Numbers are formatted for the site's language; British English for English, e.g. "1,000".
- The block renders inside `BlockWrapper` (`@kitconcept/volto-bm3-compat`), which adds the outer `block contentRow` container with `type-*`, `align-*` and `tone-*` classes.
- The anchor id for same-page links is unchanged.
