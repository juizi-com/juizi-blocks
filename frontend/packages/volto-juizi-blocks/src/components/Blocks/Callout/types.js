/**
 * Callout types: the one decision an editor makes before anything else
 * (First-Time Editor Test). A type seeds a matching icon and the colours the
 * site set for it in the dashboard (Callout types). The type stays in the
 * sidebar, so the editor can see and change it.
 */
import { getCalloutTypeColors } from '../../../settings/runtime';
import messages from './messages';

// `label` and `description` are messages: format them with `intl`.
export const calloutTypes = [
  {
    id: 'info',
    label: messages.typeInfo,
    description: messages.typeInfoHelp,
    icon: 'info',
  },
  {
    id: 'tip',
    label: messages.typeTip,
    description: messages.typeTipHelp,
    icon: 'lightbulb',
  },
  {
    id: 'warning',
    label: messages.typeWarning,
    description: messages.typeWarningHelp,
    icon: 'alert-triangle',
  },
  {
    id: 'success',
    label: messages.typeSuccess,
    description: messages.typeSuccessHelp,
    icon: 'check-circle',
  },
  {
    id: 'announcement',
    label: messages.typeAnnouncement,
    description: messages.typeAnnouncementHelp,
    icon: 'megaphone',
  },
];

/**
 * Callouts created before types existed count as configured when they have
 * any content (an icon, title, text or link), so they keep rendering.
 * `theme` is deliberately not counted: Volto writes schema defaults, such as
 * VLT's default theme, into a new block's data.
 */
export const isCalloutConfigured = (data = {}) =>
  !!(data.calloutType || data.icon || data.title || data.text || data.link);

const findType = (type) => calloutTypes.find((t) => t.id === type);

/** What a type seeds: its icon, and the site's colours for it (if set). */
const typeDefaults = (type) => {
  const match = findType(type);
  return match ? { icon: match.icon, ...getCalloutTypeColors(type) } : {};
};

/** Data to merge in when a type is chosen for the first time. */
export const getInitialDataForType = (type) =>
  findType(type) ? { calloutType: type, ...typeDefaults(type) } : {};

/**
 * Data after changing an existing callout's type. The icon and colours
 * follow the new type only where they still hold the previous type's
 * starting value: anything the editor changed stays.
 */
export const changeCalloutType = (data, type) => {
  if (!findType(type)) return { ...data, calloutType: type };
  const previous = typeDefaults(data.calloutType);
  const next = typeDefaults(type);
  const result = { ...data, calloutType: type };
  ['icon', 'backgroundColor', 'iconColor'].forEach((key) => {
    const untouched = !data[key] || data[key] === previous[key];
    if (!untouched) return;
    if (next[key]) result[key] = next[key];
    else delete result[key];
  });
  return result;
};
