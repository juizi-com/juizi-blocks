import React from 'react';
import { createIntl } from 'react-intl';
import { getBlockColorList } from '../../../config/colors';
import { renderWithIntl as render } from '../_shared/testUtils';
import View, { tierButtonStyle } from './View';
import pricingTiers from './index';
import schema from './schema';
import messages from './messages';

jest.mock('../_shared/BlockWrapper');
jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'http://localhost:3000',
    apiPath: '',
    externalRoutes: [],
  },
  blocks: { blocksConfig: {} },
}));
// Records the carousel's options and plugins (autoplay).
const mockEmbla = jest.fn(() => [() => {}, undefined]);
jest.mock(
  'embla-carousel-react',
  () =>
    (...args) =>
      mockEmbla(...args),
);
jest.mock('embla-carousel-autoplay', () => () => 'autoplay');

const intl = createIntl({ locale: 'en' });
const html = (data) => ({
  'content-type': 'text/html',
  data,
  encoding: 'utf8',
});
const link = (path) => [{ '@id': path, title: path }];
const tiers = [
  {
    '@id': 'tier-a',
    name: 'Essential',
    price: 'R 49 450',
    priceNote: 'incl. VAT',
    description: html('<p>For a small organisation.</p>'),
    features: html('<p>Plone build<br>Support</p>'),
    buttonText: 'Talk it through',
    buttonLink: link('/discovery'),
  },
  {
    '@id': 'tier-b',
    name: 'Popular',
    label: 'Most chosen',
    price: 'R 84 450',
    buttonText: 'Talk it through',
    buttonLink: link('/discovery'),
  },
  {
    '@id': 'tier-c',
    name: 'Enterprise',
    price: "Let's scope it",
    priceNote: 'quoted per project',
  },
];
const block = (data = {}) => ({ '@type': 'pricingTiers', tiers, ...data });

describe('Pricing tiers', () => {
  it('is in the colour tables and has no Volto blockSchema', () => {
    expect(pricingTiers.id).toBe('pricingTiers');
    expect(pricingTiers.usesColors).toBe(true);
    expect(pricingTiers.blockSchema).toBeUndefined();
  });

  it('renders nothing for visitors without tiers', () => {
    const { container } = render(<View data={{ '@type': 'pricingTiers' }} />);
    expect(container.innerHTML).toBe('');
    const titled = render(
      <View data={{ '@type': 'pricingTiers', title: 'Prices' }} />,
    );
    expect(titled.container.innerHTML).toBe('');
  });

  it('asks editors for a first tier', () => {
    const { container, getByText } = render(
      <View data={{ '@type': 'pricingTiers' }} isEditMode />,
    );
    expect(container.querySelector('.block-placeholder')).not.toBeNull();
    expect(getByText(messages.start.defaultMessage)).toBeTruthy();
  });

  it('shows every part of a tier, in the mockup order', () => {
    const { container } = render(<View data={block()} />);
    const grid = container.querySelector('.juizi-pricing__grid');
    expect(grid.classList).toContain('juizi-pricing__grid--columns-4');
    const first = grid.querySelector('.juizi-pricing__tier');
    expect([...first.children].map((el) => el.className.split(' ')[0])).toEqual(
      [
        'juizi-pricing__tier-head',
        'juizi-pricing__price-wrap',
        'juizi-pricing__tier-description',
        'juizi-pricing__features',
        'juizi-pricing__action',
      ],
    );
    expect(first.querySelector('h2').textContent).toBe('Essential');
    const button = first.querySelector('a.pricing-button');
    expect(button.getAttribute('href')).toBe('/discovery');
    expect(button.textContent).toBe('Talk it through');
  });

  it('shows the tag with the name and marks a price in words', () => {
    const { container } = render(<View data={block()} />);
    const grid = container.querySelector('.juizi-pricing__grid');
    const [, popular, enterprise] = grid.querySelectorAll(
      '.juizi-pricing__tier',
    );
    expect(popular.querySelector('.juizi-pricing__label').textContent).toBe(
      'Most chosen',
    );
    expect(
      enterprise.querySelector('.juizi-pricing__price').classList,
    ).toContain('juizi-pricing__price--words');
    expect(
      popular.querySelector('.juizi-pricing__price').classList,
    ).not.toContain('juizi-pricing__price--words');
  });

  it('makes tier names subheadings under a title', () => {
    const { container } = render(<View data={block({ title: 'Prices' })} />);
    expect(container.querySelector('h2.juizi-pricing__title').textContent).toBe(
      'Prices',
    );
    expect(
      container.querySelectorAll('.juizi-pricing__grid h3.juizi-pricing__name'),
    ).toHaveLength(3);
    expect(
      container.querySelector('section').getAttribute('aria-labelledby'),
    ).toBe(container.querySelector('h2').id);
  });

  it('highlights only the chosen tier, with a class for themes', () => {
    const { container } = render(
      <View data={block({ highlightedTier: 'tier-b' })} />,
    );
    const highlighted = container.querySelectorAll(
      '.juizi-pricing__grid .juizi-pricing__tier--highlighted',
    );
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].textContent).toContain('Popular');
    // A removed tier highlights nothing.
    const gone = render(<View data={block({ highlightedTier: 'tier-x' })} />);
    expect(
      gone.container.querySelector('.juizi-pricing__tier--highlighted'),
    ).toBeNull();
  });

  it('hides unfinished tiers and buttons from visitors, flags them for editors', () => {
    const data = block({
      tiers: [
        ...tiers,
        { '@id': 'tier-d', price: 'R 1' },
        { '@id': 'tier-e', name: 'No link', buttonText: 'Go' },
      ],
    });
    const live = render(<View data={data} />);
    const grid = live.container.querySelector('.juizi-pricing__grid');
    expect(grid.querySelectorAll('.juizi-pricing__tier')).toHaveLength(4);
    expect(grid.textContent).not.toContain('R 1');
    expect(grid.textContent).not.toContain('Go');

    const edit = render(<View data={data} isEditMode />);
    const editGrid = edit.container.querySelector('.juizi-pricing__grid');
    expect(editGrid.querySelectorAll('.juizi-pricing__tier')).toHaveLength(5);
    expect(editGrid.querySelectorAll('.block__unfinished')).toHaveLength(2);
    expect(editGrid.textContent).toContain(messages.addName.defaultMessage);
    expect(editGrid.textContent).toContain('Add a link');
  });

  it('renders the carousel by default, and not when switched off', () => {
    const on = render(<View data={block()} />);
    expect(on.container.querySelector('.juizi-pricing__embla')).not.toBeNull();
    expect(on.container.querySelector('section').classList).toContain(
      'juizi-pricing--mobile-carousel',
    );
    const off = render(<View data={block({ mobileCarousel: false })} />);
    expect(off.container.querySelector('.juizi-pricing__embla')).toBeNull();
  });

  it('can start the carousel on the highlighted tier, without autoplay', () => {
    const lastCall = () =>
      mockEmbla.mock.calls[mockEmbla.mock.calls.length - 1];
    render(
      <View
        data={block({ highlightedTier: 'tier-b', mobileAutoplay: true })}
      />,
    );
    expect(lastCall()[0].startIndex).toBe(0);
    expect(lastCall()[1]).toEqual(['autoplay']);

    render(
      <View
        data={block({
          highlightedTier: 'tier-b',
          mobileAutoplay: true,
          mobileStartHighlighted: true,
        })}
      />,
    );
    expect(lastCall()[0].startIndex).toBe(1);
    expect(lastCall()[1]).toEqual([]);

    // The highlighted tier was removed: back to the first card, autoplay on.
    render(
      <View
        data={block({
          highlightedTier: 'tier-x',
          mobileAutoplay: true,
          mobileStartHighlighted: true,
        })}
      />,
    );
    expect(lastCall()[0].startIndex).toBe(0);
    expect(lastCall()[1]).toEqual(['autoplay']);
  });

  it('adds arrows to the carousel only when chosen, beside or around it', () => {
    const embla = (data) =>
      render(<View data={block(data)} />).container.querySelector(
        '.juizi-pricing__embla',
      );
    const none = embla({});
    expect(none.querySelector('.mobile-carousel__arrow')).toBeNull();
    expect(none.className).toBe('juizi-pricing__embla');

    const middle = embla({ mobileArrows: 'middle' });
    expect(middle.classList).toContain('mobile-carousel--arrows-middle');
    const stage = middle.querySelector('.mobile-carousel__stage');
    expect([...stage.children].map((el) => el.className.split(' ')[0])).toEqual(
      [
        'mobile-carousel__arrow',
        'juizi-pricing__embla-viewport',
        'mobile-carousel__arrow',
      ],
    );
    expect(
      [...stage.querySelectorAll('button')].map((b) =>
        b.getAttribute('aria-label'),
      ),
    ).toEqual(['Previous slide', 'Next slide']);

    const below = embla({ mobileArrows: 'below' });
    expect(below.children[1].className).toBe('mobile-carousel__arrows');
    const above = embla({ mobileArrows: 'above' });
    expect(above.children[0].className).toBe('mobile-carousel__arrows');

    const colored = embla({
      mobileArrows: 'below',
      mobileArrowStyle: 'solid__teal',
    });
    expect(
      colored.querySelector('.mobile-carousel__arrow').classList,
    ).toContain('btn-solid');
    // One tier: nothing to move to.
    const single = embla({ tiers: [tiers[0]], mobileArrows: 'middle' });
    expect(single.querySelector('.mobile-carousel__arrow')).toBeNull();
  });

  it('hands themes its background and text colour as variables', () => {
    const colors = getBlockColorList('pricingTiers');
    const dark = colors.find(([, , l]) => l === 'dark')[0];
    const { container } = render(
      <View data={block({ backgroundColor: dark })} />,
    );
    const section = container.querySelector('section');
    expect(section.style.getPropertyValue('--juizi-pricing-background')).toBe(
      dark,
    );
    expect(
      section.style.getPropertyValue('--juizi-pricing-foreground'),
    ).toBeTruthy();
    const none = render(<View data={block()} />);
    expect(
      none.container.querySelector('section').getAttribute('style'),
    ).toBeNull();
  });

  it('colours cards from the block, with tier overrides', () => {
    const colors = getBlockColorList('pricingTiers');
    const dark = colors.find(([, , l]) => l === 'dark')[0];
    const light = colors.find(([, , l]) => l === 'light')[0];
    const { container } = render(
      <View
        data={block({
          cardColor: light,
          tiers: [tiers[0], { ...tiers[1], cardColor: dark }],
        })}
      />,
    );
    const [plain, own] = container.querySelectorAll(
      '.juizi-pricing__grid .juizi-pricing__tier',
    );
    expect(plain.classList).toContain('bg-light');
    expect(plain.classList).not.toContain('juizi-pricing__tier--plain');
    expect(own.classList).toContain('bg-dark');
    const none = render(<View data={block()} />);
    expect(
      none.container.querySelector('.juizi-pricing__tier').classList,
    ).toContain('juizi-pricing__tier--plain');
  });

  it('picks each button style: own, then per card colour, then block', () => {
    const colors = getBlockColorList('pricingTiers');
    const dark = colors.find(([, , l]) => l === 'dark')[0];
    expect(tierButtonStyle({ buttonStyle: 'solid__x' }, {}, colors)).toBe(
      'solid__x',
    );
    expect(tierButtonStyle({}, { buttonStyle: 'text__y' }, colors)).toBe(
      'text__y',
    );
    // A tier with its own colour gets a button that stands out against it.
    expect(
      tierButtonStyle({ cardColor: dark }, { buttonStyle: 'text__y' }, colors),
    ).toMatch(/^outline__/);
  });

  it('offers named tiers as the highlighted tier, once there are any', () => {
    const empty = schema({ intl, data: {} });
    const tierFields = empty.fieldsets.find((f) => f.id === 'tiers').fields;
    expect(tierFields).toEqual(['tiers']);
    const s = schema({
      intl,
      data: { tiers: [...tiers, { '@id': 'tier-d' }] },
    });
    expect(s.fieldsets.find((f) => f.id === 'tiers').fields).toContain(
      'highlightedTier',
    );
    expect(s.properties.highlightedTier.choices).toEqual([
      ['tier-a', 'Essential'],
      ['tier-b', 'Popular'],
      ['tier-c', 'Enterprise'],
    ]);
    // No defaults: Volto would write them into new blocks.
    Object.values(s.properties).forEach((p) =>
      expect(p.default).toBeUndefined(),
    );
  });

  it('hides autoplay and dots when the carousel is off', () => {
    const fields = (data) =>
      schema({ intl, data }).fieldsets.find((f) => f.id === 'mobile').fields;
    expect(fields({})).toEqual([
      'mobileCarousel',
      'mobileAutoplay',
      'mobileArrows',
      'mobileDots',
    ]);
    expect(fields({ mobileCarousel: false })).toEqual(['mobileCarousel']);
    // With a highlighted tier: the option to start on it, which hides
    // autoplay once ticked.
    expect(fields({ tiers, highlightedTier: 'tier-b' })).toEqual([
      'mobileCarousel',
      'mobileStartHighlighted',
      'mobileAutoplay',
      'mobileArrows',
      'mobileDots',
    ]);
    expect(
      fields({
        tiers,
        highlightedTier: 'tier-b',
        mobileStartHighlighted: true,
      }),
    ).toEqual([
      'mobileCarousel',
      'mobileStartHighlighted',
      'mobileArrows',
      'mobileDots',
    ]);
    expect(fields({ mobileArrows: 'middle' })).toEqual([
      'mobileCarousel',
      'mobileAutoplay',
      'mobileArrows',
      'mobileArrowStyle',
      'mobileDots',
    ]);
  });
});
