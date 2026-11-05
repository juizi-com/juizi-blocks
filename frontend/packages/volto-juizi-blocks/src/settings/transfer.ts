/**
 * Moving the dashboard's settings from one site to another: Site Setup >
 * Juizi Blocks > Export and import.
 *
 * Export writes the saved settings to a JSON file. Import reads one back,
 * part by part, into the dashboard's unsaved draft: nothing is stored until
 * the person clicks Save, and the backend checks every value again then.
 */
import type { ColorConfig, JuiziBlocksSettings } from './types';
import { validateColorConfig } from './helpers';

/** Marks a file as ours, so another JSON file is refused, not half-read. */
export const TRANSFER_FORMAT = 'juizi-blocks-settings';
/** Raised when the file's layout changes in a way older add-ons can't read. */
export const TRANSFER_FORMAT_VERSION = 1;

/** The parts of the settings that can be imported on their own. */
export const TRANSFER_PARTS = [
  'blocks',
  'language',
  'colors',
  'print',
] as const;
export type TransferPart = (typeof TRANSFER_PARTS)[number];

/** The settings keys each part brings. */
export const PART_KEYS: Record<TransferPart, (keyof JuiziBlocksSettings)[]> = {
  blocks: ['disabled_blocks', 'enabled_blocks', 'block_groups'],
  language: ['editor_language'],
  colors: ['color_config'],
  print: ['print_config'],
};

export type TransferFile = {
  format: typeof TRANSFER_FORMAT;
  format_version: number;
  /** When it was exported, ISO 8601. */
  exported: string;
  /** The site it came from. */
  site: string;
  /** The volto-juizi-blocks version that wrote it. */
  addon_version: string;
  settings: JuiziBlocksSettings;
};

/** Why a file, or one of its parts, can't be imported. */
export type TransferProblem =
  | { code: 'notJson' }
  | { code: 'notOurs' }
  | { code: 'newerFormat'; version: number }
  | { code: 'partInvalid'; part: TransferPart };

export type ReadTransfer =
  | { ok: false; problem: TransferProblem }
  | {
      ok: true;
      file: TransferFile;
      /** The parts the file has and that can be imported. */
      parts: TransferPart[];
      /** Parts the file has but that can't be imported, e.g. colours that
       * fail the dashboard's own checks. */
      invalid: TransferPart[];
    };

/** The export file for the given (saved) settings. */
export function buildTransferFile(
  settings: JuiziBlocksSettings,
  {
    site,
    addonVersion,
    now = new Date(),
  }: {
    site: string;
    addonVersion: string;
    now?: Date;
  },
): TransferFile {
  return {
    format: TRANSFER_FORMAT,
    format_version: TRANSFER_FORMAT_VERSION,
    exported: now.toISOString(),
    site,
    addon_version: addonVersion,
    settings: {
      disabled_blocks: settings.disabled_blocks,
      enabled_blocks: settings.enabled_blocks,
      block_groups: settings.block_groups,
      editor_language: settings.editor_language,
      color_config: settings.color_config,
      print_config: settings.print_config,
    },
  };
}

/** The download's file name: the site's host and the day, e.g.
 * `juizi-blocks-settings-plone.org-2026-11-05.json`. */
export function transferFileName(site: string, now = new Date()): string {
  let host = '';
  try {
    host = new URL(site).host.replace(/[^A-Za-z0-9.-]/g, '-');
  } catch {
    // Not a full URL: leave the host out.
  }
  const day = now.toISOString().slice(0, 10);
  return [TRANSFER_FORMAT, host, day].filter(Boolean).join('-') + '.json';
}

const isObject = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** Whether the file has the part at all, in a shape the dashboard can show.
 * The backend validates every value when the draft is saved. */
const PART_PRESENT: Record<TransferPart, (s: Record<string, any>) => boolean> =
  {
    blocks: (s) =>
      'disabled_blocks' in s || 'enabled_blocks' in s || 'block_groups' in s,
    language: (s) => 'editor_language' in s,
    colors: (s) => 'color_config' in s,
    print: (s) => 'print_config' in s,
  };

/** The dashboard's own colour checks, which expect lists where the file may
 * have anything. */
const colorsValid = (config: Record<string, any>): boolean => {
  if (
    !Array.isArray(config.colors) ||
    !Array.isArray(config.themes) ||
    !isObject(config.blocks ?? {}) ||
    ![...config.colors, ...config.themes].every(isObject)
  ) {
    return false;
  }
  try {
    return validateColorConfig(config as ColorConfig).length === 0;
  } catch {
    return false;
  }
};

const PART_VALID: Record<TransferPart, (s: Record<string, any>) => boolean> = {
  blocks: (s) =>
    isStringList(s.disabled_blocks ?? []) &&
    isStringList(s.enabled_blocks ?? []) &&
    isObject(s.block_groups ?? {}) &&
    Object.values(s.block_groups ?? {}).every(isStringList),
  language: (s) => typeof s.editor_language === 'string',
  colors: (s) => isObject(s.color_config) && colorsValid(s.color_config),
  print: (s) => isObject(s.print_config),
};

/** Reads an export file's text. */
export function readTransferFile(text: string): ReadTransfer {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, problem: { code: 'notJson' } };
  }
  if (
    !isObject(data) ||
    data.format !== TRANSFER_FORMAT ||
    !isObject(data.settings)
  ) {
    return { ok: false, problem: { code: 'notOurs' } };
  }
  const version = Number(data.format_version);
  if (!(version >= 1)) {
    return { ok: false, problem: { code: 'notOurs' } };
  }
  if (version > TRANSFER_FORMAT_VERSION) {
    return { ok: false, problem: { code: 'newerFormat', version } };
  }

  const settings = data.settings;
  const present = TRANSFER_PARTS.filter((part) => PART_PRESENT[part](settings));
  return {
    ok: true,
    file: data as TransferFile,
    parts: present.filter((part) => PART_VALID[part](settings)),
    invalid: present.filter((part) => !PART_VALID[part](settings)),
  };
}

/** The draft with the chosen parts of an imported file in place. Parts not
 * chosen are left as they are. */
export function applyTransfer<T extends Partial<JuiziBlocksSettings>>(
  draft: T,
  file: TransferFile,
  parts: TransferPart[],
): T {
  const next: Record<string, unknown> = { ...draft };
  const { settings } = file;
  if (parts.includes('blocks')) {
    next.disabled_blocks = settings.disabled_blocks ?? [];
    // As the backend keeps them: a block in both lists is switched off.
    const disabled = new Set(next.disabled_blocks as string[]);
    next.enabled_blocks = (settings.enabled_blocks ?? []).filter(
      (id) => !disabled.has(id),
    );
    next.block_groups = settings.block_groups ?? {};
  }
  if (parts.includes('language')) {
    next.editor_language = settings.editor_language;
  }
  if (parts.includes('colors')) {
    next.color_config = settings.color_config;
  }
  if (parts.includes('print')) {
    next.print_config = settings.print_config;
  }
  return next as T;
}

/** The user groups the file's blocks are limited to that this site doesn't
 * have: those blocks would be offered to nobody here. */
export function missingGroups(
  file: TransferFile,
  siteGroups: { id: string }[],
): string[] {
  const known = new Set(siteGroups.map((group) => group.id));
  const wanted = new Set(
    Object.values(file.settings.block_groups ?? {}).flat(),
  );
  return [...wanted].filter((id) => !known.has(id)).sort();
}
