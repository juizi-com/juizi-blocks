import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { readPo, renderWithIntl } from '../_shared/testUtils';
import { addMonths, addMonthsToDay, monthWeeks } from './dates';
import { buildDays, filterEvents } from './events';
import { accentColour, INK, typeStyle } from './colours';
import { isFinished, nameItems, tidyWhat, upgradeItem } from './items';
import calendarSchema, { extendItem, itemFields } from './schema';
import { clearStale, move } from './ItemsWidget';
import {
  asksTechEvent,
  filtersFor,
  isOnlyAnswer,
  nameFromOptions,
  valuesFor,
  withSaved,
} from './widgets';
import View, { pagePath } from './View';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('@plone/volto/helpers/Api/Api', () => ({
  __esModule: true,
  default: function Api() {
    this.get = mockGet;
    this.post = mockPost;
  },
}));
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: { settings: { apiPath: 'https://example.org' }, blocks: {} },
}));
jest.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url) => url.replace('https://example.org', ''),
  getBaseUrl: (url) => url.replace(/\/(edit|add)$/, ''),
  expandToBackendURL: (url) => url,
  isInternalURL: (url) => !/^https?:/.test(url),
}));
jest.mock(
  '@plone/volto/components/manage/UniversalLink/UniversalLink',
  () =>
    ({ href, children, ...rest }) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
);
jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: () => () => null,
  schemaData: (args) => args.data || {},
}));
jest.mock('../_shared/BlockWrapper', () => ({ children }) => (
  <div className="block">{children}</div>
));

const event = (id, start, end = start, extra = {}) => ({
  id,
  title: id,
  start,
  end,
  allDay: false,
  openEnd: false,
  startTime: '14:00',
  endTime: '16:00',
  startISO: `${start}T14:00:00+02:00`,
  endISO: `${end}T16:00:00+02:00`,
  url: `https://example.org/${id}`,
  description: '',
  location: '',
  language: '',
  types: ['sport'],
  ...extra,
});

const MONTH = {
  month: '2026-11',
  today: '2026-11-22',
  weekStart: 0,
  timezone: 'Africa/Johannesburg',
  timezoneDiffers: false,
  types: [
    { id: 'sport', label: 'Sport', color: '' },
    { id: 'music', label: 'Music', color: '' },
    { id: '_other', label: '', color: '' },
  ],
  events: [
    event('exams', '2026-10-21', '2026-11-27', {
      allDay: true,
      startTime: '',
      endTime: '',
      types: ['_other'],
    }),
    event('match', '2026-11-04'),
    event('concert', '2026-11-04', '2026-11-04', { types: ['music'] }),
    event('holiday', '2026-11-09', '2026-11-09', { url: '' }),
  ],
  failed: [],
  pending: [],
  next: null,
};
const monthFor = (month) =>
  month && month !== '2026-11'
    ? { ...MONTH, month, events: [], next: null }
    : MONTH;

const BLOCK = {
  '@type': 'juiziCalendar',
  items: [{ '@id': 'sport', source: 'tags', tags: ['Sport'] }],
  calendarData: MONTH,
};

const show = async (data = {}, props = {}) => {
  let rendered;
  await act(async () => {
    rendered = renderWithIntl(
      <View
        id="cal"
        data={{ ...BLOCK, ...data }}
        properties={{ '@id': '/events' }}
        {...props}
      />,
    );
  });
  return rendered;
};

const day = (container, iso) =>
  container.querySelector(`button[data-date="${iso}"]`);
const status = () => screen.getByRole('status').textContent;
const listed = (container) =>
  [...container.querySelectorAll('.juizi-calendar__event-title')].map(
    (heading) => heading.textContent,
  );

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockGet.mockImplementation((url, { params }) =>
    Promise.resolve(monthFor(params.month)),
  );
  mockPost.mockImplementation((url, { data }) =>
    Promise.resolve(monthFor(data.month)),
  );
});

describe('dates', () => {
  it('pads a month to whole weeks', () => {
    const monday = monthWeeks('2026-11', 0);
    expect(monday[0][0]).toBe('2026-10-26');
    expect(monday[monday.length - 1][6]).toBe('2026-12-06');
    expect(monthWeeks('2026-11', 6)[0][0]).toBe('2026-11-01');
  });

  it('crosses years and clamps to the month’s end', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonthsToDay('2027-01-31', 1)).toBe('2027-02-28');
  });
});

describe('days', () => {
  it('draws long events as bars and keeps the room for short ones', () => {
    const days = buildDays(['2026-11-03', '2026-11-04'], MONTH.events);
    expect(days['2026-11-03'].labels[0].id).toBe('exams'); // named once
    expect(days['2026-11-04'].labels.map(({ id }) => id)).toEqual([
      'match',
      'concert',
    ]);
    expect(days['2026-11-04'].bars[0].event.id).toBe('exams');
  });

  it('keeps a week’s bars in the same rows', () => {
    const week = monthWeeks('2026-11', 0)[4];
    const days = buildDays(week, MONTH.events);
    expect(new Set(week.map((day) => days[day].bars.length))).toEqual(
      new Set([1]),
    );
  });

  it('widens with each type chosen', () => {
    expect(filterEvents(MONTH.events, [])).toHaveLength(4);
    expect(filterEvents(MONTH.events, ['music'])).toHaveLength(1);
    expect(filterEvents(MONTH.events, ['music', 'sport'])).toHaveLength(3);
  });
});

describe('colours', () => {
  it('never puts pale colours behind white or in text', () => {
    expect(accentColour('#ffee88')).toBe(INK);
    const pale = typeStyle('#ffee88');
    expect(pale['--event-text']).toBe(INK);
    expect(pale['--event-edge']).not.toBe('transparent');
  });

  it('uses a dark colour as it is', () => {
    expect(accentColour('#253b7f')).toBe('#253b7f');
    expect(typeStyle('#253b7f')['--event-text']).toBe('#253b7f');
  });
});

describe('view', () => {
  it('shows the month that came with the page, announcing nothing', async () => {
    const { container } = await show();
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeTruthy();
    expect(listed(container)).toEqual(['exams', 'match', 'concert', 'holiday']);
    expect(status()).toBe('');
  });

  it('is one tab stop, starting on today', async () => {
    const { container } = await show();
    const stops = container.querySelectorAll('[role="grid"] [tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0].dataset.date).toBe('2026-11-22');
    expect(stops[0].getAttribute('aria-current')).toBe('date');
  });

  it('names a day by its date and count, described by its events', async () => {
    const { container } = await show();
    const button = day(container, '2026-11-04');
    expect(button.textContent).toContain('Wednesday 4 November 2026, 3 events');
    const described = document.getElementById(
      button.getAttribute('aria-describedby'),
    );
    expect(described.textContent).toContain('match, Sport');
  });

  it('keeps links out of the grid', async () => {
    await show();
    expect(screen.getByRole('grid').querySelector('a')).toBeNull();
  });

  it('doesn’t link an entry with no page', async () => {
    const { container } = await show();
    const title = [
      ...container.querySelectorAll('.juizi-calendar__event-title'),
    ].find((heading) => heading.textContent === 'holiday');
    expect(title.querySelector('a')).toBeNull();
  });

  it('follows the block’s heading levels', async () => {
    const { container } = await show({ title: 'What’s on' });
    const level = (selector) => {
      const heading = container.querySelector(selector);
      return Number(
        heading.getAttribute('aria-level') || heading.tagName.slice(1),
      );
    };
    const title = level('.juizi-calendar__title');
    expect(level('.juizi-calendar__month')).toBe(title + 1);
    expect(level('.juizi-calendar__event-title')).toBe(title + 2);
  });

  it('selects a day, and clears it when clicked again', async () => {
    const { container } = await show();
    await act(async () => {
      fireEvent.click(day(container, '2026-11-04'));
    });
    expect(listed(container)).toEqual(['exams', 'match', 'concert']);
    expect(status()).toBe('Wednesday 4 November 2026, 3 events');
    expect(container.querySelectorAll('[aria-selected="true"]')).toHaveLength(
      1,
    );
    await act(async () => {
      fireEvent.click(day(container, '2026-11-04'));
    });
    expect(listed(container)).toHaveLength(4);
  });

  it('filters with pressed buttons, any of those chosen', async () => {
    const { container } = await show();
    const music = screen.getByRole('button', { name: /^Music/ });
    await act(async () => {
      fireEvent.click(music);
    });
    expect(music.getAttribute('aria-pressed')).toBe('true');
    expect(listed(container)).toEqual(['concert']);
    expect(status()).toBe('Music, November 2026, 1 event');
    expect(day(container, '2026-11-09').textContent).toContain(
      'no events shown, 2 hidden by filters',
    );
  });

  it('moves by arrows, Home and End', async () => {
    const { container } = await show();
    day(container, '2026-11-22').focus();
    const press = async (key) =>
      act(async () => {
        fireEvent.keyDown(document.activeElement, { key });
      });
    await press('ArrowUp');
    expect(document.activeElement.dataset.date).toBe('2026-11-15');
    await press('Home');
    expect(document.activeElement.dataset.date).toBe('2026-11-09');
    await press('End');
    expect(document.activeElement.dataset.date).toBe('2026-11-15');
  });

  it('stays put on Home at a week’s start, and leaves focus alone', async () => {
    const { container } = await show();
    const monday = day(container, '2026-11-09');
    monday.focus();
    await act(async () => {
      fireEvent.keyDown(monday, { key: 'Home' });
    });
    const music = screen.getByRole('button', { name: /^Music/ });
    music.focus();
    await act(async () => {
      fireEvent.click(music);
    });
    expect(document.activeElement).toBe(music);
  });

  it('changes month by Page Down, taking focus along', async () => {
    const { container } = await show();
    const start = day(container, '2026-11-22');
    start.focus();
    await act(async () => {
      fireEvent.keyDown(start, { key: 'PageDown' });
    });
    expect(document.activeElement.dataset.date).toBe('2026-12-22');
    await waitFor(() => expect(status()).toBe('December 2026, no events'));
    expect(mockGet).toHaveBeenCalledWith('/events/@juizi-calendar', {
      params: { block: 'cal', month: '2026-12' },
    });
  });

  it('gives the month back its tab stop after Show all of', async () => {
    const { container } = await show();
    await act(async () => {
      fireEvent.click(day(container, '2026-11-04'));
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Show all of November 2026' }),
      );
    });
    expect(document.activeElement.dataset.date).toBe('2026-11-04');
  });

  it('says when a month can’t be loaded, and tries again', async () => {
    await show();
    mockGet.mockImplementation(() => Promise.reject(new Error('down')));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Next month/ }));
    });
    await waitFor(() =>
      expect(status()).toBe('The events couldn’t be loaded.'),
    );
    mockGet.mockImplementation((url, { params }) =>
      Promise.resolve(monthFor(params.month)),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    });
    await waitFor(() => expect(status()).toBe('December 2026, no events'));
  });

  it('says which calendar failed and keeps the other events', async () => {
    const broken = { ...MONTH, failed: ['music'] };
    mockGet.mockImplementation(() => Promise.resolve(broken));
    const { container } = await show({ calendarData: broken });
    expect(
      screen.getByText('These events couldn’t be loaded: Music.'),
    ).toBeTruthy();
    expect(listed(container)).toHaveLength(4);
  });

  it('shows editors’ hints to editors only', async () => {
    const unfinished = { items: [{ '@id': 'a', source: 'tags' }] };
    const visitor = await show(unfinished);
    expect(visitor.container.textContent).not.toMatch(/isn’t finished/);
    visitor.unmount();
    const editor = await show(unfinished, { isEditMode: true });
    expect(editor.container.textContent).toMatch(/isn’t finished/);
  });

  it('works in French', async () => {
    const po = readPo('fr');
    const messages = Object.fromEntries(
      Object.entries(po).map(([id, entry]) => [id, entry.translation]),
    );
    let rendered;
    await act(async () => {
      rendered = renderWithIntl(
        <View id="cal" data={BLOCK} properties={{ '@id': '/events' }} />,
        { locale: 'fr', messages },
      );
    });
    expect(rendered.container.textContent).toContain(
      'Événements : novembre 2026',
    );
  });

  it('asks the page, also from inside a grid', () => {
    expect(
      pagePath({
        metadata: { '@id': 'https://example.org/en/events' },
        properties: { blocks: {} },
      }),
    ).toBe('/en/events');
    expect(pagePath({ pathname: '/events/edit' })).toBe('/events');
  });
});

describe('a calendar that stopped updating', () => {
  const stale = (month) => ({
    ...monthFor(month),
    types: [{ id: 'sport', label: 'Sport', color: '' }],
    stale: [{ id: 'sport', days: 3 }],
  });

  it('warns the editor', async () => {
    mockPost.mockImplementation((url, { data }) =>
      Promise.resolve(stale(data.month)),
    );
    await show({}, { isEditMode: true });
    expect(
      await screen.findByText(
        'Sport: last updated 3 days ago. Check the link.',
        {},
        { timeout: 3000 },
      ),
    ).toBeTruthy();
  });

  it('says nothing to visitors', async () => {
    mockGet.mockImplementation((url, { params }) =>
      Promise.resolve(stale(params.month)),
    );
    await show();
    expect(screen.queryByText(/last updated/)).toBeNull();
  });
});

describe('sidebar', () => {
  const options = {
    tags: ['Sport'],
    kinds: [
      { id: 'Event', title: 'Event', session: false, lists: ['themes'] },
      { id: 'Talk', title: 'Talk', session: true, lists: [] },
    ],
    taxonomies: [
      {
        id: 'themes',
        title: 'Event themes',
        offered: true,
        terms: [['b2', 'Arts']],
      },
      {
        id: 'campus',
        title: 'Campus',
        offered: false,
        terms: [['c1', 'North']],
      },
    ],
    sessionLists: [{ id: 'session_track', title: 'Track' }],
    techEvents: [
      {
        id: 'u1',
        title: 'Conf',
        lists: { session_track: [['a1', 'Colloquium']] },
      },
      { id: 'u2', title: 'Sprint', lists: { session_track: [['a2', 'Docs']] } },
    ],
    feeds: true,
  };

  it('asks what, then which ones, then the values', () => {
    expect(itemFields({})).toEqual(['what', 'techEvent', 'filterBy']);
    expect(itemFields({ what: ['feed'] })).toEqual([
      'what',
      'feed',
      'label',
      'color',
    ]);
    expect(itemFields({ what: ['Event'], filterBy: 'all' })).not.toContain(
      'values',
    );
    expect(itemFields({ filterBy: 'tags' })).toContain('values');
  });

  it('offers and / or from the second value', () => {
    expect(itemFields({ filterBy: 'tags', values: ['a'] })).not.toContain(
      'match',
    );
    expect(itemFields({ filterBy: 'tags', values: ['a', 'b'] })).toContain(
      'match',
    );
  });

  it('names every field', () => {
    const intl = { formatMessage: ({ defaultMessage }) => defaultMessage };
    const schema = calendarSchema({ intl, data: { items: [{}] } });
    const item = schema.properties.items.schema;
    [schema, item].forEach(({ properties }) =>
      Object.entries(properties).forEach(([field, { title }]) =>
        expect([field, typeof title]).toEqual([field, 'string']),
      ),
    );
  });

  it('has only fields it defines', () => {
    const schema = calendarSchema({ data: { items: [{}] } });
    schema.fieldsets
      .flatMap(({ fields }) => fields)
      .forEach((field) => expect(schema.properties[field]).toBeTruthy());
    const item = schema.properties.items.schema;
    [{}, { what: ['feed'] }, { filterBy: 'all' }, { filterBy: 'tags' }].forEach(
      (rule) =>
        extendItem(item, rule).fieldsets[0].fields.forEach((field) =>
          expect(item.properties[field]).toBeTruthy(),
        ),
    );
  });

  it('turns older rules into the new shape', () => {
    expect(
      upgradeItem({ '@id': 'a', source: 'tags', tags: ['Sport'] }),
    ).toEqual({ '@id': 'a', what: [], filterBy: 'tags', values: ['Sport'] });
    expect(
      upgradeItem({ source: 'taxonomy', taxonomy: 'themes', terms: ['b2'] }),
    ).toEqual({ what: [], filterBy: 'themes', values: ['b2'] });
    expect(
      upgradeItem({
        source: 'session',
        sessionList: 'session_track',
        sessionTerms: ['a1'],
      }),
    ).toEqual({ what: [], filterBy: 'session_track', values: ['a1'] });
    expect(upgradeItem({ source: 'type', types: ['Break', 'Slot'] })).toEqual({
      what: ['Break', 'Slot'],
      filterBy: 'all',
    });
    expect(upgradeItem({ source: 'feed', feed: 'x', color: 'red' })).toEqual({
      what: ['feed'],
      feed: 'x',
      color: 'red',
    });
    const done = { what: ['Event'], filterBy: 'all' };
    expect(upgradeItem(done)).toBe(done);
  });

  it('keeps another calendar apart from kinds of event', () => {
    expect(tidyWhat(['Event', 'feed'])).toEqual(['feed']);
    expect(tidyWhat(['feed', 'Event'])).toEqual(['Event']);
    expect(tidyWhat(['any', 'Event'])).toEqual(['Event']);
  });

  it('offers the lists that fit the kinds picked', () => {
    const ids = (rule) => filtersFor(options, rule).map(([id]) => id);
    // Any kind: no "all of them", every list offered, tracks for sessions.
    expect(ids({})).toEqual(['tags', 'themes', 'session_track']);
    expect(ids({ what: ['Event'] })).toEqual(['all', 'tags', 'themes']);
    expect(ids({ what: ['Talk'] })).toEqual(['all', 'tags', 'session_track']);
  });

  it('takes terms from the tech event picked', () => {
    const rule = { filterBy: 'session_track' };
    expect(valuesFor(options, rule)).toEqual([
      ['a1', 'Colloquium'],
      ['a2', 'Docs'],
    ]);
    expect(valuesFor(options, { ...rule, techEvent: 'u2' })).toEqual([
      ['a2', 'Docs'],
    ]);
    expect(valuesFor(options, { filterBy: 'campus' })).toEqual([
      ['c1', 'North'],
    ]);
  });

  it('asks for a tech event only about sessions', () => {
    expect(asksTechEvent(options, { what: ['Event'] })).toBe(false);
    expect(asksTechEvent(options, { what: ['Event', 'Talk'] })).toBe(true);
    expect(asksTechEvent(options, { filterBy: 'session_track' })).toBe(true);
  });

  it('skips a step with only one answer', () => {
    expect(isOnlyAnswer('kinds', [['Event', 'Event']], [])).toBe(true);
    expect(isOnlyAnswer('kinds', [['Event', 'Event']], ['Event'])).toBe(true);
    expect(
      isOnlyAnswer(
        'kinds',
        [
          ['Event', 'Event'],
          ['feed', 'Another'],
        ],
        [],
      ),
    ).toBe(false);
    expect(isOnlyAnswer('techEvents', [['u1', 'Conf']], undefined)).toBe(true);
  });

  it('keeps what a saved calendar uses, marked', () => {
    const { choices, missing } = withSaved(
      options,
      'filters',
      [['tags', 'Tags']],
      'campus',
      'no longer offered',
    );
    expect(missing).toEqual(['campus']);
    expect(choices[1]).toEqual(['campus', 'Campus (no longer offered)']);
  });

  it('empties the values when another list is picked', () => {
    const before = [{ '@id': 'a', filterBy: 'tags', values: ['x'] }];
    const after = [{ '@id': 'a', filterBy: 'themes', values: ['x'] }];
    expect(clearStale(before, after)).toEqual([
      { '@id': 'a', filterBy: 'themes' },
    ]);
    expect(clearStale(before, before)).toEqual(before);
  });

  it('moves items, stopping at the ends', () => {
    const items = ['a', 'b', 'c'];
    expect(move(items, 1, 0)).toEqual(['b', 'a', 'c']);
    expect(move(items, 2, 3)).toBe(items);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('names an item from what was picked', () => {
    expect(
      nameFromOptions(options, { filterBy: 'themes', values: ['b2'] }),
    ).toBe('Arts');
    expect(
      nameFromOptions(options, {
        filterBy: 'session_track',
        techEvent: 'u1',
        values: ['a1'],
      }),
    ).toBe('Colloquium');
    expect(nameFromOptions(options, { what: ['Talk'], filterBy: 'all' })).toBe(
      'Talk',
    );
    expect(nameFromOptions(null, { filterBy: 'themes' })).toBe('');
  });

  it('names and judges items', () => {
    expect(nameItems([{ source: 'tags', tags: ['Sport'] }])[0].title).toBe(
      'Sport',
    );
    expect(isFinished({ filterBy: 'themes' })).toBe(false);
    expect(isFinished({ filterBy: 'themes', values: ['a'] })).toBe(true);
    expect(isFinished({ what: ['any'], filterBy: 'all' })).toBe(false);
    expect(isFinished({ what: ['feed'], feed: 'x' })).toBe(true);
    expect(isFinished({ source: 'taxonomy', terms: ['a'] })).toBe(false);
    expect(isFinished({ source: 'tags', tags: ['a'] })).toBe(true);
  });
});
