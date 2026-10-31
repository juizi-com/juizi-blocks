import React from 'react';
import { screen } from '@testing-library/react';
import { createIntl } from 'react-intl';
import {
  readTranslations,
  renderWithIntl as render,
} from '../_shared/testUtils';
import View, { hasRichText } from './View';
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

describe('Content Row wrapper', () => {
  it("keeps Volto's classes for the block beside its own", () => {
    const { container } = render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'statistics',
          items: [{ '@id': 'a', value: 1000, label: 'People' }],
        }}
        className="next--is--slate previous--has--same--backgroundColor"
      />,
    );
    const wrapper = container.querySelector('.block.contentRow');
    expect(wrapper.classList).toContain('next--is--slate');
    expect(wrapper.classList).toContain('type-statistics');
  });
});

describe('Content Row empty description', () => {
  const html = (data) => ({ 'content-type': 'text/html', data });

  it('treats a touched but empty description as no description', () => {
    expect(hasRichText(html('<p></p>'))).toBe(false);
    expect(hasRichText(html('<p><br></p>'))).toBe(false);
    expect(hasRichText(html('<p>&nbsp;</p>'))).toBe(false);
    expect(hasRichText([{ type: 'p', children: [{ text: ' ' }] }])).toBe(false);
    expect(hasRichText(html('<p>Text</p>'))).toBe(true);
    expect(hasRichText([{ type: 'p', children: [{ text: 'Text' }] }])).toBe(
      true,
    );
    expect(hasRichText('Plain text')).toBe(true);
  });

  it('leaves the text out of an item whose description is empty', () => {
    const { container } = render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'icon',
          items: [
            { '@id': 'a', heading: 'Empty', text: html('<p><br></p>') },
            { '@id': 'b', heading: 'Filled', text: html('<p>Words</p>') },
          ],
        }}
      />,
    );
    const texts = container.querySelectorAll('.content-row-item__text');
    expect(texts).toHaveLength(1);
    expect(texts[0].textContent).toBe('Words');
  });
});

describe('Content Row lines and list layouts', () => {
  const row = (data) =>
    render(
      <View
        data={{
          '@type': 'contentRow',
          items: [
            { '@id': 'a', heading: 'One' },
            { '@id': 'b', heading: 'Two' },
          ],
          ...data,
        }}
      />,
    ).container;
  const layoutFields = (data) =>
    schema({ data }).fieldsets.find((f) => f.id === 'layout').fields;

  it('puts a "below the items" button under the items when side by side', () => {
    const button = {
      displayMode: 'numbered',
      showViewAll: true,
      viewAllText: 'See more',
      viewAllUrl: [{ '@id': '/more' }],
      viewAllPosition: 'below',
    };
    const beside = row({ ...button, sideBySideLayout: true });
    expect(
      beside.querySelector(
        '.content-row__items > .content-row__view-all-bottom',
      ),
    ).not.toBeNull();
    const stacked = row(button);
    const bottom = stacked.querySelector('.content-row__view-all-bottom');
    expect(bottom.parentElement.classList).toContain('content-row__inner');
  });

  it('leaves saved rows without item borders (no new class)', () => {
    const section = row({ displayMode: 'numbered' }).querySelector('section');
    expect(section.className).not.toMatch(/content-row--(lines|joined)/);
  });

  it('offers None, lines and joined boxes in the styles that have them', () => {
    ['numbered', 'icon', 'statistics'].forEach((displayMode) => {
      expect(layoutFields({ displayMode })).toContain('itemBorders');
      ['lines', 'joined'].forEach((itemBorders) => {
        const section = row({ displayMode, itemBorders }).querySelector(
          'section',
        );
        expect(section.classList).toContain(`content-row--${itemBorders}`);
      });
      const none = row({ displayMode, itemBorders: 'none' });
      expect(none.querySelector('section').className).not.toMatch(
        /content-row--(lines|joined|none)/,
      );
    });
    const { choices } = schema({ data: { displayMode: 'icon' } }).properties
      .itemBorders;
    expect(choices.map(([value]) => value)).toEqual([
      'none',
      'lines',
      'joined',
    ]);
  });

  it("doesn't offer or apply item borders to image cards", () => {
    expect(layoutFields({ displayMode: 'card' })).not.toContain('itemBorders');
    const section = row({
      displayMode: 'card',
      itemBorders: 'joined',
    }).querySelector('section');
    expect(section.className).not.toMatch(/content-row--(lines|joined)/);
  });

  it('keeps an item with its own colour as its own box in joined boxes', () => {
    const container = row({
      displayMode: 'icon',
      itemBorders: 'joined',
      items: [
        { '@id': 'a', heading: 'Plain', icon: 'none' },
        {
          '@id': 'b',
          heading: 'Coloured',
          icon: 'none',
          backgroundColor: '#074b60',
        },
      ],
    });
    const items = container.querySelectorAll('.content-row-item');
    expect(items[0].style.backgroundColor).toBe('');
    expect(items[1].style.backgroundColor).not.toBe('');
  });

  it('puts the heading on the left and the text on the right', () => {
    const choices = schema({ data: { displayMode: 'numbered' } }).properties
      .iconPosition.choices;
    expect(choices.map(([value]) => value)).toEqual([
      'above',
      'left',
      'inline',
      'beside',
    ]);
    ['numbered', 'icon'].forEach((displayMode) => {
      const items = row({
        displayMode,
        iconPosition: 'beside',
      }).querySelectorAll('.content-row-item--beside');
      expect(items).toHaveLength(2);
    });
  });

  it('keeps the text above the heading in the left column, before the heading', () => {
    // The left column is the number/icon, the text above the heading and
    // the heading, in that order (style.css places them in column one).
    const item = row({
      displayMode: 'numbered',
      iconPosition: 'beside',
      items: [
        {
          '@id': 'a',
          preheader: 'Step one',
          heading: 'Discovery',
          text: 'Thirty minutes',
        },
      ],
    }).querySelector('.content-row-item--beside');
    const order = [...item.querySelectorAll('*')]
      .map((el) => el.className)
      .filter((name) =>
        /content-row-item__(number|preheader|heading|text)\b/.test(name),
      )
      .map((name) => name.match(/content-row-item__(\w+)/)[1]);
    expect(order).toEqual(['number', 'preheader', 'heading', 'text']);
  });

  it('keeps the existing positions as they were', () => {
    const container = row({ displayMode: 'icon', iconPosition: 'left' });
    expect(container.querySelectorAll('.content-row-item--left')).toHaveLength(
      2,
    );
    expect(container.querySelector('.content-row-item--beside')).toBeNull();
    const above = row({ displayMode: 'icon' });
    expect(
      above.querySelector(
        '.content-row-item--left, .content-row-item--inline, .content-row-item--beside',
      ),
    ).toBeNull();
  });

  it('shows no icon for "No icon", but keeps the circle for items with none saved', () => {
    const container = row({
      displayMode: 'icon',
      items: [
        { '@id': 'a', heading: 'Plain', icon: 'none' },
        { '@id': 'b', heading: 'Saved without an icon' },
        { '@id': 'c', heading: 'Globe', icon: 'Globe' },
      ],
    });
    const items = container.querySelectorAll('.content-row-item');
    expect(items[0].querySelector('.content-row-item__icon')).toBeNull();
    expect(items[1].querySelector('.content-row-item__icon')).not.toBeNull();
    expect(items[2].querySelector('.content-row-item__icon')).not.toBeNull();
  });

  it('offers "No icon" first and hides the circle colour for it', () => {
    const { items } = schema({ data: { displayMode: 'icon' } }).properties;
    expect(items.schema.properties.icon.choices[0]).toEqual([
      'none',
      'No icon',
    ]);
    const fields = (item) =>
      items.schemaExtender(items.schema, item).fieldsets[0].fields;
    expect(fields({ icon: 'none' })).not.toContain('iconCircleColor');
    expect(fields({ icon: 'Globe' })).toContain('iconCircleColor');
    expect(fields({})).toContain('iconCircleColor');
  });
});

describe('Content Row description', () => {
  const row = (descriptionText) =>
    render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'numbered',
          descriptionText,
          items: [{ '@id': 'a', heading: 'Liberty' }],
        }}
      />,
    ).container;

  it('keeps showing a description saved as plain text, as text', () => {
    const container = row('Fish & <chips> for all');
    const description = container.querySelector('.content-row__description');
    expect(description.tagName).toBe('P');
    expect(description.textContent).toBe('Fish & <chips> for all');
    expect(description.querySelector('chips')).toBeNull();
  });

  it('shows a rich-text description with its formatting and links', () => {
    const container = row({
      'content-type': 'text/html',
      data: '<p>Read <a href="/about">about us</a>.</p><p>Second.</p>',
    });
    const description = container.querySelector('.content-row__description');
    expect(description.classList).toContain('content-row__description--rich');
    expect(description.querySelector('a').getAttribute('href')).toBe('/about');
    expect(description.querySelectorAll('p')).toHaveLength(2);
  });

  it('leaves out an empty rich-text description, so no empty header shows', () => {
    const container = render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'numbered',
          descriptionText: { 'content-type': 'text/html', data: '<p></p>' },
        }}
      />,
    ).container;
    expect(container.querySelector('.content-row__description')).toBeNull();
    expect(container.querySelector('section')).toBeNull();
  });

  it('hands the editor saved plain text as rich text, without losing any', () => {
    const { plainTextToRichText } = jest.requireActual('../_shared/RichText');
    expect(plainTextToRichText('Fish & <chips>\nfor all\n\nNext')).toEqual({
      'content-type': 'text/html',
      data: '<p>Fish &amp; &lt;chips&gt; for all</p><p>Next</p>',
      encoding: 'utf8',
    });
    const rich = { 'content-type': 'text/html', data: '<p>Hi</p>' };
    expect(plainTextToRichText(rich)).toBe(rich);
    expect(plainTextToRichText('  ')).toBeUndefined();
    expect(schema({ data: {} }).properties.descriptionText.widget).toBe(
      'richtext',
    );
  });
});
