/**
 * The month: an ARIA date grid.
 *
 * One tab stop. Arrows, Home, End, Page Up and Page Down move; Enter and
 * Space select (the button's own click). Each day is one button named by
 * date and count, described by its events; what's drawn inside it is hidden
 * from screen readers, and the list has the links.
 */
import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { addDays, addMonthsToDay, dayName, fullDate, monthOf } from './dates';
import { LABELS_PER_DAY } from './events';
import messages from './messages';

const DOTS_PER_DAY = 3;

const dayLabel = (intl, day, info, filtered) => {
  let count;
  if (info.all.length) {
    count = intl.formatMessage(messages.eventCount, { count: info.all.length });
  } else {
    count = intl.formatMessage(
      filtered && info.hidden ? messages.noneShown : messages.noEvents,
    );
  }
  const hidden =
    filtered && info.hidden
      ? `, ${intl.formatMessage(messages.hiddenCount, { count: info.hidden })}`
      : '';
  return `${fullDate(day, intl.locale)}, ${count}${hidden}`;
};

const Grid = ({
  id,
  month,
  weeks,
  days,
  today,
  selected,
  active,
  filtered,
  typeOf,
  labelledBy,
  onMove,
  onSelect,
}) => {
  const intl = useIntl();

  const onKeyDown = (event, day, week) => {
    const target = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => week[0],
      End: () => week[week.length - 1],
      PageUp: () => addMonthsToDay(day, -1),
      PageDown: () => addMonthsToDay(day, 1),
    }[event.key];
    if (target) {
      event.preventDefault();
      event.stopPropagation();
      const next = target();
      // Home on the first day of a week goes nowhere.
      if (next !== day) onMove(next);
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Volto's editor would add a block on Enter.
      event.stopPropagation();
    }
  };

  return (
    <>
      <p id={`${id}-help`} className="visually-hidden">
        {intl.formatMessage(messages.gridHelp)}
      </p>
      {/* The roles are spelled out because the stylesheet lays the table out
          as a grid, which makes some browsers forget them. */}
      {/* eslint-disable jsx-a11y/no-redundant-roles */}
      <table
        role="grid"
        className="juizi-calendar__grid"
        aria-labelledby={labelledBy}
        aria-describedby={`${id}-help`}
      >
        <thead role="rowgroup">
          <tr role="row" className="juizi-calendar__week">
            {weeks[0].map((day) => (
              <th
                key={dayName(day, 'en')}
                role="columnheader"
                scope="col"
                className="juizi-calendar__weekday"
              >
                <span className="visually-hidden">
                  {dayName(day, intl.locale)}
                </span>
                <span aria-hidden="true">
                  {dayName(day, intl.locale, 'short')}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {weeks.map((week) => (
            <tr key={week[0]} role="row" className="juizi-calendar__week">
              {week.map((day) => {
                const info = days[day];
                const descriptionId = `${id}-day-${day}`;
                const isSelected = day === selected;
                const extra = info.short.length - LABELS_PER_DAY;
                const extraDots = info.short.length - DOTS_PER_DAY;
                return (
                  <td
                    key={day}
                    role="gridcell"
                    aria-selected={isSelected}
                    className={cx('juizi-calendar__cell', {
                      'juizi-calendar__cell--outside': monthOf(day) !== month,
                      'juizi-calendar__cell--selected': isSelected,
                      'juizi-calendar__cell--today': day === today,
                    })}
                  >
                    <button
                      type="button"
                      className="juizi-calendar__day"
                      data-date={day}
                      tabIndex={day === active ? 0 : -1}
                      aria-current={day === today ? 'date' : undefined}
                      aria-describedby={
                        info.all.length ? descriptionId : undefined
                      }
                      onClick={() => onSelect(day)}
                      onKeyDown={(event) => onKeyDown(event, day, week)}
                    >
                      <span className="visually-hidden">
                        {dayLabel(intl, day, info, filtered)}
                      </span>
                      <span
                        className="juizi-calendar__number"
                        aria-hidden="true"
                      >
                        {Number(day.slice(8))}
                      </span>
                      <span
                        className="juizi-calendar__labels"
                        aria-hidden="true"
                      >
                        {info.labels.slice(0, LABELS_PER_DAY).map((event) => (
                          <span
                            key={event.id}
                            className="juizi-calendar__label"
                            style={typeOf(event).style}
                          >
                            {event.title}
                          </span>
                        ))}
                        {extra > 0 && (
                          <span className="juizi-calendar__more">
                            {intl.formatMessage(messages.moreShort, {
                              count: extra,
                            })}
                          </span>
                        )}
                      </span>
                      <span className="juizi-calendar__dots" aria-hidden="true">
                        {info.short.slice(0, DOTS_PER_DAY).map((event) => (
                          <span
                            key={event.id}
                            className="juizi-calendar__dot"
                            style={typeOf(event).style}
                          />
                        ))}
                        {extraDots > 0 && (
                          <span className="juizi-calendar__more">
                            +{extraDots}
                          </span>
                        )}
                      </span>
                      {info.bars.length > 0 && (
                        <span
                          className="juizi-calendar__bars"
                          aria-hidden="true"
                        >
                          {Array.from(info.bars, (bar, row) => (
                            <span
                              // eslint-disable-next-line react/no-array-index-key
                              key={row}
                              className={cx('juizi-calendar__bar', {
                                'juizi-calendar__bar--space': !bar,
                                'juizi-calendar__bar--starts': bar?.starts,
                                'juizi-calendar__bar--ends': bar?.ends,
                              })}
                              style={bar ? typeOf(bar.event).style : undefined}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                    {info.all.length > 0 && (
                      <span id={descriptionId} hidden>
                        {info.all
                          .map((event) =>
                            [event.title, typeOf(event).names]
                              .filter(Boolean)
                              .join(', '),
                          )
                          .join('; ')}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* eslint-enable jsx-a11y/no-redundant-roles */}
    </>
  );
};

export default Grid;
