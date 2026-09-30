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
// In View.jsx, lucideIconMap is checked first; if the key isn't found there,
// the custom SVG map is used, then FallbackIcon.
// =============================================================================

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
const lucideChoices = [
  // Communication
  ['Globe', 'Globe'],
  ['Mail', 'Mail'],
  ['Phone', 'Phone'],
  ['MessageCircle', 'Message'],
  ['Send', 'Send'],
  ['Rss', 'RSS'],

  // People & organisation
  ['Users', 'People'],
  ['User', 'Person'],
  ['UserCheck', 'Person (verified)'],
  ['Building', 'Building'],
  ['Briefcase', 'Briefcase'],
  ['GraduationCap', 'Education'],

  // Content & media
  ['BookOpen', 'Book'],
  ['FileText', 'Document'],
  ['Newspaper', 'News'],
  ['Video', 'Video'],
  ['Mic', 'Microphone'],

  // Navigation & links
  ['Link', 'Link'],
  ['ExternalLink', 'External link'],
  ['ArrowRight', 'Arrow right'],
  ['Home', 'Home'],
  ['MapPin', 'Location'],

  // Actions
  ['Search', 'Search'],
  ['Download', 'Download'],
  ['Upload', 'Upload'],
  ['Share2', 'Share'],
  ['Star', 'Star'],
  ['Heart', 'Heart'],
  ['Bookmark', 'Bookmark'],
  ['Check', 'Check'],

  // Data & tech
  ['BarChart2', 'Chart'],
  ['TrendingUp', 'Trending up'],
  ['Shield', 'Shield'],
  ['Lock', 'Lock'],
  ['Code', 'Code'],
  ['Database', 'Database'],

  // General
  ['Leaf', 'Leaf'],
  ['Sun', 'Sun'],
  ['Zap', 'Lightning'],
  ['Award', 'Award'],
  ['Flag', 'Flag'],
  ['Clock', 'Clock'],
  ['Calendar', 'Calendar'],
  ['Settings', 'Settings'],
  ['HelpCircle', 'Help'],
  ['Info', 'Info'],
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

// ─── Combined export ───────────────────────────────────────────────────────
// Lucide choices first, custom SVGs appended after.
export const iconChoicesList = [...lucideChoices, ...customSvgChoices];
