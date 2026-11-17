/**
 * The table views. "Table with search" filters rows as the visitor types;
 * the rows that don't match are hidden, not removed, so a printout still
 * has every row (and the search box doesn't print).
 */
import React, { useId, useState } from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { formatNumber } from '../_shared/format';
import messages from './messages';

const matches = (row, term) =>
  !term ||
  row.some((cell) =>
    String(cell ?? '')
      .toLowerCase()
      .includes(term),
  );

const DataTable = ({ table, data, searchable, caption }) => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const searchId = useId();
  const term = search.trim().toLowerCase();
  const shown = table.rows.filter((row) => matches(row, term)).length;

  return (
    <>
      {searchable && (
        <div className="graph-table__search">
          <label htmlFor={searchId} className="visually-hidden">
            {intl.formatMessage(messages.searchLabel)}
          </label>
          <input
            id={searchId}
            type="search"
            className="graph-table__search-input"
            placeholder={
              data.searchPlaceholder ||
              intl.formatMessage(messages.searchPlaceholder)
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="graph-table__count" role="status" aria-live="polite">
            {term
              ? intl.formatMessage(messages.searchCount, {
                  shown: formatNumber(shown, intl.locale),
                  total: formatNumber(table.rows.length, intl.locale),
                })
              : ''}
          </span>
        </div>
      )}
      <div className="graph-table__scroll">
        <table className="graph-table">
          {caption && <caption className="visually-hidden">{caption}</caption>}
          <thead>
            <tr>
              {table.columns.map((column, i) => (
                <th key={i} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr
                key={i}
                className={cx({
                  'graph-table__row--hidden': !matches(row, term),
                })}
              >
                {table.columns.map((column, j) => (
                  <td key={j} data-label={column}>
                    {row[j] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
            {searchable && term && shown === 0 && (
              <tr className="graph-table__no-results">
                <td colSpan={table.columns.length}>
                  {intl.formatMessage(messages.searchNone)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataTable;
