/**
 * A list field (Volto's or Volto Light Theme's `object_list`) that can be
 * put in order without dragging.
 *
 * Their lists are dragged with a mouse; by keyboard an item can be picked up
 * but not dropped (Volto 18, Volto Light Theme 7), and WCAG 2.5.7 needs a way
 * without dragging anyway. So each item gets Move up and Move down at the end
 * of its form: focus stays on the button, and the new place is announced.
 *
 * In a schema: `widget: REORDER_LIST` instead of `object_list`. Optional
 * field props: `getItemName(item, index)` and `itemNoun` (else the item
 * schema's title). The Move buttons are added to each item by themselves.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import config from '@plone/volto/registry';
import messages from './messages';
import './reorder-list.css';

export const REORDER_LIST = 'juiziReorderList';
export const ITEM_POSITION = 'juiziItemPosition';
const POSITION_FIELD = 'juiziPosition';

const List = createContext(null);

export const move = (items, from, to) => {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

/** Where an item is in the list: by its id, or else by the item itself. */
const indexOf = (items, item) =>
  items.findIndex(
    (found) =>
      found === item || (item?.['@id'] && found?.['@id'] === item['@id']),
  );

/** The item's form, with Move up and Move down at the end of its first
 * fieldset. */
export const withPosition = (schema, item) => {
  if (!schema?.fieldsets?.length) return schema;
  const [first, ...rest] = schema.fieldsets;
  return {
    ...schema,
    fieldsets: [
      {
        ...first,
        fields: [
          ...first.fields.filter((field) => field !== POSITION_FIELD),
          POSITION_FIELD,
        ],
      },
      ...rest,
    ],
    properties: {
      ...schema.properties,
      [POSITION_FIELD]: { title: '', widget: ITEM_POSITION, item },
    },
  };
};

/** Inside an item: where it is, and buttons to move it. */
export const ItemPosition = ({ item }) => {
  const intl = useIntl();
  const list = useContext(List);
  const index = list ? indexOf(list.items, item) : -1;
  if (index < 0 || list.items.length < 2) return null;
  const total = list.items.length;
  const name = list.names[index];

  const button = (step, text, named, atEnd) => (
    <button
      type="button"
      className="juizi-position__button"
      data-move={`${index}|${step}`}
      // Not `disabled`: that would drop focus at either end.
      aria-disabled={atEnd}
      aria-label={intl.formatMessage(named, { name })}
      onClick={() => list.moveBy(index, step)}
    >
      {intl.formatMessage(text)}
    </button>
  );

  return (
    <div className="juizi-position">
      <span>
        {intl.formatMessage(messages.position, { number: index + 1, total })}
      </span>
      {button(-1, messages.moveUp, messages.moveUpNamed, index === 0)}
      {button(
        1,
        messages.moveDown,
        messages.moveDownNamed,
        index === total - 1,
      )}
    </div>
  );
};

/**
 * Calendar and the like pass `getName`, `displayValue` (what the list shows,
 * never saved) and `onListChange` (to tidy a change) as props.
 */
const ReorderList = (props) => {
  const intl = useIntl();
  const {
    id,
    value,
    onChange,
    schema,
    schemaExtender,
    schemaEnhancer,
    getItemName,
    itemNoun,
    displayValue,
    onListChange,
    className = '',
  } = props;
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const ObjectList = config.widgets.widget.object_list;

  const root = useRef(null);
  const focusNext = useRef('');
  const [moved, setMoved] = useState('');
  // The open item is followed by its id, so it stays open wherever it goes.
  const [open, setOpen] = useState(() => ({
    index: items.length - 1,
    id: items[items.length - 1]?.['@id'],
  }));
  const at = open.id ? items.findIndex((item) => item['@id'] === open.id) : -1;
  const active = open.id && at >= 0 ? at : open.index;

  const noun = itemNoun || schema?.title || intl.formatMessage(messages.item);
  const names = items.map(
    (item, index) =>
      getItemName?.(item, index) ||
      (typeof item?.title === 'string' && item.title.trim()) ||
      `${noun} ${index + 1}`,
  );

  useEffect(() => {
    // A new item is opened before it is in the list.
    if (!open.id && items[open.index]?.['@id']) {
      setOpen({ index: open.index, id: items[open.index]['@id'] });
    }
  }, [open, items]);

  useEffect(() => {
    if (!focusNext.current || !root.current) return;
    const button = root.current.querySelector(
      `[data-move="${focusNext.current}"]`,
    );
    focusNext.current = '';
    // The list draws a moved item's form afresh, losing focus.
    if (button) button.focus();
  }, [items]);

  // The lists number their items ("Slide #2") and leave the drag handles
  // unnamed: these are attributes they don't set themselves.
  const nameKey = names.join('\n');
  useEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const apply = () => {
      const given = nameKey.split('\n');
      element
        .querySelectorAll('.accordion-title-wrapper')
        .forEach((title, index) => {
          if (given[index]) title.setAttribute('data-name', given[index]);
        });
      element.querySelectorAll('.drag.handle').forEach((handle, index) => {
        if (given[index]) handle.setAttribute('aria-label', given[index]);
      });
    };
    apply();
    if (!window.MutationObserver) return undefined;
    const observer = new window.MutationObserver(apply);
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [nameKey]);

  const moveBy = (index, step) => {
    const to = index + step;
    const next = move(items, index, to);
    if (next === items) return;
    focusNext.current = `${to}|${step}`;
    setOpen({ index: to, id: items[index]['@id'] });
    onChange(id, next);
    setMoved(
      intl.formatMessage(messages.moved, {
        name: names[index],
        number: to + 1,
        total: items.length,
      }),
    );
  };

  // Volto's list calls schemaExtender, Volto Light Theme's schemaEnhancer.
  const extend = (base, item, ...rest) =>
    withPosition(
      schemaExtender ? schemaExtender(base, item, ...rest) : base,
      item,
    );
  const enhance = ({ schema: base, formData, ...rest }) =>
    withPosition(
      schemaEnhancer
        ? schemaEnhancer({ schema: base, formData, ...rest })
        : schemaExtender
          ? schemaExtender(base, formData)
          : base,
      formData,
    );

  const shown = displayValue ? displayValue(items, names) : items;

  return (
    <div className={`juizi-reorder-list ${className}`.trim()} ref={root}>
      <List.Provider value={{ items: shown, names, moveBy }}>
        <ObjectList
          {...props}
          widget="object_list"
          value={shown}
          schemaExtender={extend}
          schemaEnhancer={enhance}
          onChange={(field, next) =>
            onChange(field, onListChange ? onListChange(items, next) : next)
          }
          activeObject={active}
          setActiveObject={(index) =>
            setOpen({ index, id: items[index]?.['@id'] })
          }
        />
      </List.Provider>
      <p role="status" className="juizi-reorder-list__status">
        {moved}
      </p>
    </div>
  );
};

export default ReorderList;
