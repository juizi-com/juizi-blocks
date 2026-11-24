/**
 * Dashboard › Calendar: what the Events calendar may offer editors.
 *
 * The site owner decides what *can* be shown; editors then choose, per
 * calendar, from that. Kept apart from the other settings: it is read and
 * saved through @juizi-calendar-settings, and a kind of event is switched
 * on by giving its content type the "Calendar entry only" behaviour.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';
import Api from '@plone/volto/helpers/Api/Api';
import messages from './messages';

const PATH = '/@juizi-calendar-settings';

const toDraft = (data) => ({
  kinds: (data?.kinds || []).filter((kind) => kind.on).map((kind) => kind.id),
  taxonomies: (data?.taxonomies || [])
    .filter((row) => row.on)
    .map((row) => ({ id: row.id, label: row.label || '' })),
  feeds: !!data?.feeds,
});

/** The settings, a draft of them, and saving it. */
export const useCalendarSettings = (enabled) => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const saved = useMemo(() => toDraft(data), [data]);
  const [draft, setDraft] = useState(saved);

  useEffect(() => {
    if (!enabled) return undefined;
    let stopped = false;
    new Api()
      .get(PATH)
      .then((result) => !stopped && setData(result))
      .catch(() => !stopped && setFailed(true));
    return () => {
      stopped = true;
    };
  }, [enabled]);

  useEffect(() => setDraft(saved), [saved]);

  const save = useCallback(
    () =>
      new Api().patch(PATH, { data: draft }).then((result) => {
        setData(result);
        return result;
      }),
    [draft],
  );

  return {
    data,
    failed,
    draft,
    setDraft,
    dirty: !!data && !isEqual(draft, saved),
    save,
    reset: () => setDraft(saved),
  };
};

const Section = ({ title, help, children }) => (
  <section className="juizi-dashboard__section">
    <h2>{title}</h2>
    {help && <p className="juizi-dashboard__help">{help}</p>}
    {children}
  </section>
);

const CalendarSettings = ({ settings }) => {
  const intl = useIntl();
  const { data, failed, draft, setDraft } = settings;

  if (failed) {
    return (
      <div className="juizi-dashboard__error" role="alert">
        {intl.formatMessage(messages.calendarLoadFailed)}
      </div>
    );
  }
  if (!data) {
    return (
      <p className="juizi-dashboard__help" aria-busy="true">
        {intl.formatMessage(messages.calendarLoading)}
      </p>
    );
  }

  const kindTitle = new Map(data.kinds.map((kind) => [kind.id, kind.title]));
  const toggleKind = (id, on) =>
    setDraft((current) => ({
      ...current,
      kinds: on
        ? [...current.kinds, id]
        : current.kinds.filter((kind) => kind !== id),
    }));
  const chosen = new Map(draft.taxonomies.map((row) => [row.id, row]));
  const toggleList = (id, on) =>
    setDraft((current) => ({
      ...current,
      taxonomies: on
        ? [...current.taxonomies, { id, label: '' }]
        : current.taxonomies.filter((row) => row.id !== id),
    }));
  const nameList = (id, label) =>
    setDraft((current) => ({
      ...current,
      taxonomies: current.taxonomies.map((row) =>
        row.id === id ? { ...row, label } : row,
      ),
    }));
  const sessionsOn = data.kinds.some(
    (kind) => kind.session && draft.kinds.includes(kind.id),
  );

  return (
    <>
      <Section
        title={intl.formatMessage(messages.calendarKinds)}
        help={intl.formatMessage(messages.calendarKindsHelp)}
      >
        {data.kinds.length === 0 ? (
          <p className="juizi-dashboard__muted">
            {intl.formatMessage(messages.calendarNoKinds)}
          </p>
        ) : (
          <ul className="juizi-dashboard__calendar-list">
            {data.kinds.map((kind) => {
              const on = draft.kinds.includes(kind.id);
              const detail = [
                kind.count === null || kind.count === undefined
                  ? ''
                  : intl.formatMessage(messages.calendarEvents, {
                      count: kind.count,
                    }),
                kind.lists.length
                  ? intl.formatMessage(messages.calendarSortedBy, {
                      lists: kind.lists.join(', '),
                    })
                  : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={kind.id}>
                  <label className="juizi-dashboard__group-option">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(event) =>
                        toggleKind(kind.id, event.target.checked)
                      }
                    />
                    <span>{kind.title}</span>
                  </label>
                  {detail && (
                    <span className="juizi-dashboard__muted">{detail}</span>
                  )}
                  {!on && kind.count > 0 && (
                    <span className="juizi-dashboard__muted">
                      {intl.formatMessage(messages.calendarKindOff)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title={intl.formatMessage(messages.calendarLists)}
        help={intl.formatMessage(messages.calendarListsHelp)}
      >
        {data.taxonomies.length === 0 ? (
          <p className="juizi-dashboard__muted">
            {intl.formatMessage(messages.calendarNoLists)}
          </p>
        ) : (
          <ul className="juizi-dashboard__calendar-list">
            {data.taxonomies.map((row) => {
              const picked = chosen.get(row.id);
              const usedOn = row.kinds.filter((kind) =>
                draft.kinds.includes(kind),
              );
              const nameId = `juizi-calendar-list-name-${row.id}`;
              return (
                <li key={row.id}>
                  <label className="juizi-dashboard__group-option">
                    <input
                      type="checkbox"
                      checked={!!picked}
                      onChange={(event) =>
                        toggleList(row.id, event.target.checked)
                      }
                    />
                    <span>{row.title}</span>
                  </label>
                  <span className="juizi-dashboard__muted">
                    {[
                      usedOn.length
                        ? intl.formatMessage(messages.calendarUsedOn, {
                            kinds: usedOn
                              .map((kind) => kindTitle.get(kind) || kind)
                              .join(', '),
                          })
                        : '',
                      intl.formatMessage(messages.calendarEvents, {
                        count: row.count,
                      }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {picked && (
                    <span className="juizi-dashboard__calendar-name">
                      <label htmlFor={nameId}>
                        {intl.formatMessage(messages.calendarListName)}
                      </label>
                      <input
                        id={nameId}
                        type="text"
                        className="juizi-dashboard__input"
                        maxLength={80}
                        placeholder={row.title}
                        value={picked.label}
                        onChange={(event) =>
                          nameList(row.id, event.target.value)
                        }
                      />
                    </span>
                  )}
                  {picked && usedOn.length === 0 && (
                    <span className="juizi-dashboard__muted" role="status">
                      {intl.formatMessage(messages.calendarListUnused)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {sessionsOn && (
          <p className="juizi-dashboard__help">
            {intl.formatMessage(messages.calendarSessionLists)}
          </p>
        )}
      </Section>

      <Section
        title={intl.formatMessage(messages.calendarFeeds)}
        help={intl.formatMessage(messages.calendarFeedsHelp)}
      >
        <label className="juizi-dashboard__group-option">
          <input
            type="checkbox"
            checked={draft.feeds}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                feeds: event.target.checked,
              }))
            }
          />
          <span>{intl.formatMessage(messages.calendarFeedsAllow)}</span>
        </label>
      </Section>
    </>
  );
};

export default CalendarSettings;
