/**
 * The list of event types. Its order is the calendar's order, so there is
 * only this one list. Dragged as usual, or put in order with each item's
 * Move up and Move down (see `_shared/ReorderList.jsx`).
 */
import React from 'react';
import { useIntl } from 'react-intl';
import ReorderList from '../_shared/ReorderList';
import { itemName } from './items';
import messages from './messages';
import { useOptionNames } from './widgets';

/** Picking another list empties what was picked from the old one. */
export const clearStale = (before, after) =>
  Array.isArray(after)
    ? after.map((item) => {
        const old = before.find((found) => found['@id'] === item['@id']);
        if (!old || old.filterBy === item.filterBy || !old.filterBy) {
          return item;
        }
        const { values, match, ...rest } = item;
        return rest;
      })
    : after;

export { move } from '../_shared/ReorderList';

const ItemsWidget = (props) => {
  const intl = useIntl();
  const optionName = useOptionNames();
  return (
    <ReorderList
      {...props}
      className="juizi-calendar-items"
      itemNoun={intl.formatMessage(messages.eventType)}
      getItemName={(item) => itemName(item) || optionName(item)}
      // For the list to show the kinds' names: never saved.
      displayValue={(items, names) =>
        items.map((item, index) =>
          itemName(item) || !optionName(item)
            ? item
            : { ...item, title: names[index] },
        )
      }
      onListChange={clearStale}
    />
  );
};

export default ItemsWidget;
