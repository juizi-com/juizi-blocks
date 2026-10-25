# Shop extension

Juizi additions to `collective.shop` (its Volto add-on,
`volto-collective-shop`, registers the Buy block and the shop's pages). The
shop doesn't depend on this add-on: it looks up a registry utility
(`type: 'blockExtension'`, `name: 'shopBuy'`) when it renders and works
without it (plain Volto). On a site without the shop, the utility is never
used.

## What it adds

- **The Buy button in the Juizi group** of the block chooser, with the other
  Juizi blocks, whichever of the two add-ons loads first.
- **The site's buttons everywhere the shop draws one**: the Buy block, the
  cart, checkout, confirmation, My purchases and the floating cart button.
  The main button (Add to cart, Register, Check out, Pay now) is a solid
  button and Buy now an outlined one, in the colour every Juizi block uses
  by default (`getDefaultButton`: the first colour in the dashboard's list
  that stands out against the background). The shape follows
  `--juizi-button-radius` and `--juizi-button-border-width`, as in
  `config/buttons.scss`. Links, ticks and the chosen option use the same
  colour.
- A **Background & spacing** panel in the Buy block's sidebar, after what it
  sells: background colour and image, then top and bottom padding. Same
  fields and wording as the donation block. On a background the default
  buttons follow it (a light button on a dark background).
- A **Button colours** panel: main button, Buy now button and the chosen
  option's border, from the site's colours and button styles. Empty fields
  keep the site's usual buttons.

The block is full width (with the usual side padding) while it has a
background; its content keeps `--juizi-shop-width` (the narrow text width).

## Contract with the shop

`method()` returns:

- `schemaEnhancer({ schema, formData, intl })`: the Buy block's sidebar
  schema with the extra fields.
- `Frame({ data, isEditMode, children })`: the background around the block.
  It sets no colours: with no background and no padding it renders the
  block unchanged.
- `vars(data)`: the shop's CSS custom properties (listed in the shop's
  `frontend/src/extension.js`) as a style object. The shop sets them on the
  Buy block (with its data) and on its pages and cart button (without).
- `group`: the chooser group (`juizi`), read by the shop when it registers
  its block after this add-on. When the shop loaded first,
  `installShopExtension` moves the block into the group itself.

## Known issues

- The shop's pages (cart, checkout) always use the site's default colour;
  there's no per-page choice, by design.
- The colour list is `getBlockColorList('shopBuy')`. The Buy block isn't in
  the dashboard's block list, so it always offers every site colour.
