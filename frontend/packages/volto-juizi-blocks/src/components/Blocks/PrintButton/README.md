# Print button block (`printReport`)

A button visitors click to print the page. The printout has the site's
header and footer, is laid out for the site's paper, and leaves out the site
menus, header, footer and the kinds of blocks chosen in the dashboard.

The block id is `printReport`, the id of the Print Report block built for CRA
(`volto-crasa`), so pages that already have one show this block without being
edited. Those blocks have no fields, so they use the site's settings.

Shared parts are in the repository's root `README.md`.

## Registration

In the block list (`src/blocks/index.ts`): `edit: makeBlockEdit(View)`,
`juiziSchema: printButtonSchema`, `sidebarTab: 1`, `usesColors: true` (its
button colours can be narrowed in Colours per block).

## Two places to set it up

**On the block (sidebar):** all optional; empty follows the site.

- **Button text** (`label`): "Print" when empty.
- **Button style** (`buttonStyle`): the site's colours, solid or outlined.
  Empty: the site's print button style.
- **Position** (`align`): Left / Centre / Right. Empty: right. Right floats
  the button beside the text that follows it (as CRA's did); left and centre
  give it its own line. In the editor a right-hand button doesn't float, so
  the block keeps its height and can be selected.

**For the whole site (Site Setup › Juizi Blocks › Print, `print_config`):**

| Setting | Stored as | Default |
| --- | --- | --- |
| Print button | `button_style` | `''`: automatic, `getDefaultButton()` (outlined, stands out against a light page) |
| Logo | `logo`, `logo_url` | `site`: the site logo (`plone.site_logo`); `custom`: a picture's address (a site path or https:// address); `none` |
| First line (in bold), Second line | `heading`, `subheading` | `[section]`, `[publication date]` |
| Bottom of the printout | `footer` | `Printed from [site name] on [today]` |
| Paper size, Orientation | `paper_size`, `orientation` | `A4`, `portrait` (A4, A3, A5, Letter, Legal) |
| Left out of the printout | `exclude_blocks` | `video`, `maps` |
| Advanced: custom layout | `header_html`, `footer_html` | empty |

Placeholders, typed in square brackets (`print.js`, `PLACEHOLDERS`):
`[title]`, `[section]` (the section one level below the main menu, from the
breadcrumbs: "Risk Alert" for `/products/risk-alert/…`; the main menu
section for pages higher up), `[publication date]`, `[today]`, `[site name]`,
`[page address]`. The custom HTML also has `[logo]` (the logo's address).
Values are escaped; unknown brackets are left as typed. Dates are formatted
in the page's language (en-GB for English: "26 October 2026").

The backend validates the settings (`juizi.blocks.settings.
validate_print_config`); missing keys take the defaults (also mirrored in
`settings/constants.ts`), so a backend without the record (before upgrade
step 1004) serves defaults and the block still works.

The print settings travel with the dashboard's Export and import tab (part
*Print settings*), so a printout set up on one site can be copied to another.

## How printing works (`print.js`)

The browser's own print on the page itself, not a copy in a frame (CRA's
block used `react-to-print`): the site's styles apply, and no extra
dependency. On click:

1. The header and footer are added around `#page-document` (else `main`),
   and a `<style>` sets `@page` (paper, orientation, 15mm margins) and hides
   the left-out block types (`.block.<type>`).
2. Everything beside the content and beside each of its containers, up to
   `<body>`, is marked `data-juizi-print-hidden` (site header, menus,
   breadcrumbs, footer, toolbar), and `<html>` gets `juizi-printing`. Only
   print styles use these, so the screen doesn't change.
3. Pictures waiting to scroll into view are loaded (up to 5 seconds).
4. `window.print()`. On `afterprint` (or after a minute, if the browser never
   says), everything is put back.

Printing from the browser's menu instead prints the page as it is, without
the print button.

**Custom HTML** is written by site managers (the settings service is Manager
only), but shown to everyone who prints, so it's cleaned before use
(`cleanHtml`): no scripts, frames, objects, forms, `on…` attributes or
`javascript:` / `data:` links (pictures may use `data:image/`).

## What people see

| Who | What they see |
| --- | --- |
| Editor (canvas) | The button as visitors see it, on its own line (a right-hand button doesn't float in the editor, where the float left the block 0px tall under the next block), and a hint saying what it does and where the printout is set up. Clicking it does nothing (it would print the edit form) |
| Visitor | The button; while the page is prepared it shows "Preparing…" with a spinner |
| Anyone printing | The button never prints |

## Happy path — draft, confirm in first-time editor test

1. Add a **Print button** block where the button should appear (usually
   just under the title).
2. Optionally change the button's text, style or position in the sidebar.
3. Save. Clicking the button on the published page opens the print dialog
   with the site's header and footer.
4. A site manager sets the printout up once in Site Setup › Juizi Blocks ›
   Print.

## Decisions and trade-offs

- **Header and footer are fields with placeholders**, with custom HTML only
  under Advanced "for your web team" (2026-11-03): a missing closing tag in
  raw HTML would break every printout with no warning.
- **Report name from the section** (`[section]`) instead of CRA's list of
  paths in code: works on any site with no setup.
- **Another logo is an address, not an upload:** the dashboard stores
  settings, not files. Upload the picture to the site, then use its address.
- **The label stays visible on phones** (CRA's block showed only the icon on
  narrow screens).
- Text blocks (`slate`), titles and descriptions can't be left out: they
  aren't wrapped in a `.block` element on the page.

## Known issues

- Two kinds of block with the same name (Volto Light Theme's Hero and
  Juizi's) are told apart in the dashboard by their internal name.
- A block type that renders without a `.block.<type>` wrapper can't be left
  out by the setting.
