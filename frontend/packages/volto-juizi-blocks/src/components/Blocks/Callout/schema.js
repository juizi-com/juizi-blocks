import { getBlockColorList, getColorChoices } from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import { calloutIcons } from './icons';
import { calloutTypes, isCalloutConfigured } from './types';
import blockMessages from '../../../blocks/messages';
import shared from '../_shared/messages';
import messages from './messages';

export const calloutSchema = (args) => {
  const { intl } = args;
  // First-Time Editor Test: only the type selector until a type is chosen.
  // Choosing a type seeds the icon (and the site's colours for the type);
  // the type stays first in the sidebar so the editor can see and change it.
  const configured = isCalloutConfigured(schemaData(args));
  // Colours this block offers — set per block in the Juizi Blocks dashboard.
  const colors = getColorChoices(getBlockColorList('juiziCallout'));
  // No schema defaults anywhere: Volto writes them into new blocks.
  const colorField = (title, emptyLabel, description, choices = colors) => ({
    title: intl.formatMessage(title),
    ...(description ? { description: intl.formatMessage(description) } : {}),
    choices,
    placeholder: intl.formatMessage(emptyLabel),
  });
  return {
    title: intl.formatMessage(blockMessages.callout),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(shared.default),
        fields: configured
          ? ['calloutType', 'icon', 'title', 'text', 'link', 'linkTitle']
          : ['calloutType'],
      },
      ...(configured
        ? [
            {
              id: 'colors',
              title: intl.formatMessage(messages.colors),
              fields: ['backgroundColor', 'iconColor', 'linkColor'],
            },
          ]
        : []),
    ],
    properties: {
      calloutType: {
        title: intl.formatMessage(messages.type),
        description: intl.formatMessage(
          configured ? messages.changeType : messages.chooseType,
        ),
        choices: calloutTypes.map(({ id, label }) => [
          id,
          intl.formatMessage(label),
        ]),
      },
      icon: {
        title: intl.formatMessage(shared.icon),
        choices: Object.entries(calloutIcons).map(([name, { label }]) => [
          name,
          intl.formatMessage(label),
        ]),
        // No default: Volto writes defaults into new blocks, which would skip
        // the type choice. Choosing a type seeds the icon instead.
      },
      title: { title: intl.formatMessage(shared.title) },
      text: { title: intl.formatMessage(shared.text), widget: 'textarea' },
      link: {
        title: intl.formatMessage(shared.link),
        widget: 'object_browser',
        mode: 'link',
        return: 'single',
        allowExternals: true,
      },
      linkTitle: { title: intl.formatMessage(shared.linkTitle) },
      // 'None' is a real choice (not just the placeholder), so editors can
      // go back to no background.
      backgroundColor: colorField(
        shared.backgroundColor,
        shared.none,
        messages.backgroundHelp,
        [['transparent', intl.formatMessage(shared.none)], ...colors],
      ),
      iconColor: colorField(messages.iconColor, messages.sameAsText),
      linkColor: colorField(messages.linkColor, messages.sameAsText),
    },
    required: [],
  };
};
