# Form block extension

Juizi additions to the Form block (`form`) from `volto-form-block`
(collective.volto.formsupport): a cleaner look for every form, text beside
the form, label and help text options, the site's button styles, and a
background with padding. On a site without the form block it does nothing.

Unlike the donation and membership sign-up blocks, volto-form-block has no
extension hook, so this extension owns the whole feature. It wraps the
block's `view`, `edit` and `formSchema` in `config.blocks.blocksConfig.form`
rather than shadowing volto-form-block's files: the collective.formsupport
add-ons (e.g. collective.formsupport.bulkmailproviders) already shadow
`Sidebar.jsx` and `formSchema.js`, and only one shadow of a file wins. The
wrappers sit on top of whatever those add-ons left in place.

**Load order:** `volto-juizi-blocks` must come after `volto-form-block`,
and after any add-on that replaces the form's `formSchema`, in the site's
add-on list. Listed before, the form block isn't there yet and nothing is
added.

## What it adds

- **Layout** in the form's main panel, under its description: "Form only"
  (the default, and what every saved form is) or "Form with text beside it".
  With text, **Form position** (right or left; on phones the text always
  comes first) and **Text alignment** beside the form: top, "top, stays in
  view" (the text stays on screen while a longer form scrolls past it,
  `--juizi-form-side-sticky-top` from the top, 2rem by default), centre
  (the default, and what every saved form has) or bottom. Alignment only
  applies while text and form are side by side.
- A **Text beside the form** panel: text above the heading, "This is the
  primary page heading", heading, introduction, and more text (rich text,
  shown below a line). Same fields, keys and wording as the donation and
  membership sign-up blocks. The form keeps its own title and description.
- An **Appearance** panel: **Labels** beside or above the fields (on
  phones they are always above); **Help text** (the extra line a field can
  have) below the field or under the label, and its colour from the site
  list (empty: a soft grey; a light colour gets an edit-mode warning, as it
  is hard to read on the white form); and the Send button and the Cancel and
  back buttons (Cancel when the form shows it, and the button that brings
  the form back after it's sent), each solid or outlined in a site colour,
  as the other Juizi buttons. Empty keeps the usual look. The colours reach
  the form's own buttons as `--juizi-form-submit-*` / `--juizi-form-cancel-*`
  properties on the Frame; the editor's "Add field" button is left alone.
- A **Background & spacing** panel: colour from the site's colour list,
  image, and once an image is set its position and overlay (the shared
  panel in `../_shared`), then top and bottom padding (the Hero's and
  Content Row's sizes, `juizi-form-wrapper--pad-*`). The text colour
  follows the background colour. Unset padding keeps the usual space: 2rem,
  more on a background.

## The form's look (form.css)

Every form block on a site with juizi-blocks, with or without the options
above, gets the Juizi look: a light box with a soft shadow, bordered fields
with a focus ring, fields in line with the title, required labels in the
text colour (the dot says "required"), help text without a line under it,
errors as a red border plus message,
"There are some errors" / sending errors / "Sent!" as full-width boxes with a
coloured edge, and buttons in the shape of the other Juizi buttons
(`--juizi-button-radius`). The Cancel and Clear buttons are a quiet outline
until a style is chosen. It also gets the Juizi side gutter, so it isn't
edge to edge on narrow screens (style.css).

Everything is themeable through the `--juizi-form-*` tokens in
`theme/juizi-common.scss` (box background, text, border, radius, shadow,
padding; field background, border, radius; accent, error and success
colours). Several rules need `!important` to beat volto-form-block's and
Volto's own form styles.

The editor's canvas gets the same look and label position, so editors see
what visitors will. With the form's Data tab open (saved answers), the form
takes the full width and the text beside it moves above, whichever side it's
on, so the table has room.

Inside the extension's wrapper the form block isn't a direct child of the
blocks layout any more, and Volto Light Theme paints such blocks in the
theme colour; form.css makes it transparent so only the rounded box shows.

With none of the options chosen the block keeps its own layout; only the
shared look above applies.

The form keeps a light box with dark text on any background
(`--juizi-form-box-background`, `--juizi-form-box-foreground`), so its
labels, field errors, and error and success messages read the same on any
background. Checked on IRR-test against every site colour and a background
image, for field errors, the "errors in the form" message, a server error
and the success message.

## States

- Text chosen but empty: editors see a hint in the text column; visitors
  get the form alone.
- Primary heading: the side heading becomes the page's `h1` and the page's
  own title is hidden (CSS, `:has()`); in the editor the title stays, faded,
  with a note saying why. A second block on the page with
  `isPrimaryHeading` gets a warning.

## Happy path (draft, confirm in first-time editor test)

1. Add a Form block and build the form as usual.
2. In the sidebar, set Layout to "Form with text beside it".
3. Open "Text beside the form" and fill in a heading and introduction.
4. Optionally, under Appearance, put the labels above the fields and pick
   the Send button's style; under Background & spacing, pick a background
   colour or image.

## Saved content

New keys only (`layout`, `form_position`, `side_*`, `isPrimaryHeading`,
`labelPosition`, `helpTextPosition`, `helpTextColor`, `submitButtonStyle`,
`cancelButtonStyle`, `background*`, `paddingTop`, `paddingBottom`). Nothing
existing is renamed or reinterpreted. If juizi-blocks is removed, the keys
stay in the block data and are ignored.

The shared look (form.css) changes how every existing form looks on a site
that adds or updates juizi-blocks, on purpose; nothing in the saved data
changes.

## Known issues

- The side text isn't in the site search yet (no searchable-text adapter for
  `form` blocks); to follow, together with the donation and membership
  blocks.
- Testing tip: a form built over the REST API needs an `id` on each field
  (subblock), with `field_id` the same. volto-form-block's sidebar copies
  `id` into `field_id` whenever the form is opened in the editor, so fields
  without one lose their `field_id`, and formsupport then checks the wrong
  field as the email address ('Email not valid in "Your name" field').
  Forms built in the editor always have ids.
- The colour list is `getBlockColorList('form')`. The form block isn't in
  the dashboard's block list, so it always offers every site colour.
