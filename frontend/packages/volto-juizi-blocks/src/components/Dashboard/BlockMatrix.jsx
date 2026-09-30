/**
 * Per-block allow lists: which colours (or themes) each block offers.
 * `kind` is 'colors' or 'themes'.
 */
import React from 'react';
import { useIntl } from 'react-intl';
import { getBlockDefaultTheme, themePreviewStyle } from '../../settings';
import messages from './messages';

const BlockMatrix = ({ kind, blocks, colorConfig, onChange }) => {
  const intl = useIntl();
  const entries = colorConfig[kind];
  const isThemes = kind === 'themes';

  const setBlock = (blockId, patch) => {
    const next = { ...(colorConfig.blocks[blockId] || {}), ...patch };
    if (
      next.themes?.length &&
      next.defaultTheme &&
      !next.themes.includes(next.defaultTheme)
    ) {
      delete next.defaultTheme;
    }
    onChange({
      ...colorConfig,
      blocks: { ...colorConfig.blocks, [blockId]: next },
    });
  };

  const toggle = (blockId, name, checked) => {
    const allowed = colorConfig.blocks[blockId]?.[kind] || [];
    setBlock(blockId, {
      [kind]: checked
        ? entries
            .map((e) => e.name)
            .filter((n) => n === name || allowed.includes(n))
        : allowed.filter((n) => n !== name),
    });
  };

  const chipStyle = (entry) =>
    isThemes
      ? {
          background: themePreviewStyle(entry, colorConfig.colors)[
            '--theme-color'
          ],
        }
      : { background: entry.value };

  return (
    <div className="juizi-dashboard__matrix">
      <table className="juizi-dashboard__table juizi-dashboard__table--grid">
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.block)}</th>
            {entries.map((entry) => (
              <th key={entry.name} className="juizi-dashboard__cell--center">
                <span
                  className="juizi-dashboard__chip"
                  style={chipStyle(entry)}
                  aria-hidden
                />
                {entry.label}
              </th>
            ))}
            {isThemes && <th>{intl.formatMessage(messages.defaultTheme)}</th>}
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => {
            const allowed = colorConfig.blocks[block.id]?.[kind] || [];
            const options = allowed.length
              ? entries.filter((e) => allowed.includes(e.name))
              : entries;
            return (
              <tr key={block.id}>
                <td>
                  {block.title}
                  {!allowed.length && (
                    <div className="juizi-dashboard__muted">
                      {intl.formatMessage(messages.all)}
                    </div>
                  )}
                </td>
                {entries.map((entry) => (
                  <td
                    key={entry.name}
                    className="juizi-dashboard__cell--center"
                  >
                    <input
                      type="checkbox"
                      checked={allowed.includes(entry.name)}
                      aria-label={`${block.title} – ${entry.label}`}
                      onChange={(e) =>
                        toggle(block.id, entry.name, e.target.checked)
                      }
                    />
                  </td>
                ))}
                {isThemes && (
                  <td>
                    <select
                      className="juizi-dashboard__select"
                      value={getBlockDefaultTheme(colorConfig, block.id) || ''}
                      aria-label={`${block.title} – ${intl.formatMessage(
                        messages.defaultTheme,
                      )}`}
                      onChange={(e) =>
                        setBlock(block.id, { defaultTheme: e.target.value })
                      }
                    >
                      {options.map((entry) => (
                        <option key={entry.name} value={entry.name}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BlockMatrix;
