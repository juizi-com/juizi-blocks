import audioSVG from '@plone/volto/icons/audio.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import View from './View';
import { audioSchema } from './schema';
import { getChangedData, getFormData } from './audio';

const audio = {
  // The id of the older juizi-volto-audio-block, so its blocks keep playing.
  id: 'audioBlock',
  title: 'Audio',
  description:
    'A sound recording with a player, title, description and transcript.',
  icon: audioSVG,
  view: View,
  edit: makeBlockEdit(View, { getChangedData, getFormData }),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: audioSchema,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  // Colour picker fed by the shared colour list (dashboard: Colours per block).
  usesColors: true,
};

export default audio;
