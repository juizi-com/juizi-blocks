import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../config/colors';
import { getOptionalPaddingProperties } from '../../components/Blocks/_shared/choices';
import shared from '../../components/Blocks/_shared/messages';
import { translator } from '../../components/Blocks/_shared/i18n';
import {
  backgroundFieldset,
  backgroundProperties,
  panelPosition,
} from '../_shared/background';
import messages from './messages';

// Fields the donation and membership sign-up blocks use for the same thing,
// with the same keys.
export const SIDE_TEXT_FIELDS = [
  'side_kicker',
  'isPrimaryHeading',
  'side_heading',
  'side_intro',
  'side_more',
];

/**
 * The form block's sidebar schema with "Layout" (under its description),
 * a "Text beside the form" panel while that layout is chosen, and a
 * "Appearance" and a "Background & spacing" panel. Unset layout (every form
 * saved before this) is "Form only"; unset buttons and padding keep the
 * form's usual look.
 */
const sideTextSchema = ({ schema, formData = {}, intl }) => {
  const t = translator(intl);
  const withText = formData.layout === 'text';
  const layoutFields = ['layout', ...(withText ? ['form_position'] : [])];

  const fieldsets = schema.fieldsets.map((fieldset) => {
    if (fieldset.id !== 'default') return fieldset;
    const fields = [...fieldset.fields];
    const after = fields.indexOf('description');
    fields.splice(after >= 0 ? after + 1 : 0, 0, ...layoutFields);
    return { ...fieldset, fields };
  });
  if (withText) {
    fieldsets.splice(panelPosition(fieldsets), 0, {
      id: 'side_text',
      title: t(messages.sideText),
      fields: SIDE_TEXT_FIELDS,
    });
  }
  const background = backgroundFieldset(t(shared.backgroundSpacing), formData);
  fieldsets.splice(
    panelPosition(fieldsets),
    0,
    {
      id: 'juizi_appearance',
      title: t(shared.appearance),
      fields: [
        'labelPosition',
        'helpTextPosition',
        'helpTextColor',
        'submitButtonStyle',
        'cancelButtonStyle',
      ],
    },
    {
      ...background,
      fields: [...background.fields, 'paddingTop', 'paddingBottom'],
    },
  );
  const colors = getBlockColorList('form');
  const buttonChoices = getColorChoices(getButtonChoices(colors, t));

  return {
    ...schema,
    fieldsets,
    properties: {
      ...schema.properties,
      layout: {
        title: t(messages.layout),
        description: t(messages.layoutHelp),
        choices: [
          ['form', t(messages.layoutForm)],
          ['text', t(messages.layoutText)],
        ],
        // Same as unset ("Form only"), so saving it changes nothing
        default: 'form',
      },
      form_position: {
        title: t(messages.formPosition),
        description: t(messages.formPositionHelp),
        choices: [
          ['right', t(messages.right)],
          ['left', t(messages.left)],
        ],
        default: 'right',
      },
      side_kicker: {
        title: t(messages.kicker),
        description: t(messages.kickerHelp),
      },
      isPrimaryHeading: {
        title: t(messages.primaryHeading),
        description: t(messages.primaryHeadingHelp),
        type: 'boolean',
      },
      side_heading: { title: t(messages.heading) },
      side_intro: { title: t(messages.intro), widget: 'textarea' },
      side_more: {
        title: t(messages.more),
        description: t(messages.moreHelp),
        widget: 'richtext',
      },
      labelPosition: {
        title: t(messages.labelPosition),
        description: t(messages.labelPositionHelp),
        choices: [
          ['beside', t(messages.labelsBeside)],
          ['above', t(messages.labelsAbove)],
        ],
        // Same as unset, so saving it changes nothing
        default: 'beside',
      },
      helpTextPosition: {
        title: t(messages.helpTextPosition),
        description: t(messages.helpTextPositionHelp),
        choices: [
          ['below', t(messages.helpBelow)],
          ['label', t(messages.helpUnderLabel)],
        ],
        // Same as unset, so saving it changes nothing
        default: 'below',
      },
      helpTextColor: {
        title: t(messages.helpTextColor),
        description: t(messages.helpTextColorHelp),
        widget: 'select',
        choices: getColorChoices(colors),
      },
      submitButtonStyle: {
        title: t(messages.submitButton),
        description: t(messages.submitButtonHelp),
        widget: 'select',
        choices: buttonChoices,
      },
      cancelButtonStyle: {
        title: t(messages.cancelButton),
        description: t(messages.cancelButtonHelp),
        widget: 'select',
        choices: buttonChoices,
      },
      ...backgroundProperties(t, formData, colors),
      ...getOptionalPaddingProperties(t),
    },
  };
};

export default sideTextSchema;
