/**
 * Sidebar selects whose choices are this site's: the kinds of event, lists
 * and tech events the site owner offers (Site Setup › Juizi Blocks ›
 * Calendar), its tags and time zones. Editors pick from what exists, so a
 * misspelt tag can't quietly match nothing.
 *
 * A step with only one possible answer isn't shown. Something a saved
 * calendar uses that the owner has since taken away stays visible, marked,
 * so the editor can see why and change it.
 */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import ArrayWidget from '@plone/volto/components/manage/Widgets/ArrayWidget';
import SelectWidget from '@plone/volto/components/manage/Widgets/SelectWidget';
import Api from '@plone/volto/helpers/Api/Api';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { FEED, SESSION_LISTS, kindsOf } from './items';
import messages from './messages';

const KEEP = 30000;
const requests = new Map();

const loadOptions = (path) => {
  const known = requests.get(path);
  if (known && Date.now() - known.at < KEEP) return known.promise;
  const promise = new Api()
    .get(`${path === '/' ? '' : path}/@juizi-calendar-options`)
    .catch(() => {
      requests.delete(path);
      return null;
    });
  requests.set(path, { at: Date.now(), promise });
  return promise;
};

const list = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const sessionKinds = (options) =>
  (options?.kinds || []).filter((kind) => kind.session).map((kind) => kind.id);

/** The lists a rule can filter by, as [id, title]. */
export const filtersFor = (options, rule = {}, labels = {}) => {
  if (!options) return [];
  const kinds = kindsOf(rule);
  const picked = (options.kinds || []).filter((kind) =>
    kinds.includes(kind.id),
  );
  const offered = (options.taxonomies || []).filter((row) => row.offered);
  // Lists switched on for one of the kinds picked; any kind: all of them.
  const lists = kinds.length
    ? offered.filter((row) =>
        picked.some((kind) => kind.lists.includes(row.id)),
      )
    : offered;
  const sessions = sessionKinds(options);
  const withSessions = kinds.length
    ? kinds.some((kind) => sessions.includes(kind))
    : sessions.length > 0;
  return [
    ...(kinds.length ? [['all', labels.all || 'all']] : []),
    ['tags', labels.tags || 'tags'],
    ...lists.map((row) => [row.id, row.title]),
    ...(withSessions
      ? (options.sessionLists || []).map((row) => [row.id, row.title])
      : []),
  ];
};

/** The terms of one list, as [id, title]. */
export const valuesFor = (options, rule = {}) => {
  if (!options) return [];
  const by = rule.filterBy;
  if (by === 'tags') return options.tags.map((tag) => [tag, tag]);
  if (SESSION_LISTS.includes(by)) {
    const events = (options.techEvents || []).filter(
      (event) => !rule.techEvent || event.id === rule.techEvent,
    );
    const seen = new Map();
    events.forEach((event) =>
      (event.lists?.[by] || []).forEach(([id, title]) => {
        if (!seen.has(id)) seen.set(id, title);
      }),
    );
    return [...seen.entries()];
  }
  return (options.taxonomies || []).find((row) => row.id === by)?.terms || [];
};

export const choicesFor = (options, kind, rule, labels) => {
  if (!options) return [];
  if (kind === 'kinds') {
    return [
      ...(options.kinds || []).map(({ id, title }) => [id, title]),
      ...(options.feeds ? [[FEED, labels?.feed || FEED]] : []),
    ];
  }
  if (kind === 'techEvents') {
    return (options.techEvents || []).map(({ id, title }) => [id, title]);
  }
  if (kind === 'filters') return filtersFor(options, rule, labels);
  if (kind === 'values') return valuesFor(options, rule);
  if (kind === 'timezones') {
    return options.timezones.map((zone) => [zone, zone.replace(/_/g, ' ')]);
  }
  return [];
};

/** A saved value's name, wherever the site still has one. */
const knownName = (options, kind, value) => {
  if (kind === 'kinds') {
    if (value === FEED) return '';
    return value;
  }
  if (kind === 'filters') {
    const row = (options.taxonomies || []).find((found) => found.id === value);
    return row?.title || value;
  }
  return value;
};

/** Choices plus anything saved that is no longer offered, and which. */
export const withSaved = (options, kind, choices, value, marked) => {
  if (!options) return { choices, missing: [] };
  const offered = new Set(choices.map(([id]) => id));
  const missing = list(value).filter(
    (saved) => typeof saved === 'string' && saved && !offered.has(saved),
  );
  return {
    choices: [
      ...choices,
      ...missing.map((saved) => [
        saved,
        `${knownName(options, kind, saved)} (${marked})`,
      ]),
    ],
    missing,
  };
};

const useOptions = () => {
  const path = getBaseUrl(useLocation().pathname);
  const [options, setOptions] = useState(null);

  useEffect(() => {
    let stopped = false;
    loadOptions(path).then((result) => {
      if (!stopped && result) setOptions(result);
    });
    return () => {
      stopped = true;
    };
  }, [path]);

  return options;
};

/** An item's name from what was picked, where that saves only a code. */
export const nameFromOptions = (options, item) => {
  if (!options || !item) return '';
  if (item.filterBy === 'all') {
    const titles = new Map(choicesFor(options, 'kinds'));
    return kindsOf(item)
      .map((kind) => titles.get(kind) || kind)
      .join(', ');
  }
  if (!item.filterBy || item.filterBy === 'tags') return '';
  const titles = new Map(valuesFor(options, item));
  return list(item.values)
    .map((value) => titles.get(value) || '')
    .filter(Boolean)
    .join(', ');
};

export const useOptionNames = () => {
  const options = useOptions();
  return (item) => nameFromOptions(options, item);
};

const SINGLE = ['techEvents', 'filters', 'timezones'];

/** Whether a step has nothing to ask: one answer, already the one saved. */
export const isOnlyAnswer = (kind, choices, value) => {
  if (kind === 'kinds') {
    const picked = list(value);
    return (
      choices.length === 1 &&
      choices[0][0] !== FEED &&
      (picked.length === 0 ||
        (picked.length === 1 && picked[0] === choices[0][0]))
    );
  }
  if (kind === 'techEvents') return choices.length <= 1 && !value;
  return false;
};

/** The tech event step is only for rules about sessions. */
export const asksTechEvent = (options, rule = {}) => {
  if (rule.techEvent) return true;
  if (SESSION_LISTS.includes(rule.filterBy)) return true;
  const sessions = sessionKinds(options);
  return kindsOf(rule).some((kind) => sessions.includes(kind));
};

const CalendarChoices = ({ choicesOf, rule, emptyText, ...props }) => {
  const intl = useIntl();
  const options = useOptions();
  const labels = {
    all: intl.formatMessage(messages.filterAll),
    tags: intl.formatMessage(messages.filterTags),
    feed: intl.formatMessage(messages.whatFeed),
  };
  const offered = choicesFor(options, choicesOf, rule, labels);
  const marked = intl.formatMessage(
    {
      kinds: messages.switchedOff,
      filters: messages.notOffered,
    }[choicesOf] || messages.gone,
  );
  const { choices, missing } =
    choicesOf === 'timezones'
      ? { choices: offered, missing: [] }
      : withSaved(options, choicesOf, offered, props.value, marked);

  if (options && isOnlyAnswer(choicesOf, choices, props.value)) return null;
  if (options && choicesOf === 'techEvents' && !asksTechEvent(options, rule)) {
    return null;
  }

  let { title, description } = props;
  if (choicesOf === 'values' && rule?.filterBy) {
    title =
      filtersFor(options, rule, labels).find(
        ([id]) => id === rule.filterBy,
      )?.[1] || title;
    if (rule.filterBy === 'tags') {
      description = intl.formatMessage(messages.tagsHelp);
    }
  }
  if (options && emptyText && !offered.length) description = emptyText;
  if (missing.length) {
    description = intl.formatMessage(
      {
        kinds: messages.kindSwitchedOff,
        filters: messages.listNotOffered,
        techEvents: messages.valuesGone,
        values: messages.valuesGone,
      }[choicesOf],
    );
  }

  const single = SINGLE.includes(choicesOf);
  return single ? (
    <SelectWidget
      {...props}
      title={title}
      // Volto's select reads its options once.
      key={options ? `ready-${choices.length}` : 'loading'}
      description={description}
      choices={choices}
      isClearable={choicesOf !== 'filters'}
    />
  ) : (
    <ArrayWidget
      {...props}
      title={title}
      key={
        options
          ? `ready-${rule?.filterBy || ''}-${rule?.techEvent || ''}`
          : 'loading'
      }
      description={description}
      choices={choices}
      items={{ choices }}
      value={Array.isArray(props.value) ? props.value : []}
    />
  );
};

export default CalendarChoices;
