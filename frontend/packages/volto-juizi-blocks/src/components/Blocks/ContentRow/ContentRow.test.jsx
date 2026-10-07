import React from 'react';
import { screen } from '@testing-library/react';
import { createIntl } from 'react-intl';
import {
  readTranslations,
  renderWithIntl as render,
} from '../_shared/testUtils';
import View from './View';
import schema from './schema';

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
jest.mock('embla-carousel-react', () => () => [() => {}, undefined]);

describe('Content Row', () => {
  it('lists the four real styles, in dropdown order (CR3)', () => {
    render(<View data={{ '@type': 'contentRow' }} isEditMode />);
    ['Numbered', 'Icon', 'Statistics', 'Image card'].forEach((name) =>
      expect(screen.getByText(name)).toBeTruthy(),
    );
    expect(screen.queryByText('Image above')).toBeNull();
    const choices = schema({ data: {} }).properties.displayMode.choices;
    expect(choices.map(([value]) => value)).toEqual([
      'numbered',
      'icon',
      'statistics',
      'card',
    ]);
  });

  it('speaks the site language on the canvas and in the sidebar', () => {
    const messages = readTranslations('fr');
    render(<View data={{ '@type': 'contentRow' }} isEditMode />, {
      locale: 'fr',
      messages,
    });
    expect(
      screen.getByText(
        'Sélectionnez un style d’affichage dans la barre latérale pour commencer.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Numéroté')).toBeTruthy();

    const intl = createIntl({ locale: 'af', messages: readTranslations('af') });
    const { title, properties } = schema({
      intl,
      data: { displayMode: 'card', statAnimationMs: 1500 },
    });
    expect(title).toBe('Inhoudry');
    expect(properties.displayMode.title).toBe('Vertoonstyl');
    // Custom values, plurals and the text visitors read are translated too.
    expect(properties.statAnimationMs.choices.pop()[1]).toBe(
      'Pasgemaak (1,5 sekondes)',
    );
    expect(properties.items.schema.properties.buttonText.default).toBe(
      'Lees meer',
    );
  });

  it('uses displayMode, not variation (CR1: VLT hides option 4 of "variation")', () => {
    const { fieldsets } = schema({ data: {} });
    expect(fieldsets[0].fields).toEqual(['displayMode']);
  });

  it('prompts editors to add the first item, shows visitors nothing (CR2)', () => {
    const data = { '@type': 'contentRow', displayMode: 'icon', items: [] };
    const edit = render(<View data={data} isEditMode />);
    expect(edit.container.textContent).toContain('No items yet');
    const live = render(<View data={data} />);
    expect(live.container.innerHTML).toBe('');
  });

  it('shows the real number before counting (CR11)', () => {
    const { container } = render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'statistics',
          items: [{ '@id': 'a', value: 1000, label: 'People' }],
        }}
      />,
    );
    expect(container.textContent).toContain('1,000');
  });

  it('puts Items second, after the heading (CR4)', () => {
    const ids = schema({ data: { displayMode: 'card' } }).fieldsets.map(
      (f) => f.id,
    );
    expect(ids.slice(0, 3)).toEqual(['default', 'header', 'items-card']);
  });

  describe('background image', () => {
    const backgroundImage = [{ '@id': 'http://localhost:3000/images/pattern' }];
    const row = (extra) =>
      render(
        <View
          data={{
            '@type': 'contentRow',
            displayMode: 'numbered',
            headerText: 'What we stand for',
            items: [{ '@id': 'a', heading: 'Liberty' }],
            backgroundImage,
            ...extra,
          }}
        />,
      ).container.querySelector('section');

    it('draws the image behind the block, with the overlay chosen', () => {
      const section = row({});
      expect(
        section.querySelector('.content-row__bg').style.backgroundImage,
      ).toContain('/images/pattern/@@images/image');
      // Unset: the same default gradient as a Hero.
      expect(
        section.querySelector('.content-row__overlay--gradient'),
      ).toBeTruthy();
      expect(
        row({ backgroundOverlay: 'none' }).querySelector(
          '.content-row__overlay',
        ),
      ).toBeNull();
    });

    it('keeps the text colour on the background colour', () => {
      expect(row({ backgroundColor: 'var(--white)' }).classList).toContain(
        'bg-light',
      );
      // No colour: like a Section, the text keeps the page's colour.
      expect(row({}).classList).not.toContain('bg-dark');
    });

    it('offers position and overlay only once an image is picked', () => {
      const fields = (data) =>
        schema({ data: { displayMode: 'numbered', ...data } }).fieldsets.find(
          (f) => f.id === 'background',
        ).fields;
      expect(fields({})).not.toContain('backgroundOverlay');
      expect(fields({ backgroundImage })).toEqual(
        expect.arrayContaining(['backgroundPosition', 'backgroundOverlay']),
      );
    });
  });

  describe('item text colour', () => {
    const image = [{ '@id': 'http://localhost:3000/images/photo' }];
    const itemClasses = (data, item) =>
      render(
        <View
          data={{
            '@type': 'contentRow',
            displayMode: 'card',
            headerText: 'Cards',
            items: [{ '@id': 'a', heading: 'One', image, ...item }],
            ...data,
          }}
        />,
      ).container.querySelector('.content-row-item').classList;

    it('keeps text on the block colour for a picture above it', () => {
      // A transparent item with a picture above its text was marked dark,
      // which gave white text on a white block.
      const classes = itemClasses(
        { imageCardStyle: 'above' },
        { backgroundColor: 'transparent' },
      );
      expect(classes).not.toContain('bg-dark');
      expect(classes).not.toContain('bg-light');
    });

    it('keeps text on the block colour for a picture card without a picture', () => {
      const classes = itemClasses(
        { imageCardStyle: 'overlay' },
        { image: undefined, backgroundColor: 'transparent' },
      );
      expect(classes).not.toContain('bg-dark');
    });

    it('makes text light over a picture behind it', () => {
      expect(itemClasses({ imageCardStyle: 'overlay' }, {})).toContain(
        'bg-dark',
      );
    });

    it("follows the item's own colour, else the block's", () => {
      expect(
        itemClasses(
          { imageCardStyle: 'above' },
          { backgroundColor: 'var(--white)' },
        ),
      ).toContain('bg-light');
      // No colour of its own in a dark block: no tone of its own (the text
      // follows the block), and no box padding.
      const inDark = itemClasses(
        { imageCardStyle: 'above', backgroundColor: 'var(--night)' },
        { backgroundColor: 'transparent' },
      );
      expect(inDark).not.toContain('bg-dark');
      expect(inDark).not.toContain('bg-light');
    });
  });
});
