/** A colour in the master list. Blocks store it as `var(--<name>)`. */
export type ColorEntry = {
  /** CSS variable name without the leading dashes, e.g. `green`. */
  name: string;
  label: string;
  /** Hex value. */
  value: string;
  /** Dark colours get light text and vice versa. */
  dark: boolean;
  /** Text/icon colour used on top of this colour. Empty = automatic
   * (#ffffff on dark colours, #111111 on light ones). */
  foreground?: string;
};

/** One slot of a theme: a colour from the master list, optionally faded. */
export type ThemeSlot = {
  color: string;
  /** 0-100, 100 (or missing) = solid. */
  opacity?: number;
};

export const THEME_SLOTS = [
  'background',
  'foreground',
  'surface',
  'muted',
] as const;
export type ThemeSlotName = (typeof THEME_SLOTS)[number];

/** A Volto Light Theme block theme (`config.blocks.themes`). */
export type ThemeEntry = {
  name: string;
  label: string;
} & Partial<Record<ThemeSlotName, ThemeSlot>>;

export type BlockColorConfig = {
  /** Master-list colour names this block offers. Empty = all. */
  colors?: string[];
  /** Theme names this block offers. Empty = all. */
  themes?: string[];
  defaultTheme?: string;
  /** Callout only: the colours each callout type starts with, as master-list
   * colour names. Missing or empty = no colour. */
  calloutTypes?: Record<string, CalloutTypeColors>;
};

export type CalloutTypeColors = {
  background?: string;
  icon?: string;
};

export type ColorConfig = {
  colors: ColorEntry[];
  themes: ThemeEntry[];
  blocks: Record<string, BlockColorConfig>;
};

/** The Print button block's site-wide settings (dashboard: Print).
 * Mirrors juizi.blocks.settings.validate_print_config in the backend. */
export type PrintConfig = {
  /** The button's default look ('solid__green'); '' = automatic. */
  button_style: string;
  logo: 'site' | 'custom' | 'none';
  /** A picture's address, used when logo is 'custom'. */
  logo_url: string;
  /** Header lines and footer text, with [placeholders]. */
  heading: string;
  subheading: string;
  footer: string;
  /** Advanced: custom markup replacing the header lines / footer text. */
  header_html: string;
  footer_html: string;
  /** Block types left out of the printout. */
  exclude_blocks: string[];
  paper_size: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
};

export type JuiziBlocksSettings = {
  /** Switched off in the dashboard. */
  disabled_blocks: string[];
  /** Switched on although the block's own config keeps it off. */
  enabled_blocks: string[];
  /** Block id -> the user groups it is offered to. No entry = everybody. */
  block_groups: Record<string, string[]>;
  /** Language of the Juizi blocks' editing interface ('en', 'pt-br', ...);
   * '' follows the page's language. */
  editor_language: string;
  color_config: ColorConfig;
  print_config: PrintConfig;
};
