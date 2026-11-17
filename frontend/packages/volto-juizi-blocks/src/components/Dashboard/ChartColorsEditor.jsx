/**
 * Chart colours for the Data visualisation block, in the order charts use
 * them: the first column of figures gets colour 1, the second colour 2,
 * and so on. None chosen: the site's colours in their order, without the
 * very light ones. Stored as colour names in
 * color_config.blocks.graphBlock.chartColors.
 */
import React from 'react';
import { useIntl } from 'react-intl';
import { getChartPalette } from '../Blocks/Graph/palette';
import messages from './messages';

const BLOCK_ID = 'graphBlock';
const SLOTS = 8;

const ChartColorsEditor = ({ colorConfig, onChange }) => {
  const intl = useIntl();
  const blockConfig = colorConfig.blocks?.[BLOCK_ID] || {};
  const chosen = blockConfig.chartColors || [];
  const colors = colorConfig.colors || [];

  const setSlot = (index, name) => {
    const next = [...chosen];
    next[index] = name;
    // Keep the list without gaps: an emptied slot closes up.
    const chartColors = next.filter(Boolean);
    onChange({
      ...colorConfig,
      blocks: {
        ...colorConfig.blocks,
        [BLOCK_ID]: { ...blockConfig, chartColors },
      },
    });
  };

  const preview = getChartPalette(colorConfig);
  const shown = Math.min(Math.max(chosen.length + 1, 3), SLOTS);

  return (
    <div className="juizi-dashboard__chart-colors">
      <ol className="juizi-dashboard__chart-color-list">
        {Array.from({ length: shown }, (_, index) => (
          <li key={index}>
            <label>
              <span className="juizi-dashboard__chart-color-label">
                {intl.formatMessage(messages.chartColor, { number: index + 1 })}
              </span>
              <select
                className="juizi-dashboard__select"
                value={chosen[index] || ''}
                disabled={index > chosen.length}
                onChange={(e) => setSlot(index, e.target.value)}
              >
                <option value="">
                  {intl.formatMessage(
                    index < chosen.length
                      ? messages.none
                      : messages.chartColorAdd,
                  )}
                </option>
                {colors.map((color) => (
                  <option key={color.name} value={color.name}>
                    {color.label}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ol>
      <p className="juizi-dashboard__chart-color-preview">
        {intl.formatMessage(messages.chartColorsPreview)}{' '}
        {preview.slice(0, SLOTS).map((value, i) => (
          <span
            key={`${value}-${i}`}
            className="juizi-dashboard__chart-swatch"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
        ))}
      </p>
    </div>
  );
};

export default ChartColorsEditor;
