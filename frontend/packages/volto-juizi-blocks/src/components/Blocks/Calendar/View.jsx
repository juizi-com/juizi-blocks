/**
 * Events calendar: a month, its filters and the list of its events.
 * See README.md for the behaviour and the accessibility decisions.
 */
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import { getColorTextStyle, isColorDark } from '../../../config/colors';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { blockAnchorId } from '../_shared/anchors';
import { paddingClasses } from '../_shared/choices';
import { isEditing } from '../_shared/editMode';
import { blockIdOf, headingLevels, levelAttrs } from '../_shared/headingLevel';
import {
  accentColour,
  INK,
  isPale,
  NEUTRAL,
  readsOnWhite,
  styleTypes,
  typeStyle,
} from './colours';
import {
  addDays,
  addMonths,
  fullDate,
  longDate,
  monthName,
  monthOf,
  monthWeeks,
} from './dates';
import EventList from './EventList';
import { buildDays, filterEvents, nextAfter, OTHER, overlaps } from './events';
import Grid from './Grid';
import { isFinished } from './items';
import messages from './messages';
import SubscribeMenu from './SubscribeMenu';
import useCalendar from './useCalendar';

import './calendar.scss';

// useLayoutEffect warns during the server render.
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const NO_EVENTS = [];
const NO_TYPES = [];
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** The page whose block this is, as an app path ('' is the site root). */
export const pagePath = ({ metadata, properties, pathname, path }) => {
  // Inside a grid `properties` is the grid, and only metadata has the page.
  const id = metadata?.['@id'] ?? properties?.['@id'];
  if (typeof id === 'string') return flattenToAppURL(id);
  return getBaseUrl(pathname || path || '');
};

/** The block's iCal file. */
export const calendarFileUrl = (path, blockId) => {
  const { apiPath = '', legacyTraverse } = config.settings || {};
  const prefix = legacyTraverse ? '' : '/++api++';
  return `${apiPath}${prefix}${
    path === '/' ? '' : path
  }/@@juizi-calendar.ics?block=${blockId}`;
};

const Chevron = ({ back }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={back ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Calendar = (props) => {
  const { data } = props;
  const intl = useIntl();
  const language = intl.locale;
  const isEdit = isEditing(props);
  const blockId = blockIdOf(props) || 'calendar';
  const path = pagePath(props);
  const id = `juizi-calendar-${blockId}`;

  const [chosenMonth, setChosenMonth] = useState('');
  const [selected, setSelected] = useState('');
  const [moved, setMoved] = useState('');
  const [filters, setFilters] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const card = useRef(null);
  const listHeading = useRef(null);
  const scroller = useRef(null);
  const [scrolls, setScrolls] = useState(false);
  const focusDay = useRef('');
  const toAnnounce = useRef('');

  const { month, result, shared, failed, loading, retry } = useCalendar({
    path,
    blockId,
    data,
    month: chosenMonth,
    isEdit,
  });

  const types = useMemo(
    () =>
      styleTypes(
        shared?.types || NO_TYPES,
        intl.formatMessage(messages.otherEvents),
      ),
    [shared, intl],
  );
  // A type can go while the editor works.
  const activeFilters = useMemo(
    () => filters.filter((key) => types.some((type) => type.id === key)),
    [filters, types],
  );
  const hasTypes = types.some((type) => type.id !== OTHER);

  const typeOf = useMemo(() => {
    const neutral = typeStyle(NEUTRAL);
    return (event) => {
      const found = types.filter((type) => event.types.includes(type.id));
      return {
        // The first in the editor's order gives the colour.
        style: found[0]?.style || neutral,
        names: hasTypes ? found.map((type) => type.label).join(', ') : '',
      };
    };
  }, [types, hasTypes]);

  const today = shared?.today || '';
  // The calendar's own choice, else the site's, which the server sends.
  const weekStart =
    { sunday: 6, monday: 0 }[data.weekStart] ??
    (result?.weekStart === 6 ? 6 : 0);
  const events = result?.events || NO_EVENTS;
  const weeks = useMemo(
    () => (month ? monthWeeks(month, weekStart) : []),
    [month, weekStart],
  );
  const days = useMemo(
    () => buildDays(weeks.flat(), events, activeFilters),
    [weeks, events, activeFilters],
  );
  const monthEvents = useMemo(() => {
    if (!month) return NO_EVENTS;
    const last = addDays(`${addMonths(month, 1)}-01`, -1);
    return events.filter((event) => overlaps(event, `${month}-01`, last));
  }, [events, month]);

  const inScope = selected
    ? events.filter((event) => overlaps(event, selected, selected))
    : monthEvents;
  const listed = filterEvents(inScope, activeFilters);
  const hiddenCount = inScope.length - listed.length;
  const monthLabel = month ? monthName(month, language) : '';

  const countText = listed.length
    ? intl.formatMessage(messages.eventCount, { count: listed.length })
    : intl.formatMessage(hiddenCount ? messages.noneShown : messages.noEvents);

  // One message once a change has settled; nothing as the page loads.
  useEffect(() => {
    if (!toAnnounce.current) return;
    if (failed) {
      setAnnouncement(intl.formatMessage(messages.loadFailed));
      toAnnounce.current = '';
      return;
    }
    if (!result) return;
    const names = types
      .filter((type) => activeFilters.includes(type.id))
      .map((type) => type.label);
    const when = selected ? fullDate(selected, language) : monthLabel;
    let first = [];
    if (toAnnounce.current === 'filter') {
      first = names.length ? names : [intl.formatMessage(messages.allEvents)];
    }
    setAnnouncement([...first, when, countText].join(', '));
    toAnnounce.current = '';
  }, [
    failed,
    result,
    selected,
    activeFilters,
    types,
    countText,
    monthLabel,
    language,
    intl,
  ]);

  useBrowserLayoutEffect(() => {
    if (!focusDay.current || !card.current) return;
    const button = card.current.querySelector(
      `[data-date="${focusDay.current}"]`,
    );
    if (button) {
      button.focus();
      focusDay.current = '';
    }
  });

  // A list that scrolls must be reachable by keyboard, also when nothing in
  // it is a link. One that doesn't scroll is no extra tab stop.
  useEffect(() => {
    const list = scroller.current;
    if (!list) return undefined;
    const check = () =>
      setScrolls(
        window.getComputedStyle(list).overflowY === 'auto' &&
          list.scrollHeight > list.clientHeight + 1,
      );
    check();
    if (!window.ResizeObserver) return undefined;
    const observer = new window.ResizeObserver(check);
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [month, result, selected, activeFilters]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [month, selected, activeFilters]);

  const levels = headingLevels(props.properties, blockId, {
    hasTitle: !!text(data.title),
  });
  const eventLevel = Math.min(4, levels.item + 1);

  // The day Tab lands on.
  let active = `${month}-01`;
  if (moved && monthOf(moved) === month) active = moved;
  else if (selected && monthOf(selected) === month) active = selected;
  else if (today && monthOf(today) === month) active = today;

  const goToMonth = (target) => {
    toAnnounce.current = 'month';
    setSelected('');
    setMoved('');
    setChosenMonth(target);
  };

  const goToDay = (day) => {
    toAnnounce.current = 'day';
    setChosenMonth(monthOf(day));
    setSelected(day);
    setMoved(day);
  };

  const selectDay = (day) => {
    if (day === selected) {
      toAnnounce.current = 'month';
      setSelected('');
      setMoved(day);
      return;
    }
    if (monthOf(day) !== month) focusDay.current = day;
    goToDay(day);
  };

  const moveTo = (day) => {
    focusDay.current = day;
    setMoved(day);
    if (monthOf(day) !== month) {
      toAnnounce.current = 'month';
      setSelected('');
      setChosenMonth(monthOf(day));
    }
  };

  const showWholeMonth = () => {
    toAnnounce.current = 'month';
    focusDay.current = selected;
    setMoved(selected);
    setSelected('');
  };

  // For buttons that go away when pressed: the list's heading takes focus.
  const focusList = () => listHeading.current?.focus();

  const toggleFilter = (key) => {
    toAnnounce.current = 'filter';
    setFilters(
      activeFilters.includes(key)
        ? activeFilters.filter((item) => item !== key)
        : [...activeFilters, key],
    );
  };

  const clearFilters = () => {
    toAnnounce.current = 'filter';
    setFilters([]);
  };

  const tryAgain = () => {
    toAnnounce.current = selected ? 'day' : 'month';
    focusList();
    retry();
  };

  const jumpTo = (day) => {
    focusList();
    goToDay(day);
  };

  // In the editor, keys pressed on the calendar's buttons stay with them.
  const keepKeys = (event) => {
    if (['Enter', ' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.stopPropagation();
    }
  };

  const title = text(data.title);
  const subscribe = data.showSubscribe && (
    <SubscribeMenu
      href={calendarFileUrl(path, blockId)}
      fileName={`${(path.split('/').pop() || 'calendar').slice(0, 60)}.ics`}
      isEdit={isEdit}
    />
  );
  const intro = text(data.description);
  const background =
    data.backgroundColor && data.backgroundColor !== 'transparent'
      ? data.backgroundColor
      : '';
  const accent = accentColour(data.accentColor);

  const items = Array.isArray(data.items) ? data.items : [];
  const unfinished = items.filter((item) => !isFinished(item)).length;
  const pale = types.filter(
    (type) => type.id !== OTHER && type.color && isPale(type.color),
  );
  const failedNames = types
    .filter((type) => result?.failed?.includes(type.id))
    .map((type) => type.label)
    .filter(Boolean);
  const anyFeedFailed = !!result?.failed?.length;
  const stale = isEdit ? result?.stale || [] : [];

  let next = null;
  if (result && !inScope.length) {
    next = selected ? nextAfter(events, selected) : result.next;
  }

  return (
    <section
      id={title ? blockAnchorId(title, blockId) : undefined}
      className={cx(
        'juizi-calendar',
        'juizi-block',
        ...paddingClasses('juizi-calendar', data),
        background && (isColorDark(background) ? 'bg-dark' : 'bg-light'),
        data.customClass,
      )}
      style={
        background
          ? { backgroundColor: background, ...getColorTextStyle(background) }
          : undefined
      }
      aria-labelledby={title ? `${id}-title` : month ? `${id}-month` : null}
    >
      <div className="juizi-calendar__inner">
        {title && (
          <div className="juizi-calendar__header">
            <h2
              id={`${id}-title`}
              className="juizi-calendar__title"
              {...levelAttrs(levels.title, 2)}
            >
              {title}
            </h2>
            {subscribe}
          </div>
        )}
        {!title && subscribe && (
          <div className="juizi-calendar__header juizi-calendar__header--bare">
            {subscribe}
          </div>
        )}
        {intro && <p className="juizi-calendar__intro">{intro}</p>}

        {isEdit && !items.length && (
          <EditHint isEditMode={isEdit}>
            {intl.formatMessage(messages.noItemsHint)}
          </EditHint>
        )}
        {isEdit && unfinished > 0 && (
          <EditHint isEditMode={isEdit} tone="warning" live>
            {intl.formatMessage(messages.unfinishedItems, {
              count: unfinished,
            })}
          </EditHint>
        )}
        {isEdit && data.accentColor && !readsOnWhite(data.accentColor) && (
          <EditHint isEditMode={isEdit} tone="warning" live>
            {intl.formatMessage(messages.accentWarning)}
          </EditHint>
        )}
        {stale.map(({ id, days }) => (
          <EditHint key={id} isEditMode={isEdit} tone="warning" live>
            {intl.formatMessage(messages.staleWarning, {
              name: types.find((type) => type.id === id)?.label || '',
              count: days,
            })}
          </EditHint>
        ))}
        {isEdit && pale.length > 0 && (
          <EditHint isEditMode={isEdit} tone="warning" live>
            {intl.formatMessage(messages.paleWarning, {
              names: pale.map((type) => type.label).join(', '),
            })}
          </EditHint>
        )}

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          ref={card}
          className="juizi-calendar__card"
          style={{ '--calendar-accent': accent, '--calendar-ink': INK }}
          aria-busy={loading}
          onKeyDown={isEdit ? keepKeys : undefined}
        >
          {/* Present, and empty, from the first render. */}
          <p role="status" className="visually-hidden">
            {announcement}
          </p>

          {month && (
            <>
              <div className="juizi-calendar__toolbar">
                <div className="juizi-calendar__nav">
                  <button
                    type="button"
                    className="juizi-calendar__arrow"
                    onClick={() => goToMonth(addMonths(month, -1))}
                    aria-label={intl.formatMessage(messages.previousMonth, {
                      month: monthName(addMonths(month, -1), language),
                    })}
                  >
                    <Chevron back />
                  </button>
                  <h3
                    id={`${id}-month`}
                    className="juizi-calendar__month"
                    data-no-toc=""
                    {...levelAttrs(levels.item, 3)}
                  >
                    {monthLabel}
                  </h3>
                  <button
                    type="button"
                    className="juizi-calendar__arrow"
                    onClick={() => goToMonth(addMonths(month, 1))}
                    aria-label={intl.formatMessage(messages.nextMonth, {
                      month: monthName(addMonths(month, 1), language),
                    })}
                  >
                    <Chevron />
                  </button>
                  {today && (
                    <button
                      type="button"
                      className="juizi-calendar__today"
                      onClick={() => goToDay(today)}
                    >
                      {intl.formatMessage(messages.today)}
                    </button>
                  )}
                </div>

                {hasTypes && (
                  <div
                    role="group"
                    className="juizi-calendar__filters"
                    aria-label={intl.formatMessage(messages.filters)}
                  >
                    <button
                      type="button"
                      className="juizi-calendar__filter"
                      aria-pressed={!activeFilters.length}
                      onClick={clearFilters}
                    >
                      {intl.formatMessage(messages.allEvents)}
                    </button>
                    {types.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className="juizi-calendar__filter"
                        aria-pressed={activeFilters.includes(type.id)}
                        style={type.style}
                        onClick={() => toggleFilter(type.id)}
                      >
                        <span
                          className="juizi-calendar__dot"
                          aria-hidden="true"
                        />
                        {type.label}
                        {result &&
                          !monthEvents.some((event) =>
                            event.types.includes(type.id),
                          ) && (
                            <span className="visually-hidden">
                              , {intl.formatMessage(messages.noEvents)}
                            </span>
                          )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="juizi-calendar__layout">
                <div className="juizi-calendar__month-grid">
                  <Grid
                    id={id}
                    month={month}
                    weeks={weeks}
                    days={days}
                    today={today}
                    selected={selected}
                    active={active}
                    filtered={activeFilters.length > 0}
                    typeOf={typeOf}
                    labelledBy={`${id}-month`}
                    onMove={moveTo}
                    onSelect={selectDay}
                  />
                  {selected && result && (
                    <p className="juizi-calendar__day-summary">
                      <span>
                        {longDate(selected, language)}: {countText}
                      </span>
                      <button
                        type="button"
                        className="juizi-calendar__text-button"
                        onClick={focusList}
                      >
                        {intl.formatMessage(messages.viewEvents)}
                      </button>
                    </p>
                  )}
                </div>

                <div className="juizi-calendar__agenda">
                  <div
                    ref={scroller}
                    className="juizi-calendar__scroller"
                    role={scrolls ? 'group' : undefined}
                    aria-labelledby={scrolls ? `${id}-list` : undefined}
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={scrolls ? 0 : undefined}
                  >
                    <h3
                      id={`${id}-list`}
                      ref={listHeading}
                      tabIndex={-1}
                      className="juizi-calendar__list-title"
                      data-no-toc=""
                      {...levelAttrs(levels.item, 3)}
                    >
                      {selected
                        ? fullDate(selected, language)
                        : intl.formatMessage(messages.eventsIn, {
                            month: monthLabel,
                          })}
                    </h3>
                    {selected && (
                      <button
                        type="button"
                        className="juizi-calendar__text-button"
                        onClick={showWholeMonth}
                      >
                        {intl.formatMessage(messages.showMonth, {
                          month: monthLabel,
                        })}
                      </button>
                    )}

                    {loading && (
                      <div
                        className="juizi-calendar__skeleton"
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    )}

                    {anyFeedFailed && (
                      <div className="juizi-calendar__notice">
                        <p>
                          {failedNames.length
                            ? intl.formatMessage(messages.feedFailed, {
                                names: failedNames.join(', '),
                              })
                            : intl.formatMessage(messages.loadFailed)}
                        </p>
                        <button
                          type="button"
                          className="juizi-calendar__text-button"
                          onClick={tryAgain}
                        >
                          {intl.formatMessage(messages.retry)}
                        </button>
                      </div>
                    )}

                    {result && listed.length > 0 && (
                      <EventList
                        events={listed}
                        typeOf={typeOf}
                        level={eventLevel}
                        year={month.slice(0, 4)}
                      />
                    )}

                    {result && !listed.length && (
                      <p className="juizi-calendar__empty">
                        {hiddenCount
                          ? intl.formatMessage(messages.hiddenByFilters, {
                              count: hiddenCount,
                            })
                          : intl.formatMessage(
                              selected
                                ? messages.emptyDay
                                : messages.emptyMonth,
                              { month: monthLabel },
                            )}
                      </p>
                    )}
                    {result && !listed.length && hiddenCount > 0 && (
                      <button
                        type="button"
                        className="juizi-calendar__text-button"
                        onClick={() => {
                          focusList();
                          clearFilters();
                        }}
                      >
                        {intl.formatMessage(messages.showAll)}
                      </button>
                    )}
                    {next && (
                      <button
                        type="button"
                        className="juizi-calendar__text-button"
                        onClick={() => jumpTo(next)}
                      >
                        {intl.formatMessage(messages.nextEvent, {
                          date: longDate(
                            next,
                            language,
                            next.slice(0, 4) !== month.slice(0, 4),
                          ),
                        })}
                      </button>
                    )}

                    {result?.timezoneDiffers && (
                      <p className="juizi-calendar__zone">
                        {intl.formatMessage(messages.timesIn, {
                          zone: result.timezone
                            .split('/')
                            .pop()
                            .replace(/_/g, ' '),
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {!month && loading && (
            <p className="juizi-calendar__empty">
              {intl.formatMessage(messages.loading)}
            </p>
          )}
          {failed && (
            <div className="juizi-calendar__notice">
              <p>{intl.formatMessage(messages.loadFailed)}</p>
              <button
                type="button"
                className="juizi-calendar__text-button"
                onClick={tryAgain}
              >
                {intl.formatMessage(messages.retry)}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const View = (props) => (
  <BlockWrapper {...props}>
    <BlockErrorBoundary
      blockClass="juizi-calendar"
      isEditMode={isEditing(props)}
      resetKey={JSON.stringify(props.data)}
    >
      {/* A new page starts again on its own month. */}
      <Calendar key={pagePath(props)} {...props} />
    </BlockErrorBoundary>
  </BlockWrapper>
);

export default View;
