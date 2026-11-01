import {
  getBlockColorList,
  getButtonChoices,
  getColorChoices,
} from '../../config/colors';
import {
  getAlignmentChoices,
  getOptionalPaddingProperties,
} from '../../components/Blocks/_shared/choices';
import { translator } from '../../components/Blocks/_shared/i18n';
import shared from '../../components/Blocks/_shared/messages';
import {
  backgroundFieldset,
  backgroundProperties,
  panelPosition,
} from '../_shared/background';
// Same field and wording as the Carousel's
import carouselMessages from '../../components/Blocks/EmblaCarousel/messages';
// The same panel as on the shop's Buy block
import shopMessages from '../shopBuy/messages';
import messages from './messages';

export const RESOURCE_BLOCK_IDS = [
  'resourceType',
  'resourceFacts',
  'resourceActions',
  'resourceAbstract',
  'resourceKeyFindings',
];

/** Each block's own panel, ahead of Background & spacing. */
const OWN_PANELS = {
  resourceType: (t, colors) => ({
    fieldset: {
      id: 'juizi_resource_label',
      title: t(messages.labelPanel),
      fields: ['labelColor', 'alignment'],
    },
    properties: {
      labelColor: {
        title: t(messages.labelColor),
        description: t(messages.labelColorHelp),
        widget: 'select',
        choices: getColorChoices(colors),
      },
      alignment: {
        title: t(shared.textAlignment),
        choices: getAlignmentChoices(t),
      },
    },
  }),
  resourceFacts: (t) => ({
    fieldset: {
      id: 'juizi_resource_layout',
      title: t(shared.layout),
      fields: ['factsLabels'],
    },
    properties: {
      factsLabels: {
        title: t(messages.factsLabels),
        choices: [
          ['beside', t(messages.factsBeside)],
          ['above', t(messages.factsAbove)],
        ],
      },
    },
  }),
  resourceActions: (t, colors) => {
    const buttons = getColorChoices(getButtonChoices(colors, t));
    return {
      fieldset: {
        id: 'juizi_resource_buttons',
        title: t(shopMessages.shopColours),
        fields: ['mainButtonStyle', 'secondButtonStyle'],
      },
      defaultFields: ['alignment'],
      properties: {
        mainButtonStyle: {
          title: t(messages.mainButton),
          description: t(messages.mainButtonHelp),
          widget: 'select',
          choices: buttons,
        },
        secondButtonStyle: {
          title: t(messages.secondButton),
          description: t(messages.secondButtonHelp),
          widget: 'select',
          choices: buttons,
        },
        alignment: {
          title: t(shared.textAlignment),
          choices: getAlignmentChoices(t),
        },
      },
    };
  },
};

/**
 * The block's sidebar with its own panel, if it has one, and Background &
 * spacing. Nothing has a schema default, so a block nobody styled stays as
 * it was saved: empty means the add-on's usual look.
 */
export const makeSchemaEnhancer =
  (blockId) =>
  ({ schema, formData = {}, intl }) => {
    const t = translator(intl);
    const colors = getBlockColorList(blockId);
    const own = OWN_PANELS[blockId]?.(t, colors);
    const background = backgroundFieldset(
      t(shared.backgroundSpacing),
      formData,
    );
    const fieldsets = schema.fieldsets.map((fieldset) =>
      fieldset.id === 'default' && own?.defaultFields
        ? { ...fieldset, fields: [...fieldset.fields, ...own.defaultFields] }
        : fieldset,
    );
    fieldsets.splice(
      panelPosition(fieldsets),
      0,
      ...(own ? [own.fieldset] : []),
      {
        ...background,
        fields: [
          ...background.fields,
          ...(formData.backgroundImage?.[0] ? ['imageText'] : []),
          'paddingTop',
          'paddingBottom',
        ],
      },
    );
    return {
      ...schema,
      fieldsets,
      properties: {
        ...schema.properties,
        ...own?.properties,
        ...backgroundProperties(t, formData, colors),
        // The one text colour an editor picks: a picture can't be judged.
        imageText: {
          title: t(carouselMessages.textTone),
          choices: [
            ['light', t(carouselMessages.toneLight)],
            ['dark', t(carouselMessages.toneDark)],
          ],
          default: 'light',
        },
        ...getOptionalPaddingProperties(t),
      },
    };
  };
