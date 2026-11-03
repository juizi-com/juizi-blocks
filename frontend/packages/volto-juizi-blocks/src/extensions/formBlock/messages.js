import { defineMessages } from 'react-intl';

// Same wording as the donation and membership sign-up blocks' text beside
// the form, so editors meet one way of doing it.
export default defineMessages({
  layout: {
    id: 'juizi-form-layout',
    defaultMessage: 'Layout',
  },
  layoutHelp: {
    id: 'juizi-form-layout-help',
    defaultMessage:
      'Add text beside the form, such as what happens after someone sends it.',
  },
  layoutForm: {
    id: 'juizi-form-layout-form',
    defaultMessage: 'Form only',
  },
  layoutText: {
    id: 'juizi-form-layout-text',
    defaultMessage: 'Form with text beside it',
  },
  formPosition: {
    id: 'juizi-form-position',
    defaultMessage: 'Form position',
  },
  formPositionHelp: {
    id: 'juizi-form-position-help',
    defaultMessage: 'On phones the text always comes first, above the form.',
  },
  right: {
    id: 'juizi-form-position-right',
    defaultMessage: 'Right',
  },
  left: {
    id: 'juizi-form-position-left',
    defaultMessage: 'Left',
  },
  sideAlign: {
    id: 'juizi-form-side-align',
    defaultMessage: 'Text alignment',
  },
  sideAlignHelp: {
    id: 'juizi-form-side-align-help',
    defaultMessage:
      'Where the text sits beside a longer form. "Top, stays in view" keeps it on screen while the form scrolls. On phones the text is above the form.',
  },
  alignTop: {
    id: 'juizi-form-side-align-top',
    defaultMessage: 'Top',
  },
  alignSticky: {
    id: 'juizi-form-side-align-sticky',
    defaultMessage: 'Top, stays in view',
  },
  alignCenter: {
    id: 'juizi-form-side-align-center',
    defaultMessage: 'Centre',
  },
  alignBottom: {
    id: 'juizi-form-side-align-bottom',
    defaultMessage: 'Bottom',
  },
  sideText: {
    id: 'juizi-form-side-text',
    defaultMessage: 'Text beside the form',
  },
  kicker: {
    id: 'juizi-form-side-kicker',
    defaultMessage: 'Text above the heading',
  },
  kickerHelp: {
    id: 'juizi-form-side-kicker-help',
    defaultMessage: 'Optional. A short line, e.g. "Get in touch".',
  },
  primaryHeading: {
    id: 'juizi-form-primary-heading',
    defaultMessage: 'This is the primary page heading',
  },
  primaryHeadingHelp: {
    id: 'juizi-form-primary-heading-help',
    defaultMessage:
      "Makes the heading below the page's main heading and hides the page's own title. Use it when this form is the top of the page. Only one block per page should have this.",
  },
  heading: {
    id: 'juizi-form-side-heading',
    defaultMessage: 'Heading',
  },
  intro: {
    id: 'juizi-form-side-intro',
    defaultMessage: 'Introduction',
  },
  more: {
    id: 'juizi-form-side-more',
    defaultMessage: 'More text',
  },
  moreHelp: {
    id: 'juizi-form-side-more-help',
    defaultMessage:
      'Optional. Shown below a line, e.g. opening hours or other ways to reach you.',
  },
  labelPosition: {
    id: 'juizi-form-label-position',
    defaultMessage: 'Labels',
  },
  labelPositionHelp: {
    id: 'juizi-form-label-position-help',
    defaultMessage:
      'Above the fields suits a form beside text. On phones labels are always above.',
  },
  labelsBeside: {
    id: 'juizi-form-labels-beside',
    defaultMessage: 'Beside the fields',
  },
  labelsAbove: {
    id: 'juizi-form-labels-above',
    defaultMessage: 'Above the fields',
  },
  helpTextPosition: {
    id: 'juizi-form-help-position',
    defaultMessage: 'Help text',
  },
  helpTextPositionHelp: {
    id: 'juizi-form-help-position-help',
    defaultMessage:
      "The extra line some fields have, such as how you'll use an email address.",
  },
  helpBelow: {
    id: 'juizi-form-help-below',
    defaultMessage: 'Below the field',
  },
  helpUnderLabel: {
    id: 'juizi-form-help-under-label',
    defaultMessage: 'Under the label',
  },
  helpTextColor: {
    id: 'juizi-form-help-color',
    defaultMessage: 'Help text colour',
  },
  helpTextColorHelp: {
    id: 'juizi-form-help-color-help',
    defaultMessage: 'Leave empty for a soft grey.',
  },
  helpTextColorLight: {
    id: 'juizi-form-help-color-light',
    defaultMessage:
      'The help text colour is light and may be hard to read on the white form. A darker colour reads better.',
  },
  submitButton: {
    id: 'juizi-form-submit-button',
    defaultMessage: 'Send button',
  },
  submitButtonHelp: {
    id: 'juizi-form-submit-button-help',
    defaultMessage:
      "The button that sends the form. Leave empty for the site's usual button.",
  },
  cancelButton: {
    id: 'juizi-form-cancel-button',
    defaultMessage: 'Cancel and back buttons',
  },
  cancelButtonHelp: {
    id: 'juizi-form-cancel-button-help',
    defaultMessage:
      "The Cancel button, if the form shows one, and the button that brings the form back after it's sent. Leave empty for the site's usual button.",
  },
  addText: {
    id: 'juizi-form-add-text',
    defaultMessage:
      'Add the text for this side in the sidebar, under "Text beside the form".',
  },
  otherPrimary: {
    id: 'juizi-form-other-primary',
    defaultMessage:
      "Another block is already the main heading for this page. Untick 'This is the primary page heading' on one of them.",
  },
  // Shown above the page's Title block in the editor (style.css).
  titleHiddenNote: {
    id: 'juizi-form-title-hidden-note',
    defaultMessage:
      'This title is hidden on the page because a form is set as the primary page heading. To show it again, untick “This is the primary page heading” in the form’s Text beside the form settings.',
  },
});
