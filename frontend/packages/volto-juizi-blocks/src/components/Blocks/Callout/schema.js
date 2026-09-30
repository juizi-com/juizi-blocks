import { defineMessages } from 'react-intl';
import { getBlockColorList, getColorChoices } from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import { calloutIcons } from './icons';
import { calloutTypes, isCalloutConfigured } from './types';

const messages = defineMessages({
  callout: { id: 'juizi-callout', defaultMessage: 'Callout' },
  calloutType: { id: 'juizi-callout-type', defaultMessage: 'Callout type' },
  changeType: {
    id: 'juizi-callout-change-type',
    defaultMessage:
      "What this callout is for. Changing it updates the icon and colours, except ones you've changed yourself.",
  },
  chooseType: {
    id: 'juizi-callout-choose-type',
    defaultMessage: 'Choose a callout type to get started.',
  },
  icon: { id: 'juizi-callout-icon', defaultMessage: 'Icon' },
  title: { id: 'juizi-title', defaultMessage: 'Title' },
  text: { id: 'juizi-text', defaultMessage: 'Text' },
  link: { id: 'juizi-link', defaultMessage: 'Link' },
  linkTitle: { id: 'juizi-link-title', defaultMessage: 'Link text' },
  colors: { id: 'juizi-callout-colors', defaultMessage: 'Colours' },
  backgroundColor: {
    id: 'juizi-callout-background',
    defaultMessage: 'Background colour',
  },
  backgroundColorHelp: {
    id: 'juizi-callout-background-help',
    defaultMessage: 'Text colour follows the background automatically.',
  },
  iconColor: { id: 'juizi-callout-icon-color', defaultMessage: 'Icon colour' },
  linkColor: { id: 'juizi-callout-link-color', defaultMessage: 'Link colour' },
  sameAsText: {
    id: 'juizi-callout-same-as-text',
    defaultMessage: 'Same as text',
  },
  none: { id: 'juizi-callout-none', defaultMessage: 'None' },
});

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
    title: intl.formatMessage(messages.callout),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
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
        title: intl.formatMessage(messages.calloutType),
        description: intl.formatMessage(
          configured ? messages.changeType : messages.chooseType,
        ),
        choices: calloutTypes.map(({ id, label }) => [id, label]),
      },
      icon: {
        title: intl.formatMessage(messages.icon),
        choices: Object.entries(calloutIcons).map(([name, { label }]) => [
          name,
          label,
        ]),
        // No default: Volto writes defaults into new blocks, which would skip
        // the type choice. Choosing a type seeds the icon instead.
      },
      title: { title: intl.formatMessage(messages.title) },
      text: { title: intl.formatMessage(messages.text), widget: 'textarea' },
      link: {
        title: intl.formatMessage(messages.link),
        widget: 'object_browser',
        mode: 'link',
        return: 'single',
        allowExternals: true,
      },
      linkTitle: { title: intl.formatMessage(messages.linkTitle) },
      // 'None' is a real choice (not just the placeholder), so editors can
      // go back to no background.
      backgroundColor: colorField(
        messages.backgroundColor,
        messages.none,
        messages.backgroundColorHelp,
        [['transparent', intl.formatMessage(messages.none)], ...colors],
      ),
      iconColor: colorField(messages.iconColor, messages.sameAsText),
      linkColor: colorField(messages.linkColor, messages.sameAsText),
    },
    required: [],
  };
};
