import infoSVG from '@plone/volto/icons/info.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import View from './View';
import { calloutSchema } from './schema';
import { changeCalloutType, getInitialDataForType } from './types';

// Choosing a type for the first time seeds its icon and the site's colours
// for it. Changing it later swaps only what the editor hasn't changed.
const getChangedData = (id, value, data) => {
  if (id !== 'calloutType') return { ...data, [id]: value };
  return data.calloutType
    ? changeCalloutType(data, value)
    : { ...data, ...getInitialDataForType(value) };
};

const callout = {
  id: 'juiziCallout',
  title: 'Callout',
  description: 'Highlighted message with an icon and an optional link.',
  icon: infoSVG,
  view: View,
  edit: makeBlockEdit(View, { getChangedData }),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: calloutSchema,
  sidebarTab: 1,
  // Colour pickers fed by the shared colour list (dashboard: Colours per block).
  usesColors: true,
};

export default callout;
