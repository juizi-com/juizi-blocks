# Resource blocks extension

Juizi styling for the blocks of `collective.resourcelibrary` (its Volto
add-on, `volto-resource-library`). That add-on doesn't depend on this one:
each block looks up a registry utility (`type: 'blockExtension'`, `name`: the
block's id) when it renders and works without it (plain Volto).

The blocks **stay in their own Resource group** of the block chooser, so
unlike the donation, membership and shop extensions this one has no `group`
and doesn't call `joinJuiziGroup`.

Nothing shows until `juizi.blocks` is installed on the site (`isInstalled`).

## What it adds

| Block | Own panel | Options |
|---|---|---|
| Resource type | Label | Label colour (a coloured tag; text follows it), text alignment |
| Resource facts | Layout | Headings beside or above the details |
| Download button | Buttons | Download button, button to the original, text alignment |
| Abstract | | |
| Key findings | | |

Every block also gets **Background & spacing**: background colour and image
(with position and overlay), top and bottom padding, as on the donation
block, plus "Text over the background image" while an image is set.

The download button always takes the site's button, solid in the colour
`getDefaultButton` picks for the background; the button to the original is
the outlined one. Empty fields keep those.

The lead image block is left out: it is Volto's own block, with its own size
and alignment, and a floated picture has no band to colour.

## Contract with the add-on

`method()` returns `{ schemaEnhancer, Frame }` (documented in the add-on's
`frontend/src/blockExtension.js`), or `{}` until `juizi.blocks` is installed.

- `schemaEnhancer({ schema, formData, intl })`: the block's sidebar schema
  with the extra fields. They have no schema defaults that change a saved
  block.
- `Frame({ data, isEditMode, children })`: always drawn, around
  `.resource-block-inner`, the inner layer that lines the block up with the
  page title (`--juizi-resource-width`, `$juizi-layers`).

Colours reach the add-on's markup through `style.css`, by class name, so the
add-on carries no Juizi code.

## Known issues

- The colour list is `getBlockColorList(<block id>)`. These blocks aren't in
  the dashboard's block list, so they always offer every site colour.
- Width and side padding need Volto Light Theme's `.blocks-group-wrapper`,
  as every Juizi block does. The fixed page a resource gets without blocks
  has no styling options.
