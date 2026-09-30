/**
 * The colours each Callout type starts with (Warning → Gold background, …).
 * Choosing a type in a new Callout seeds these; editors can still change
 * them per callout. Colours are limited to the ones the Callout offers
 * (Colours per block).
 */
import React from 'react';
import { useIntl } from 'react-intl';
import { getBlockColors } from '../../settings';
import { calloutTypes } from '../Blocks/Callout/types';
import messages from './messages';

const BLOCK_ID = 'juiziCallout';
const SLOTS = ['background', 'icon'];

const CalloutTypesEditor = ({ colorConfig, onChange }) => {
  const intl = useIntl();
  const blockConfig = colorConfig.blocks?.[BLOCK_ID] || {};
  const types = blockConfig.calloutTypes || {};
  const colors = getBlockColors(colorConfig, BLOCK_ID);

  const setColor = (type, slot, name) => {
    const nextType = { ...(types[type] || {}) };
    if (name) nextType[slot] = name;
    else delete nextType[slot];
    onChange({
      ...colorConfig,
      blocks: {
        ...colorConfig.blocks,
        [BLOCK_ID]: {
          ...blockConfig,
          calloutTypes: { ...types, [type]: nextType },
        },
      },
    });
  };

  const slotLabel = (slot) =>
    intl.formatMessage(
      slot === 'background'
        ? messages.calloutBackground
        : messages.calloutIconColor,
    );

  return (
    <table className="juizi-dashboard__table juizi-dashboard__table--grid">
      <thead>
        <tr>
          <th>{intl.formatMessage(messages.calloutType)}</th>
          {SLOTS.map((slot) => (
            <th key={slot}>{slotLabel(slot)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {calloutTypes.map((type) => (
          <tr key={type.id}>
            <td>{intl.formatMessage(type.label)}</td>
            {SLOTS.map((slot) => (
              <td key={slot}>
                <select
                  className="juizi-dashboard__select"
                  value={types[type.id]?.[slot] || ''}
                  aria-label={`${intl.formatMessage(type.label)} – ${slotLabel(slot)}`}
                  onChange={(e) => setColor(type.id, slot, e.target.value)}
                >
                  <option value="">{intl.formatMessage(messages.none)}</option>
                  {colors.map((color) => (
                    <option key={color.name} value={color.name}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CalloutTypesEditor;
