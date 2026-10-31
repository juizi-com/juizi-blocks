import tableSVG from '@plone/volto/icons/table.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import { ensureIds, withItemTitles } from '../_shared/items';
import View from './View';
import pricingSchema, { BLOCK_TYPE } from './schema';

// Every change: tiers get ids (the sortable list and "Highlighted tier"
// need them) and are named in the sidebar after the tier name.
const normalizeData = (data) =>
  data.tiers
    ? { ...data, tiers: withItemTitles(ensureIds(data.tiers, 'tier'), 'name') }
    : data;

// The mobile carousel and its dots are on unless switched off; the form
// shows them ticked to match (saved once the editor changes something).
const getFormData = (data) => ({
  ...data,
  tiers: ensureIds(data.tiers, 'tier'),
  mobileCarousel: data.mobileCarousel !== false,
  mobileDots: data.mobileDots !== false,
});

const pricingTiers = {
  id: BLOCK_TYPE,
  title: 'Pricing tiers',
  description:
    'Price cards side by side, each with a name, price, features and a button.',
  icon: tableSVG,
  view: View,
  edit: makeBlockEdit(View, { normalizeData, getFormData }),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: pricingSchema,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  // Colour pickers fed by the shared colour list (dashboard: Colours per block).
  usesColors: true,
};

export default pricingTiers;
