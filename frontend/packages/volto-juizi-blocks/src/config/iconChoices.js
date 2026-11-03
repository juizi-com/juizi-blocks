// =============================================================================
// iconChoices.js — Icon choices for ContentRow icon variation
// src/config/iconChoices.js
//
// Keys must match Lucide component names exactly (PascalCase) for Lucide icons.
// Custom SVGs live in src/components/Blocks/ContentRow/icons/ — any .svg file
// dropped there is picked up automatically via require.context. The filename
// (without extension) becomes the key, e.g. plone-logo.svg → 'plone-logo'.
// Use fill="currentColor" (or stroke="currentColor") in the SVG, not a fixed
// colour: the icon then follows the item's text colour. A hard-coded
// fill="white" (common in Figma exports) is invisible on light backgrounds.
//
// A site adds its own SVGs in its add-on's configuration (it loads after
// this one), without putting them in this package:
//
//   config.settings.juiziBlocks.icons = {
//     goal: goalSVG, // import goalSVG from './icons/goal.svg';
//   };
//
// The key is what blocks store, so keep it once in use. A site icon with the
// same name as one of the SVGs here replaces it.
//
// In View.jsx, lucideIconMap is checked first; if the key isn't found there,
// getCustomSvg() (the site's icons, then the SVGs here), then FallbackIcon.
// =============================================================================

import config from '@plone/volto/registry';

import {
  ArrowRight,
  Award,
  BarChart2,
  BellRing,
  BookOpen,
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Check,
  Circle,
  Clock,
  Code,
  Database,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  Flag,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Link,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Newspaper,
  Pencil,
  Phone,
  Rss,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Star,
  Sun,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import iconMessages from './iconMessages';
import { translator } from '../components/Blocks/_shared/i18n';

// ─── Lucide icon components ────────────────────────────────────────────────
// Imported one by one: `import * as` from lucide-react would put every
// Lucide icon in the bundle. Covers every choice below, the icons the legacy
// converter maps old IconLinkRow icons to (legacy/blocks.js ICONS), and the
// fallback. An icon saved on a page that isn't here renders as the fallback
// circle: add it here (and to the choices, if editors should pick it).
export const lucideIconMap = {
  ArrowRight,
  Award,
  BarChart2,
  BellRing,
  BookOpen,
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Check,
  Circle,
  Clock,
  Code,
  Database,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  Flag,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Link,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Newspaper,
  Pencil,
  Phone,
  Rss,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Star,
  Sun,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Zap,
};

export const FallbackIcon = Circle;

// ─── Lucide icon choices ───────────────────────────────────────────────────
// In the order editors see them. Each name is a message in iconMessages.js.
const lucideChoiceKeys = [
  // Communication
  'Globe',
  'Mail',
  'Phone',
  'MessageCircle',
  'Send',
  'Rss',
  // People & organisation
  'Users',
  'User',
  'UserCheck',
  'Building',
  'Briefcase',
  'GraduationCap',
  // Content & media
  'BookOpen',
  'FileText',
  'Newspaper',
  'Video',
  'Mic',
  // Navigation & links
  'Link',
  'ExternalLink',
  'ArrowRight',
  'Home',
  'MapPin',
  // Actions
  'Search',
  'Download',
  'Upload',
  'Share2',
  'Star',
  'Heart',
  'Bookmark',
  'Check',
  // Data & tech
  'BarChart2',
  'TrendingUp',
  'Shield',
  'Lock',
  'Code',
  'Database',
  // General
  'Leaf',
  'Sun',
  'Zap',
  'Award',
  'Flag',
  'Clock',
  'Calendar',
  'Settings',
  'HelpCircle',
  'Info',
];

// ─── Custom SVG icons ──────────────────────────────────────────────────────
// Scans src/components/Blocks/ContentRow/icons/ for .svg files at build time.
// Each file becomes an entry: filename (no extension) → SVG string.
// Drop any .svg into that folder and it appears in the icon picker automatically.

let customSvgChoices = [];
export const customSvgMap = {};

try {
  const ctx = require.context(
    '../components/Blocks/ContentRow/icons',
    false,
    /\.svg$/,
  );
  ctx.keys().forEach((key) => {
    const name = key.replace(/^\.\//, '').replace(/\.svg$/, '');
    const label = name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const mod = ctx(key);
    // SVG files loaded via @svgr/webpack export a React component as default.
    // We store the raw module so View.jsx can render it appropriately.
    customSvgMap[name] = mod.default || mod;
    customSvgChoices.push([name, label]);
  });
} catch (e) {
  // icons/ folder doesn't exist yet — that's fine
}

// ─── Site icons ────────────────────────────────────────────────────────────
// config.settings.juiziBlocks.icons (see the top of this file). Read at call
// time, so it's always the current list.

const getSiteIcons = () => config.settings?.juiziBlocks?.icons || {};

// risk-alert, risk_alert and RiskAlert all read 'Risk Alert'.
const iconLabel = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** A custom SVG by name: the site's own, else one from icons/ here. */
export const getCustomSvg = (name) =>
  getSiteIcons()[name] || customSvgMap[name];

// ─── Combined export ───────────────────────────────────────────────────────
// Lucide choices first, then the custom SVGs here, then the site's (one
// entry per name). `t` is the schema's translator; custom SVGs keep the name
// made from their file name.
export const getIconChoices = (t = translator()) => {
  const siteNames = Object.keys(getSiteIcons());
  return [
    ...lucideChoiceKeys.map((key) => [key, t(iconMessages[key])]),
    ...customSvgChoices.filter(([name]) => !siteNames.includes(name)),
    ...siteNames.map((name) => [name, iconLabel(name)]),
  ];
};

/** The choices in English, for code that has no translator. */
export const iconChoicesList = getIconChoices();
