# Membership sign-up block extension

Juizi additions to the membership sign-up block from
`volto-collective-membership` (collective.membership). The block doesn't
depend on this add-on: it looks up a registry utility
(`type: 'blockExtension'`, `name: 'membershipSignup'`) when it renders and
works without it. On a site without the block, the utility is never used.

It's the donation block extension's twin (`../donationBlock`): both use the
shared background panel and frame in `../_shared`.

## What it adds

- A **Background** panel in the sidebar, after the layout and text panels:
  background colour (from the site's colour list), background image, and,
  once an image is set, its position and overlay. Same fields and wording as
  the Content Row's background.
- A **Form colours** panel: the border around the chosen plan (and the
  "who is it for" choice), and the main button's style (Sign up). Empty
  fields keep the site theme's colours.
- `Frame`: renders the background around the whole block. The text colour
  follows the background colour. With no colour and no image the block
  renders exactly as before, so saved blocks don't change.

The block is full width (with the usual side padding) while it has a
background; its content keeps `--juizi-membership-width`.

Form colours are passed as the CSS custom properties the sign-up block
documents in its `extension.js` (`--membership-highlight`,
`--membership-button-*`), set on the Frame.

## Contract with the sign-up block

`method()` returns:

- `schemaEnhancer({ schema, formData, intl })`: the sidebar schema with the
  extra fields.
- `Frame({ data, isEditMode, children })`: wraps the block's output.

## Known issues

- No warning yet when a chosen colour is too faint on the white form.
- The colour list is `getBlockColorList('membershipSignup')`. The block
  isn't in the dashboard's block list, so it always offers every site colour.
