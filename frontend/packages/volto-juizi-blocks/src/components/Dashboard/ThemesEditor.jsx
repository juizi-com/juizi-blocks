import React from 'react';
import { useIntl } from 'react-intl';
import { Plus } from 'lucide-react';
import {
  THEME_SLOTS,
  isValidThemeName,
  removeTheme,
  renameTheme,
  slugifyName,
  themePreviewStyle,
} from '../../settings';
import ListControls, { moveItem } from './ListControls';
import messages from './messages';

const REQUIRED_SLOTS = ['background', 'foreground'];

const SlotField = ({ slot, value, colors, onChange }) => {
  const intl = useIntl();
  const label = intl.formatMessage(messages[`slot_${slot}`]);
  const color = colors.find((c) => c.name === value?.color);
  return (
    <div className="juizi-dashboard__field">
      <span>{label}</span>
      <span className="juizi-dashboard__slot">
        <span
          className="juizi-dashboard__chip"
          style={color ? { background: color.value } : {}}
          aria-hidden
        />
        <select
          className="juizi-dashboard__select"
          aria-label={label}
          value={value?.color || ''}
          onChange={(e) =>
            onChange(
              e.target.value ? { ...value, color: e.target.value } : undefined,
            )
          }
        >
          {!REQUIRED_SLOTS.includes(slot) || !value?.color ? (
            <option value="">{intl.formatMessage(messages.none)}</option>
          ) : null}
          {colors.map((c) => (
            <option key={c.name} value={c.name}>
              {c.label}
            </option>
          ))}
        </select>
        {value?.color && (
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            className="juizi-dashboard__opacity"
            title={intl.formatMessage(messages.opacity)}
            aria-label={`${label} – ${intl.formatMessage(messages.opacity)}`}
            value={value.opacity ?? 100}
            onChange={(e) => {
              const opacity = Math.min(
                100,
                Math.max(0, Number(e.target.value)),
              );
              onChange({
                ...value,
                opacity: opacity >= 100 ? undefined : opacity,
              });
            }}
          />
        )}
      </span>
    </div>
  );
};

const Preview = ({ theme, colors }) => {
  const intl = useIntl();
  return (
    <div
      className="juizi-dashboard__preview"
      style={themePreviewStyle(theme, colors)}
    >
      <strong>{intl.formatMessage(messages.previewTitle)}</strong>
      <span className="juizi-dashboard__preview-muted">
        {intl.formatMessage(messages.previewText)}
      </span>
      <span className="juizi-dashboard__preview-card">
        {intl.formatMessage(messages.previewCard)}
      </span>
    </div>
  );
};

const ThemesEditor = ({ colorConfig, onChange }) => {
  const intl = useIntl();
  const { themes, colors } = colorConfig;
  const names = themes.map((t) => t.name);

  const update = (index, patch) =>
    onChange({
      ...colorConfig,
      themes: themes.map((t, i) => {
        if (i !== index) return t;
        const next = { ...t, ...patch };
        Object.keys(patch).forEach((k) => {
          if (patch[k] === undefined) delete next[k];
        });
        return next;
      }),
    });

  const rename = (index, next) => {
    const current = themes[index].name;
    const unambiguous =
      names.filter((n) => n === current).length === 1 && !names.includes(next);
    const base = unambiguous
      ? renameTheme(colorConfig, current, next)
      : colorConfig;
    onChange({
      ...base,
      themes: base.themes.map((t, i) =>
        i === index ? { ...t, name: next } : t,
      ),
    });
  };

  const add = () => {
    const label = intl.formatMessage(messages.newTheme);
    const [first, second] = colors;
    onChange({
      ...colorConfig,
      themes: [
        ...themes,
        {
          name: slugifyName(label, names),
          label,
          background: { color: first.name },
          foreground: { color: (second || first).name },
        },
      ],
    });
  };

  return (
    <div className="juizi-dashboard__list">
      {themes.map((theme, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="juizi-dashboard__entry" key={index}>
          <Preview theme={theme} colors={colors} />
          <div className="juizi-dashboard__entry-fields">
            <div className="juizi-dashboard__entry-head">
              <label className="juizi-dashboard__inline-field">
                <span>{intl.formatMessage(messages.label)}</span>
                <input
                  type="text"
                  className="juizi-dashboard__input"
                  value={theme.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                />
              </label>
              <label className="juizi-dashboard__inline-field">
                <span>{intl.formatMessage(messages.name)}</span>
                <input
                  type="text"
                  className="juizi-dashboard__input"
                  value={theme.name}
                  aria-invalid={
                    !isValidThemeName(theme.name) ||
                    names.filter((n) => n === theme.name).length > 1
                  }
                  onChange={(e) => rename(index, e.target.value)}
                />
              </label>
              <ListControls
                index={index}
                count={themes.length}
                onMove={(delta) =>
                  onChange({
                    ...colorConfig,
                    themes: moveItem(themes, index, delta),
                  })
                }
                onRemove={() => onChange(removeTheme(colorConfig, theme.name))}
                canRemove={themes.length > 1}
              />
            </div>
            <div className="juizi-dashboard__entry-grid">
              {THEME_SLOTS.map((slot) => (
                <SlotField
                  key={slot}
                  slot={slot}
                  value={theme[slot]}
                  colors={colors}
                  onChange={(value) => update(index, { [slot]: value })}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="juizi-dashboard__actions">
        <button
          type="button"
          className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
          onClick={add}
          disabled={!colors.length}
        >
          <Plus size={14} aria-hidden /> {intl.formatMessage(messages.addTheme)}
        </button>
      </div>
    </div>
  );
};

export default ThemesEditor;
