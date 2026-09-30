import React from 'react';
import { useIntl } from 'react-intl';
import { Plus } from 'lucide-react';
import {
  colorForeground,
  contrastRatio,
  isHexColor,
  isValidName,
  removeColor,
  renameColor,
  slugifyName,
  suggestDark,
  toColorInputValue,
} from '../../settings';
import ListControls, { moveItem } from './ListControls';
import messages from './messages';

const HexInput = ({ label, value, onChange, placeholder }) => (
  <span className="juizi-dashboard__color-inputs">
    <input
      type="color"
      value={toColorInputValue(value)}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    />
    <input
      type="text"
      className="juizi-dashboard__input"
      value={value || ''}
      placeholder={placeholder}
      aria-invalid={!!value && !isHexColor(value)}
      onChange={(e) => onChange(e.target.value.trim())}
      aria-label={`${label} hex`}
    />
  </span>
);

const ColorRow = ({
  entry,
  index,
  count,
  names,
  onChange,
  onRename,
  onMove,
  onRemove,
}) => {
  const intl = useIntl();
  const suggestion = suggestDark(entry.value);
  const text = colorForeground(entry);
  const ratio = contrastRatio(entry.value, text);
  const automaticText = !entry.foreground;

  return (
    <div className="juizi-dashboard__entry">
      <div
        className="juizi-dashboard__swatch"
        style={
          isHexColor(entry.value)
            ? { background: entry.value, color: text }
            : {}
        }
        aria-hidden
      >
        Aa
      </div>
      <div className="juizi-dashboard__entry-fields">
        <div className="juizi-dashboard__entry-head">
          <label className="juizi-dashboard__inline-field">
            <span>{intl.formatMessage(messages.label)}</span>
            <input
              type="text"
              className="juizi-dashboard__input"
              value={entry.label}
              onChange={(e) => onChange({ label: e.target.value })}
            />
          </label>
          <label
            className="juizi-dashboard__inline-field"
            title={intl.formatMessage(messages.name)}
          >
            <span aria-hidden>--</span>
            <input
              type="text"
              className="juizi-dashboard__input"
              aria-label={intl.formatMessage(messages.name)}
              value={entry.name}
              aria-invalid={
                !isValidName(entry.name) ||
                names.filter((n) => n === entry.name).length > 1
              }
              onChange={(e) => onRename(e.target.value)}
            />
          </label>
          <ListControls
            index={index}
            count={count}
            onMove={onMove}
            onRemove={onRemove}
            canRemove={count > 1}
          />
        </div>
        <div className="juizi-dashboard__entry-grid">
          <label className="juizi-dashboard__field">
            <span>{intl.formatMessage(messages.value)}</span>
            <HexInput
              label={intl.formatMessage(messages.value)}
              value={entry.value}
              onChange={(value) => onChange({ value })}
            />
          </label>
          <div className="juizi-dashboard__field">
            <span title={intl.formatMessage(messages.darkHelp)}>
              {intl.formatMessage(messages.dark)}
            </span>
            <input
              type="checkbox"
              checked={!!entry.dark}
              aria-label={intl.formatMessage(messages.dark)}
              onChange={(e) => onChange({ dark: e.target.checked })}
            />
            {isHexColor(entry.value) && suggestion !== !!entry.dark && (
              <span className="juizi-dashboard__hint">
                {intl.formatMessage(messages.suggested, {
                  tone: intl.formatMessage(
                    suggestion ? messages.toneDark : messages.toneLight,
                  ),
                })}{' '}
                <button
                  type="button"
                  className="juizi-dashboard__link-button"
                  onClick={() => onChange({ dark: suggestion })}
                >
                  {intl.formatMessage(messages.useSuggestion)}
                </button>
              </span>
            )}
          </div>
          <div className="juizi-dashboard__field">
            <span>{intl.formatMessage(messages.foreground)}</span>
            <label className="juizi-dashboard__check">
              <input
                type="checkbox"
                checked={automaticText}
                onChange={(e) =>
                  onChange({ foreground: e.target.checked ? '' : text })
                }
              />
              {intl.formatMessage(messages.automatic)}
            </label>
            {!automaticText && (
              <HexInput
                label={intl.formatMessage(messages.foreground)}
                value={entry.foreground}
                onChange={(foreground) => onChange({ foreground })}
              />
            )}
            <span
              className={
                ratio < 4.5
                  ? 'juizi-dashboard__hint juizi-dashboard__hint--warning'
                  : 'juizi-dashboard__hint'
              }
              title={
                ratio < 4.5 ? intl.formatMessage(messages.lowContrast) : ''
              }
            >
              {intl.formatMessage(messages.contrast, {
                ratio: ratio.toFixed(1),
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorsEditor = ({ colorConfig, onChange }) => {
  const intl = useIntl();
  const { colors } = colorConfig;
  const names = colors.map((c) => c.name);

  const update = (index, patch) =>
    onChange({
      ...colorConfig,
      colors: colors.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    });

  const rename = (index, next) => {
    const current = colors[index].name;
    // Only carry references over while the rename is unambiguous: names can
    // collide for a moment while someone types.
    const unambiguous =
      names.filter((n) => n === current).length === 1 && !names.includes(next);
    const base = unambiguous
      ? renameColor(colorConfig, current, next)
      : colorConfig;
    onChange({
      ...base,
      colors: base.colors.map((c, i) =>
        i === index ? { ...c, name: next } : c,
      ),
    });
  };

  const add = () => {
    const label = intl.formatMessage(messages.newColor);
    onChange({
      ...colorConfig,
      colors: [
        ...colors,
        {
          name: slugifyName(label, names),
          label,
          value: '#777777',
          dark: suggestDark('#777777'),
        },
      ],
    });
  };

  return (
    <div className="juizi-dashboard__list">
      {colors.map((entry, index) => (
        <ColorRow
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          entry={entry}
          index={index}
          count={colors.length}
          names={names}
          onChange={(patch) => update(index, patch)}
          onRename={(next) => rename(index, next)}
          onMove={(delta) =>
            onChange({ ...colorConfig, colors: moveItem(colors, index, delta) })
          }
          onRemove={() => onChange(removeColor(colorConfig, entry.name))}
        />
      ))}
      <div className="juizi-dashboard__actions">
        <button
          type="button"
          className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
          onClick={add}
        >
          <Plus size={14} aria-hidden /> {intl.formatMessage(messages.addColor)}
        </button>
      </div>
    </div>
  );
};

export default ColorsEditor;
