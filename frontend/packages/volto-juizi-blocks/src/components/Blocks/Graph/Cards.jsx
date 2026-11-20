/**
 * The card views: statistics, ranked bars and ranked cards. Plain HTML, no
 * chart library. The CSV layouts are the older GraphBlock's:
 *
 * Statistics: label | main value | more values…
 *   One card per row. Further columns show under the main value, with an
 *   arrow saying whether each is above or below it.
 * Ranked bars: label | value, or group | label | value, or
 *   group | Subtitle | label | value (second header named "Subtitle").
 * Ranked cards: group | label | value, or group | Subtitle | label | value.
 *   One card per group, its rows ranked in file order.
 */
import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { useItemHeadingAttrs } from '../_shared/headingLevel';
import {
  colorValueToKey,
  getColorTextStyle,
  isColorDark,
} from '../../../config/colors';
import CountUp from '../_shared/CountUp';
import MobileCarousel from '../_shared/MobileCarousel';
import { formatNumber } from '../_shared/format';
import { isPercent, toNumber } from './data';
import messages from './messages';

/** Count-up speeds; the older block saved milliseconds (1500 by default). */
export const getCountUpDuration = (data) => {
  const saved = data.statAnimationMs;
  if (saved === undefined || saved === null || saved === '') return 1500;
  const number = parseInt(saved, 10);
  return Number.isNaN(number) ? 1500 : Math.max(number, 0);
};

/**
 * The card colour: a colour from the site's list (`cardColor`, text colour
 * follows it), or the older block's `cardBackgroundColor`
 * ('var(--blue-base)|dark': background | text tone).
 */
export const getCardLook = (data) => {
  const color = data.cardColor;
  if (color && color !== 'transparent') {
    const dark = isColorDark(color);
    return {
      className: cx(
        `bg-${colorValueToKey(color)}`,
        dark ? 'bg-dark' : 'bg-light',
        'graph-card--colored',
      ),
      style: { backgroundColor: color, ...getColorTextStyle(color) },
    };
  }
  const legacy = String(data.cardBackgroundColor || '').trim();
  if (legacy && legacy !== 'none') {
    const [background, tone = 'light'] = legacy.split('|').map((s) => s.trim());
    return {
      className: cx(
        tone === 'dark' ? 'bg-dark' : 'bg-light',
        'graph-card--colored',
      ),
      style: { backgroundColor: background },
    };
  }
  return { className: '', style: undefined };
};

const notBlank = (row) => row.some((cell) => String(cell ?? '').trim());

/** "8.63%" → "8.63%", "1234" → "1,234", text stays text. */
const useValueFormat = () => {
  const { locale } = useIntl();
  return (raw) => {
    const number = toNumber(raw);
    if (number === null) return String(raw ?? '');
    return `${formatNumber(number, locale)}${isPercent(raw) ? '%' : ''}`;
  };
};

export const getStats = (table) => {
  const [, primaryKey, ...subKeys] = table.columns;
  return table.rows.filter(notBlank).map((row) => {
    const primary = String(row[1] ?? '').trim();
    const primaryValue = toNumber(primary);
    return {
      label: row[0],
      primary,
      primaryValue,
      primaryKey,
      subs: subKeys.map((key, i) => {
        const raw = row[i + 2];
        const value = toNumber(raw);
        return {
          key,
          raw,
          direction:
            value === null || primaryValue === null || value === primaryValue
              ? 'same'
              : value > primaryValue
                ? 'up'
                : 'down',
        };
      }),
    };
  });
};

/** Rows grouped for the ranked views, each with its bar length (0–100). */
export const getRankedGroups = (table, { needsGroup }) => {
  const columns = table.columns;
  const hasSubtitle =
    columns.length >= 4 && String(columns[1]).toLowerCase() === 'subtitle';
  const hasGroup = needsGroup || hasSubtitle || columns.length >= 3;
  const at = hasSubtitle
    ? { group: 0, subtitle: 1, label: 2, value: 3 }
    : hasGroup
      ? { group: 0, label: 1, value: 2 }
      : { label: 0, value: 1 };
  const groups = [];
  const byName = {};
  table.rows.filter(notBlank).forEach((row) => {
    const name = hasGroup ? row[at.group] : '';
    if (!byName[name]) {
      byName[name] = {
        title: name,
        subtitle: hasSubtitle ? row[at.subtitle] || '' : '',
        rows: [],
      };
      groups.push(byName[name]);
    }
    byName[name].rows.push({
      label: row[at.label],
      raw: row[at.value],
      value: toNumber(row[at.value]) ?? 0,
    });
  });
  return groups.map((group) => {
    const max = Math.max(...group.rows.map((r) => r.value), 1);
    return {
      ...group,
      rows: group.rows.map((r) => ({ ...r, pct: (r.value / max) * 100 })),
    };
  });
};

const Carousel = ({ enabled, label, children }) => {
  if (!enabled) return null;
  return (
    <MobileCarousel blockClass="graph-cards" label={label} showDots>
      {children}
    </MobileCarousel>
  );
};

const Grid = ({ data, className, label, children }) => (
  <>
    <div
      className={cx('graph-cards__grid', className, {
        'graph-cards__grid--carousel': !!data.mobileCarousel,
      })}
    >
      {children}
    </div>
    <Carousel enabled={!!data.mobileCarousel} label={label}>
      {children}
    </Carousel>
  </>
);

const Bar = ({ pct, track }) => (
  <div
    className={cx('graph-ranked__track', {
      'graph-ranked__track--bare': !track,
    })}
    aria-hidden="true"
  >
    <div className="graph-ranked__fill" style={{ width: `${pct}%` }} />
  </div>
);

export const StatsCards = ({ table, data }) => {
  const intl = useIntl();
  const format = useValueFormat();
  const look = getCardLook(data);
  const duration = getCountUpDuration(data);
  const columns = parseInt(data.statColumns, 10) || 3;
  const cards = getStats(table).map((card, i) => (
    <div
      key={i}
      className={cx('graph-card graph-stat', look.className)}
      style={look.style}
    >
      <div className="graph-stat__label">{card.label}</div>
      <div className="graph-stat__primary">
        {card.primaryValue === null ? (
          <span className="graph-stat__number">{card.primary}</span>
        ) : (
          <>
            <CountUp
              className="graph-stat__number"
              end={card.primaryValue}
              duration={duration}
            />
            {isPercent(card.primary) && (
              <span className="graph-stat__unit">%</span>
            )}
          </>
        )}
      </div>
      {card.subs.length > 0 && (
        <>
          <div className="graph-stat__primary-label">{card.primaryKey}</div>
          <ul className="graph-stat__subs">
            {card.subs.map((sub, j) => (
              <li
                key={j}
                className={`graph-stat__sub graph-stat__sub--${sub.direction}`}
              >
                <span className="graph-stat__arrow" aria-hidden="true">
                  {sub.direction === 'up'
                    ? '▲'
                    : sub.direction === 'down'
                      ? '▼'
                      : '—'}
                </span>
                <span className="graph-stat__sub-label">{sub.key}:</span>{' '}
                <span className="graph-stat__sub-value">{format(sub.raw)}</span>
                <span className="visually-hidden">
                  {' '}
                  {intl.formatMessage(messages[`direction_${sub.direction}`])}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  ));
  return (
    <Grid
      data={data}
      className={`graph-cards__grid--cols-${columns}`}
      label={intl.formatMessage(messages.viewStats)}
    >
      {cards}
    </Grid>
  );
};

export const RankedBars = ({ table, data }) => {
  const groupHeading = useItemHeadingAttrs();
  const intl = useIntl();
  const format = useValueFormat();
  const look = getCardLook(data);
  const track = data.showBarTrack !== false;
  const groups = getRankedGroups(table, { needsGroup: false }).map(
    (group, i) => (
      <div
        key={i}
        className={cx('graph-card graph-ranked', look.className)}
        style={look.style}
      >
        {group.title && (
          <div className="graph-ranked__header">
            <h4 className="graph-ranked__title" {...groupHeading}>
              {group.title}
            </h4>
            {group.subtitle && (
              <p className="graph-ranked__subtitle">{group.subtitle}</p>
            )}
          </div>
        )}
        <ul className="graph-ranked__list">
          {group.rows.map((row, j) => (
            <li key={j} className="graph-ranked__item">
              <Bar pct={row.pct} track={track} />
              <div className="graph-ranked__meta">
                <span className="graph-ranked__label">{row.label}</span>
                <span className="graph-ranked__value">{format(row.raw)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  );
  return (
    <Grid
      data={data}
      className="graph-cards__grid--ranked-bars"
      label={intl.formatMessage(messages.viewRankedBars)}
    >
      {groups}
    </Grid>
  );
};

export const RankedCards = ({ table, data }) => {
  const groupHeading = useItemHeadingAttrs();
  const intl = useIntl();
  const format = useValueFormat();
  const look = getCardLook(data);
  const columns = parseInt(data.rankedCardColumns, 10) || 3;
  const track = data.showBarTrack !== false;
  const cards = getRankedGroups(table, { needsGroup: true }).map((group, i) => (
    <div
      key={i}
      className={cx('graph-card graph-ranked', look.className)}
      style={look.style}
    >
      <div className="graph-ranked__header">
        <h4 className="graph-ranked__title" {...groupHeading}>
          {group.title}
        </h4>
        {group.subtitle && (
          <p className="graph-ranked__subtitle">{group.subtitle}</p>
        )}
      </div>
      <ol className="graph-ranked__list graph-ranked__list--numbered">
        {group.rows.map((row, j) => (
          <li key={j} className="graph-ranked__item">
            {data.showBarInCards && <Bar pct={row.pct} track={track} />}
            <div className="graph-ranked__meta">
              <span className="graph-ranked__rank">{j + 1}.</span>
              <span className="graph-ranked__label">{row.label}</span>
              <span className="graph-ranked__value">{format(row.raw)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  ));
  return (
    <Grid
      data={data}
      className={`graph-cards__grid--cols-${columns}`}
      label={intl.formatMessage(messages.viewRankedCards)}
    >
      {cards}
    </Grid>
  );
};
