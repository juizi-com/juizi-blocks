import calendarSVG from './icons/calendar.svg';
import makeBlockEdit from '../../BlockEdit/BlockEdit';
import { ensureIds } from '../_shared/items';
import { BLOCK_TYPE } from './colours';
import { nameItems, tidyWhat, upgradeItems } from './items';
import ItemsWidget from './ItemsWidget';
import View from './View';
import calendarSchema, { ITEMS_WIDGET, WIDGET } from './schema';
import CalendarChoices from './widgets';

/** Older rules take the new shape as soon as the editor changes anything;
 * "Another calendar" doesn't mix with kinds of event. */
const tidyItems = (items) =>
  (upgradeItems(items) || []).map((item) =>
    Array.isArray(item.what) && item.what.length
      ? { ...item, what: tidyWhat(item.what) }
      : item,
  );

const normalizeData = (data) =>
  data.items
    ? { ...data, items: nameItems(ensureIds(tidyItems(data.items), 'type')) }
    : data;

// "Show other events" is on unless switched off.
const getFormData = (data) => ({
  ...data,
  items: ensureIds(upgradeItems(data.items), 'type'),
  showOther: data.showOther !== false,
});

const calendar = {
  id: BLOCK_TYPE,
  title: 'Events calendar',
  description:
    'A month of events with a list beside it, filtered by the kinds of event you choose.',
  icon: calendarSVG,
  // Off until the site owner switches it on in the dashboard: that is also
  // when the backend gives events its tick box and indexes them.
  restricted: true,
  view: View,
  edit: makeBlockEdit(View, { normalizeData, getFormData }),
  // Our own key, not Volto's blockSchema: see makeBlockEdit.
  juiziSchema: calendarSchema,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  usesColors: true,
  widgets: {
    [WIDGET]: CalendarChoices,
    [ITEMS_WIDGET]: ItemsWidget,
  },
};

export default calendar;
