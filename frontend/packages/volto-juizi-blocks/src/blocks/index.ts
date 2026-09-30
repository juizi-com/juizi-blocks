/**
 * The Juizi block set.
 *
 * Every block listed here is registered in Volto and appears in the Juizi
 * Blocks dashboard, where it can be switched off and have its colour or
 * theme list narrowed. Block ids are unchanged from the previous add-on, so
 * existing content keeps rendering.
 *
 * To add a block: put it in components/Blocks/<Name>/ and add a definition
 * here with a unique `id`.
 */
import heroSVG from '@plone/volto/icons/image.svg';
import gridSVG from '@plone/volto/icons/apps.svg';
import carouselSVG from '@plone/volto/icons/slider.svg';
import linkSVG from '@plone/volto/icons/link.svg';
import gallerySVG from '@plone/volto/icons/images.svg';
import { HeroEdit, HeroSchema, HeroView } from '../components/Blocks/HeroBlock';
import {
  ContentRowEdit,
  ContentRowSchema,
  ContentRowView,
} from '../components/Blocks/ContentRow';
import {
  EmblaCarouselEdit,
  EmblaCarouselView,
  emblaCarouselSchema,
} from '../components/Blocks/EmblaCarousel';
import {
  EmblaGalleryEdit,
  EmblaGalleryView,
  emblaGallerySchema,
} from '../components/Blocks/EmblaGallery';
import {
  Edit as RedirectEdit,
  View as RedirectView,
  redirectSchema,
} from '../components/Blocks/Redirect';
import callout from '../components/Blocks/Callout';

export type JuiziBlockDefinition = {
  id: string;
  title: string;
  /** Shown in the dashboard next to the toggle. */
  description: string;
  icon: any;
  view: React.ComponentType<any>;
  edit: React.ComponentType<any>;
  /** The block has colour pickers fed by getBlockColorList(id): the
   * dashboard shows it in the "Colours per block" table. */
  usesColors?: boolean;
  /** The block uses Volto Light Theme themes (Styling > Background color):
   * the dashboard shows it in the "Themes per block" table. */
  usesThemes?: boolean;
  /** The block's sidebar schema, read by makeBlockEdit. Deliberately not
   * Volto's `blockSchema`: Volto merges `blockSchema` defaults into every
   * saved block when it renders, which would change how older content
   * looks. Called as ({ intl, props, data, formData }). */
  juiziSchema?: (args: {
    intl: any;
    props?: any;
    data?: any;
    formData?: any;
  }) => any;
  /** First-Time Editor Test: while this returns false for the block's data,
   * extra sidebar fieldsets added by the registry (VLT's Styling) are
   * hidden, so the editor only sees the block's first choice. */
  isConfigured?: (data: any) => boolean;
  restricted?: boolean | ((args: any) => boolean);
  schemaEnhancer?: (args: any) => any;
  /** Any other Volto block config (sidebarTab, security, ...). Blocks go in
   * the "Juizi" chooser group unless they set `group`. */
  [key: string]: any;
};

export const juiziBlocks: JuiziBlockDefinition[] = [
  {
    id: 'juiziHero',
    title: 'Hero',
    description:
      'Page header or themed section band with title, background image or video, and buttons.',
    icon: heroSVG,
    view: HeroView,
    edit: HeroEdit,
    juiziSchema: HeroSchema,
    sidebarTab: 1,
    blockHasOwnFocusManagement: false,
    usesColors: true,
  },
  {
    id: 'contentRow',
    title: 'Content Row',
    description:
      'Row of numbered steps, icons, statistics or image cards, with optional mobile carousel.',
    icon: gridSVG,
    view: ContentRowView,
    edit: ContentRowEdit,
    juiziSchema: ContentRowSchema,
    sidebarTab: 1,
    blockHasOwnFocusManagement: false,
    usesColors: true,
  },
  {
    id: 'emblaCarousel',
    title: 'Carousel',
    description:
      'Slides you add or pages found automatically, shown as a carousel, card row, reviews or scrolling logo strip.',
    icon: carouselSVG,
    view: EmblaCarouselView,
    edit: EmblaCarouselEdit,
    juiziSchema: emblaCarouselSchema,
    sidebarTab: 1,
    blockHasOwnFocusManagement: false,
    usesColors: true,
  },
  {
    id: 'emblaGallery',
    title: 'Gallery',
    description:
      'Pictures from the page or across the site, as a slideshow, even grid or natural grid, with an optional enlarged view.',
    icon: gallerySVG,
    view: EmblaGalleryView,
    edit: EmblaGalleryEdit,
    juiziSchema: emblaGallerySchema,
    sidebarTab: 1,
    blockHasOwnFocusManagement: false,
    usesColors: true,
  },
  {
    id: 'redirectBlock',
    title: 'Redirect',
    description:
      'Sends anonymous visitors to another page or URL. Editors are not redirected.',
    icon: linkSVG,
    view: RedirectView,
    edit: RedirectEdit,
    juiziSchema: redirectSchema,
    sidebarTab: 1,
    blockHasOwnFocusManagement: false,
    security: {
      addPermission: [],
      view: [],
    },
  },
  callout,
];
