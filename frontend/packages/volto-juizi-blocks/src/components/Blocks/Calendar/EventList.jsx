/** The events of the month, or of the day chosen. */
import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { externalLinkProps, isExternalHref } from '../_shared/links';
import { toLocale } from '../_shared/format';
import { levelAttrs } from '../_shared/headingLevel';
import { longDate, shortDate } from './dates';
import messages from './messages';

/** "21 Oct – 27 Nov · All day", and what's read out instead. */
export const eventWhen = (event, intl, year) => {
  const { start, end, startTime, endTime } = event;
  const language = intl.locale;
  const range = (from, to) =>
    intl.formatMessage(messages.dateRange, { start: from, end: to });
  const withYear = start.slice(0, 4) !== year || end.slice(0, 4) !== year;
  const several = end !== start;
  const allDay = event.allDay ? intl.formatMessage(messages.allDay) : '';
  // Over several days the two times aren't one stretch, so only the first.
  const showEnd = (!several || event.daily) && endTime && endTime !== startTime;
  // Days in a row with the same hours.
  const eachDay = (time) =>
    event.daily && several && time
      ? intl.formatMessage(messages.eachDay, { time })
      : time;

  const longStart = longDate(start, language, withYear);
  const shortStart = shortDate(start, language, withYear);
  return {
    dates: several
      ? [shortStart, shortDate(end, language, withYear)]
      : [shortStart],
    time: allDay || eachDay(showEnd ? `${startTime}–${endTime}` : startTime),
    spoken: [
      several ? range(longStart, longDate(end, language, withYear)) : longStart,
      allDay || eachDay(showEnd ? range(startTime, endTime) : startTime),
    ]
      .filter(Boolean)
      .join(', '),
  };
};

const EventTitle = ({ event }) => {
  const intl = useIntl();
  if (!event.url) return event.title;
  const href = flattenToAppURL(event.url) || '/';
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className="juizi-calendar__event-link"
        {...externalLinkProps(href)}
      >
        {event.title}
        <span className="visually-hidden">
          {' '}
          {intl.formatMessage(messages.newTab)}
        </span>
      </a>
    );
  }
  return (
    <UniversalLink href={href} className="juizi-calendar__event-link">
      {event.title}
    </UniversalLink>
  );
};

const EventList = ({ events, typeOf, level, year }) => {
  const intl = useIntl();
  const pageLanguage = toLocale(intl.locale).slice(0, 2).toLowerCase();
  return (
    <ul className="juizi-calendar__events">
      {events.map((event) => {
        const type = typeOf(event);
        const when = eventWhen(event, intl, year);
        const language = (event.language || '').replace('_', '-');
        const otherLanguage =
          language && language.slice(0, 2).toLowerCase() !== pageLanguage;
        return (
          <li
            key={event.id}
            className={cx('juizi-calendar__event', {
              'juizi-calendar__event--linked': !!event.url,
            })}
            style={type.style}
          >
            <span className="juizi-calendar__event-bar" aria-hidden="true" />
            <div className="juizi-calendar__event-body">
              <p className="juizi-calendar__meta">
                <span className="visually-hidden">{when.spoken}</span>
                <span aria-hidden="true">
                  {when.dates.map((date, index) => (
                    <React.Fragment key={index ? 'end' : 'start'}>
                      {index > 0 && ' – '}
                      <time dateTime={index ? event.endISO : event.startISO}>
                        {date}
                      </time>
                    </React.Fragment>
                  ))}
                  {when.time && ` · ${when.time}`}
                </span>
                {type.names && (
                  <span className="juizi-calendar__tag">
                    <span className="visually-hidden">, </span>
                    {type.names}
                  </span>
                )}
              </p>
              <h4
                className="juizi-calendar__event-title"
                data-no-toc=""
                lang={otherLanguage ? language : undefined}
                {...levelAttrs(level, 4)}
              >
                <EventTitle event={event} />
              </h4>
              {event.location && (
                <p className="juizi-calendar__where">{event.location}</p>
              )}
              {event.description && (
                <p
                  className="juizi-calendar__summary"
                  lang={otherLanguage ? language : undefined}
                >
                  {event.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default EventList;
