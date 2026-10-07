/**
 * Image overlays: the one list every block with an image overlay offers
 * (Hero and Content Row backgrounds, Content Row picture cards). An
 * intentional exception to the colour list: this is image compositing, not a
 * background colour choice.
 *
 * Each overlay is an id (what blocks store), a label for editors and the CSS
 * `background` drawn over the image (null draws nothing). A site replaces the
 * whole list in its add-on's configuration (it loads after this one), and can
 * reuse the built-in ones by id:
 *
 *   import { overlayById } from 'volto-juizi-blocks/config/gradients';
 *
 *   config.settings.juiziBlocks.overlays = [
 *     overlayById('none'),
 *     { id: 'brand-side', label: 'Brand blue, from the left',
 *       background: 'linear-gradient(90deg, rgba(2,62,138,.94), transparent)' },
 *   ];
 *
 * A site's labels are shown as written (sites usually have one language);
 * the built-in labels are translated.
 */
import config from '@plone/volto/registry';
import messages from '../components/Blocks/_shared/messages';
import { translator } from '../components/Blocks/_shared/i18n';

type Translate = ReturnType<typeof translator>;

export type Overlay = {
  id: string;
  /** Shown to editors: as written, or translated with the schema's `t`. */
  label: string | ((t: Translate) => string);
  /** Any CSS background; null draws nothing. */
  background: string | null;
};

declare module '@plone/types' {
  export interface SettingsConfig {
    juiziBlocks?: {
      /** Replaces the built-in overlay list (DEFAULT_OVERLAYS). */
      overlays?: Overlay[];
    };
  }
}

const TINTS = [
  ['black', messages.overlayBlack, '0,0,0'],
  ['white', messages.overlayWhite, '255,255,255'],
  ['primary', messages.overlayBrand, 'var(--accent-color-rgb)'],
] as const;

const STRENGTHS = [
  [30, messages.overlayLight],
  [50, messages.overlayMedium],
  [70, messages.overlayDark],
] as const;

/** The built-in overlays, in the order editors see them. */
export const DEFAULT_OVERLAYS: Overlay[] = [
  {
    id: 'gradient',
    label: (t) => t(messages.overlayGradient),
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
  },
  { id: 'none', label: (t) => t(messages.none), background: null },
  ...TINTS.flatMap(([tint, color, rgb]) =>
    STRENGTHS.map(
      ([percent, strength]): Overlay => ({
        id: `${tint}-${percent}`,
        label: (t) =>
          t(messages.overlayTint, {
            color: t(color),
            strength: t(strength),
            percent,
          }),
        background: `rgba(${rgb},${percent / 100})`,
      }),
    ),
  ),
];

/** The overlay used when a block has none saved. */
export const DEFAULT_OVERLAY = 'gradient';

/** The overlays editors are offered: the site's list if it set one, else the
 * built-in list. Read at call time, so it's always the current list. */
export const getOverlays = (): Overlay[] =>
  config.settings?.juiziBlocks?.overlays ?? DEFAULT_OVERLAYS;

/** A built-in overlay, for a site that keeps some of them in its own list. */
export const overlayById = (id: string): Overlay | undefined =>
  DEFAULT_OVERLAYS.find((overlay) => overlay.id === id);

// The site's list first; then the built-in one, so blocks saved with a
// built-in overlay the site left out still look as they did.
const findOverlay = (id: string) =>
  getOverlays().find((overlay) => overlay.id === id) ?? overlayById(id);

const labelOf = (overlay: Overlay, t: Translate) =>
  typeof overlay.label === 'function' ? overlay.label(t) : overlay.label;

/**
 * Choices for a schema's overlay field; `t` is the schema's translator.
 * A saved value that isn't in the list is kept as a choice (with the
 * built-in label, or its id) so the field doesn't show up blank.
 */
export const getOverlayChoices = (
  t: Translate = translator(),
  saved?: string,
) => {
  const choices = getOverlays().map((overlay): [string, string] => [
    overlay.id,
    labelOf(overlay, t),
  ]);
  if (saved && !choices.some(([id]) => id === saved)) {
    const known = overlayById(saved);
    choices.push([saved, known ? labelOf(known, t) : saved]);
  }
  return choices;
};

/** Inline style for an overlay layer, or null when it draws nothing (None,
 * or an id no list has, such as an overlay the site has since removed). */
export const overlayBackground = (id: string | undefined) => {
  const background = findOverlay(id || DEFAULT_OVERLAY)?.background;
  return background ? { background } : null;
};
