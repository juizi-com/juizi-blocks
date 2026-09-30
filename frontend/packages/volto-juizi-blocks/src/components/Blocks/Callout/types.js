/**
 * Callout types: the one decision an editor makes before anything else
 * (First-Time Editor Test). A type seeds a matching icon and the colours the
 * site set for it in the dashboard (Callout types). The type stays in the
 * sidebar, so the editor can see and change it.
 */
import { getCalloutTypeColors } from '../../../settings/runtime';

export const calloutTypes = [
  {
    id: 'info',
    label: 'Information',
    description: 'neutral background information or context',
    icon: 'info',
  },
  {
    id: 'tip',
    label: 'Tip',
    description: 'a helpful suggestion or good practice',
    icon: 'lightbulb',
  },
  {
    id: 'warning',
    label: 'Warning',
    description: 'something the reader needs to be careful about',
    icon: 'alert-triangle',
  },
  {
    id: 'success',
    label: 'Success',
    description: 'a positive outcome, confirmation or achievement',
    icon: 'check-circle',
  },
  {
    id: 'announcement',
    label: 'Announcement',
    description: 'news, an update or a call to action',
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
