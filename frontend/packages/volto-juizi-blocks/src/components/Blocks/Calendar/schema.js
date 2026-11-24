import { getBlockColorList, getColorChoices } from '../../../config/colors';
import { schemaData } from '../../BlockEdit/BlockEdit';
import { getPaddingChoices } from '../_shared/choices';
import { translator } from '../_shared/i18n';
import shared from '../_shared/messages';
import { BLOCK_TYPE } from './colours';
import { isFeed, upgradeItem } from './items';
import messages from './messages';

export const WIDGET = 'juiziCalendarChoices';
export const ITEMS_WIDGET = 'juiziCalendarItems';

/** An event type's fields: each step appears once the one before is done. */
export const itemFields = (raw = {}) => {
  const item = upgradeItem(raw);
  const tail = ['label', 'color'];
  if (isFeed(item)) return ['what', 'feed', ...tail];
  // The tech event only shows where sessions are picked (see widgets).
  const fields = ['what', 'techEvent', 'filterBy'];
  if (!item.filterBy) return fields;
  if (item.filterBy !== 'all') {
    fields.push('values');
    // "And / or" means something from the second value on.
    if (item.values?.length > 1 || item.match === 'all') fields.push('match');
  }
  return [...fields, ...tail];
};

export const extendItem = (schema, raw = {}) => {
  const item = upgradeItem(raw);
  return {
    ...schema,
    fieldsets: [{ ...schema.fieldsets[0], fields: itemFields(item) }],
    properties: {
      ...schema.properties,
      techEvent: { ...schema.properties.techEvent, rule: item },
      filterBy: { ...schema.properties.filterBy, rule: item },
      values: { ...schema.properties.values, rule: item },
    },
  };
};

const itemSchema = (t, colours) => ({
  title: t(messages.eventType),
  addMessage: t(messages.addEventType),
  fieldsets: [{ id: 'default', title: t(shared.default), fields: ['what'] }],
  properties: {
    what: {
      title: t(messages.what),
      description: t(messages.whatHelp),
      widget: WIDGET,
      choicesOf: 'kinds',
      emptyText: t(messages.noKinds),
    },
    techEvent: {
      title: t(messages.techEvent),
      description: t(messages.techEventHelp),
      widget: WIDGET,
      choicesOf: 'techEvents',
    },
    filterBy: {
      title: t(messages.filterBy),
      widget: WIDGET,
      choicesOf: 'filters',
      noValueOption: false,
    },
    values: { title: t(messages.values), widget: WIDGET, choicesOf: 'values' },
    match: {
      title: t(messages.match),
      choices: [
        ['any', t(messages.matchAny)],
        ['all', t(messages.matchAll)],
      ],
      placeholder: t(messages.matchAny),
      noValueOption: false,
    },
    feed: { title: t(messages.feed), description: t(messages.feedHelp) },
    label: { title: t(messages.name), description: t(messages.nameHelp) },
    color: {
      title: t(messages.color),
      description: t(messages.colorHelp),
      choices: getColorChoices(colours),
    },
  },
  required: [],
});

const calendarSchema = (args = {}) => {
  const t = translator(args.intl);
  const data = schemaData(args);
  const colours = getBlockColorList(BLOCK_TYPE);
  const colourChoices = getColorChoices(colours);
  const hasItems = !!data.items?.length;
  return {
    title: t(messages.blockTitle),
    fieldsets: [
      {
        id: 'default',
        title: t(shared.default),
        fields: ['title', 'description'],
      },
      {
        id: 'eventTypes',
        title: t(messages.eventTypes),
        fields: ['items', ...(hasItems ? ['showOther'] : [])],
      },
      {
        id: 'whichEvents',
        title: t(messages.whichEvents),
        fields: ['folder'],
      },
      {
        id: 'datesTimes',
        title: t(messages.datesTimes),
        fields: ['timezone', 'weekStart'],
      },
      {
        id: 'sharing',
        title: t(messages.sharing),
        fields: ['showSubscribe'],
      },
      {
        id: 'look',
        title: t(shared.appearance),
        fields: [
          'accentColor',
          'backgroundColor',
          'paddingTop',
          'paddingBottom',
        ],
      },
      { id: 'advanced', title: t(shared.advanced), fields: ['customClass'] },
    ],
    properties: {
      title: { title: t(shared.title), description: t(messages.heading) },
      description: { title: t(messages.intro), widget: 'textarea' },
      items: {
        title: t(messages.eventTypes),
        description: t(messages.itemsHelp),
        widget: ITEMS_WIDGET,
        schema: itemSchema(t, colours),
        // Volto's list widget takes the first, Volto Light Theme's the second.
        schemaExtender: extendItem,
        schemaEnhancer: ({ schema, formData }) => extendItem(schema, formData),
      },
      showOther: {
        title: t(messages.showOther),
        description: t(messages.showOtherHelp),
        type: 'boolean',
      },
      folder: {
        title: t(messages.folder),
        description: t(messages.folderHelp),
        widget: 'object_browser',
        mode: 'link',
        allowExternals: false,
      },
      timezone: {
        title: t(messages.timezone),
        description: t(messages.timezoneHelp),
        widget: WIDGET,
        choicesOf: 'timezones',
      },
      weekStart: {
        title: t(messages.weekStart),
        description: t(messages.weekStartHelp),
        choices: [
          ['monday', t(messages.monday)],
          ['sunday', t(messages.sunday)],
        ],
        placeholder: t(messages.asTheSite),
      },
      showSubscribe: {
        title: t(messages.showSubscribe),
        description: t(messages.showSubscribeHelp),
        type: 'boolean',
      },
      accentColor: { title: t(messages.accent), choices: colourChoices },
      backgroundColor: {
        title: t(shared.backgroundColor),
        choices: [['transparent', t(shared.none)], ...colourChoices],
      },
      paddingTop: {
        title: t(shared.topPadding),
        description: t(shared.paddingHelp),
        choices: getPaddingChoices(t),
      },
      paddingBottom: {
        title: t(shared.bottomPadding),
        description: t(shared.paddingHelp),
        choices: getPaddingChoices(t),
      },
      customClass: { title: t(shared.customClass) },
    },
    required: [],
  };
};

export default calendarSchema;
