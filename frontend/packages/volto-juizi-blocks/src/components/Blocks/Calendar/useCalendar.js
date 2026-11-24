/**
 * A month's events.
 *
 * Visitors get this month with the page (`calendarData`); other months are
 * asked for by range and kept, with the neighbours fetched when the browser
 * is idle. In the editor the unsaved block is sent instead, so the canvas
 * follows the sidebar.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Api from '@plone/volto/helpers/Api/Api';
import { addMonths } from './dates';

const PENDING_DELAY = 3000;
const PENDING_TRIES = 4;
const EDIT_DELAY = 400;
const SHAPES_EVENTS = ['items', 'showOther', 'folder', 'timezone', 'weekStart'];

/** Only what changes the events: typing a title doesn't fetch again. */
export const eventSettings = (data) =>
  JSON.stringify(SHAPES_EVENTS.map((key) => data[key] ?? null));

const whenIdle = (task) => {
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(task, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 1200);
  return () => clearTimeout(id);
};

export default function useCalendar({ path, blockId, data, month, isEdit }) {
  const initial = data.calendarData;
  const settings = eventSettings(data);
  const [months, setMonths] = useState(() =>
    initial?.month ? { [initial.month]: initial } : {},
  );
  const [current, setCurrent] = useState(initial?.month || '');
  const [failed, setFailed] = useState('');
  const [attempt, setAttempt] = useState(0);
  const loaded = useRef({});
  const latest = useRef(data);
  latest.current = data;
  const wanted = month || current;

  const request = useCallback(
    (which) => {
      const api = new Api();
      const url = `${path === '/' ? '' : path}/@juizi-calendar`;
      if (isEdit) {
        const { calendarData, ...block } = latest.current;
        return api.post(url, {
          data: { block, ...(which ? { month: which } : {}) },
        });
      }
      return api.get(url, {
        params: { block: blockId, ...(which ? { month: which } : {}) },
      });
    },
    [path, blockId, isEdit],
  );

  // Changed settings: what's loaded is stale, but stays on screen meanwhile.
  useEffect(() => {
    loaded.current = {};
  }, [settings]);

  useEffect(() => {
    let stopped = false;
    let timer;
    let stopIdle;
    let running;
    const key = month || '';
    const cacheKey = `${settings}|${key}`;

    const keep = (result) => {
      setMonths((previous) => ({ ...previous, [result.month]: result }));
      if (!result.pending.length) {
        loaded.current[`${settings}|${result.month}`] = true;
      }
    };

    const prefetch = (from) => {
      stopIdle = whenIdle(() => {
        [-1, 1].forEach((step) => {
          const next = addMonths(from, step);
          if (stopped || loaded.current[`${settings}|${next}`]) return;
          request(next)
            .then((result) => {
              if (!stopped && result?.month) keep(result);
            })
            // Asked again, with a message, if the visitor goes there.
            .catch(() => {});
        });
      });
    };

    const load = (tries) => {
      running = request(month);
      running
        .then((result) => {
          if (stopped) return;
          if (!result?.month || !result.events) {
            setFailed(key || 'current');
            return;
          }
          setFailed('');
          keep(result);
          if (!month) setCurrent(result.month);
          if (result.pending.length && tries < PENDING_TRIES) {
            timer = setTimeout(() => load(tries + 1), PENDING_DELAY);
          } else if (!isEdit) {
            prefetch(result.month);
          }
        })
        .catch(() => {
          if (!stopped) setFailed(key || 'current');
        });
    };

    if (key && loaded.current[cacheKey]) {
      setFailed('');
      if (!isEdit) prefetch(key);
    } else if (isEdit) {
      timer = setTimeout(() => load(0), EDIT_DELAY);
    } else {
      // Also for the month that came with the page: that may be cached.
      load(0);
    }

    return () => {
      stopped = true;
      clearTimeout(timer);
      if (stopIdle) stopIdle();
      // A month the visitor has already left.
      running?.request?.abort?.();
    };
  }, [month, settings, request, isEdit, attempt]);

  const result = months[wanted];
  const hasFailed = !!failed && (failed === wanted || failed === 'current');
  return {
    month: wanted,
    result,
    // The last month's shared parts (types, today) while this one loads.
    shared: result || months[current],
    failed: hasFailed,
    loading: !result && !hasFailed,
    retry: () => {
      loaded.current = {};
      setFailed('');
      setAttempt((count) => count + 1);
    },
  };
}
