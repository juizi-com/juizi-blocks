import { getBlockColorList, getColorChoices } from '../../../config/colors';
import blockMessages from '../../../blocks/messages';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import messages from './messages';

/**
 * Sidebar, in the order the editor works: the file, what's shown with it,
 * then the background. No schema defaults: Volto writes them into new
 * blocks.
 */
export const audioSchema = (args) => {
  const t = translator(args.intl);
  // Colours this block offers — set per block in the Juizi Blocks dashboard.
  const colors = getColorChoices(getBlockColorList('audioBlock'));
  return {
    title: t(blockMessages.audio),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: ['audio', 'title', 'description', 'transcript'],
      },
      {
        id: 'colors',
        title: t(messages.colors),
        fields: ['backgroundColor'],
      },
    ],
    properties: {
      audio: {
        title: t(messages.audio),
        description: t(messages.audioHelp),
        widget: 'object_browser',
        mode: 'link',
        selectableTypes: ['File'],
        allowExternals: true,
      },
      title: {
        title: t(shared.title),
        description: t(messages.titleHelp),
      },
      description: {
        title: t(messages.description),
        description: t(messages.descriptionHelp),
        widget: 'textarea',
      },
      transcript: {
        title: t(messages.transcript),
        description: t(messages.transcriptHelp),
        widget: 'textarea',
      },
      // 'None' is a real choice (not just the placeholder), so editors can
      // go back to no background.
      backgroundColor: {
        title: t(shared.backgroundColor),
        description: t(messages.backgroundHelp),
        choices: [['transparent', t(shared.none)], ...colors],
        placeholder: t(shared.none),
      },
    },
    required: [],
  };
};
