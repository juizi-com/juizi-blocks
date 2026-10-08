# Donation block extension

Juizi additions to the donation block from `volto-donations-block`. The
donation block doesn't depend on this add-on: it looks up a registry utility
(`type: 'blockExtension'`, `name: 'donationBlock'`) when it renders and works
without it. On a site without the donation block, the utility is never used.

## What it adds

- A **Background** panel in the sidebar, after the layout and text panels:
  background colour (from the site's colour list), background image, and,
  once an image is set, its position and overlay. Same fields and wording as
  the Content Row's background.
- A **Form colours** panel: the current step, the border around the chosen
  amount (and the other amount field while it's in use), and the main and
  back button styles, from the site's colours and button styles. Empty
  fields keep the site theme's colours.
- `Frame`: renders the background around the whole block. The text colour
  follows the background colour, as in the Content Row. With no colour and no
  image the block renders exactly as before, so saved blocks don't change.

The block is full width (with the usual side padding) while it has a
background; its content keeps `--juizi-donation-width`.

Form colours are passed as the CSS custom properties the donation block
documents in its `extension.js` (`--donation-step-active`,
`--donation-highlight`, `--donation-next-*`, `--donation-back-*`), set on the
Frame. A site theme that styles the form must read those properties with its
own colours as fallbacks, or the choices won't show.

## Contract with the donation block

`method()` returns:

- `schemaEnhancer({ schema, formData, intl })`: the sidebar schema with the
  extra fields.
- `Frame({ data, isEditMode, children })`: wraps the block's output.

## Known issues

- No warning yet when a chosen colour is too faint on the white form (e.g. a
  light highlight).
- The colour list is `getBlockColorList('donationBlock')`. The donation block
  isn't in the dashboard's block list, so it always offers every site colour.
