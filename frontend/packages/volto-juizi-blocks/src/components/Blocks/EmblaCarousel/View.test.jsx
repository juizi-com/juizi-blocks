// Render of a manual slide with an external link
// and a button label (audit C3). Volto's Jest setup needs a window, so this
// can't prove the absence of `window` reads during a real server render:
// confirm that on a running site.
import React from 'react';
import {
  readTranslations,
  renderWithIntl as render,
} from '../_shared/testUtils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import View from './View';

jest.mock('../_shared/BlockWrapper');
jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () =>
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  ({ href, ...props }) => <a href={href} {...props} />,
);
jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'https://www.example.org',
    apiPath: 'https://www.example.org',
    externalRoutes: [],
  },
  blocks: { blocksConfig: {} },
}));

// jsdom has neither; Embla and the logo strip use them.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  global.IntersectionObserver = global.IntersectionObserver || NoopObserver;
  global.ResizeObserver = global.ResizeObserver || NoopObserver;
});

describe('Carousel static render', () => {
  it('renders an external slide link and its button', () => {
    const store = configureStore()({ search: { subrequests: {} } });
    const { container } = render(
      <Provider store={store}>
        <View
          id="abcdef123"
          data={{
            '@type': 'emblaCarousel',
            displayMode: 'full',
            title: 'Partners',
            slides: [
              {
                '@id': 's1',
                heading: 'Visit us',
                buttonText: 'Go',
                link: { '@id': 'https://other.org/page' },
              },
            ],
          }}
        />
      </Provider>,
    );
    const html = container.innerHTML;
    expect(html).toContain('Partners');
    expect(html).toContain('href="https://other.org/page"');
    expect(html).toContain('Go');
    // The error boundary's editor message must not be what rendered.
    expect(html).not.toContain("couldn't be displayed");
  });
});

describe('Carousel Reviews style', () => {
  const review = {
    '@id': 'r1',
    heading: 'Thandi Nkosi',
    content: 'The workshop changed how our team works.',
    organisation: 'Harbour Trust',
    rating: '4',
    image: [{ '@id': '/people/thandi', '@type': 'Image' }],
    link: { '@id': 'https://other.org/review' },
  };
  const renderReviews = (data, props = {}, state = {}, intl = {}) => {
    const store = configureStore()({
      search: { subrequests: {} },
      ...state,
    });
    const result = render(
      <Provider store={store}>
        <View
          id="abcdef123"
          data={{ '@type': 'emblaCarousel', displayMode: 'reviews', ...data }}
          {...props}
        />
      </Provider>,
      intl,
    );
    return { ...result, store };
  };

  it('renders a review as a quotation with its source', () => {
    const { container } = renderReviews({ slides: [review] });
    const figure = container.querySelector('figure.review');
    expect(figure.querySelector('blockquote').textContent).toBe(
      'The workshop changed how our team works.',
    );
    expect(figure.querySelector('figcaption').textContent).toBe(
      'Thandi NkosiHarbour Trust',
    );
    // The reviews style has no slide heading or button.
    expect(container.querySelector('h3')).toBeNull();
    expect(container.querySelector('.embla__slide-btn')).toBeNull();
    // The picture isn't painted behind the text.
    const slide = container.querySelector('.carousel-slide-inner');
    expect(slide.className).toContain('reviews');
    expect(slide.className).not.toContain('no-image');
    expect(slide.style.backgroundImage).toBe('none');
  });

  it('gives the stars one text alternative, and hides the icons from it', () => {
    const { container } = renderReviews({ slides: [review] });
    const stars = container.querySelector('.review__stars');
    expect(stars.getAttribute('role')).toBe('img');
    expect(stars.getAttribute('aria-label')).toBe('Rated 4 out of 5');
    const icons = stars.querySelectorAll('svg');
    expect(icons).toHaveLength(5);
    icons.forEach((icon) =>
      expect(icon.getAttribute('aria-hidden')).toBe('true'),
    );
    expect(stars.querySelectorAll('.is-filled')).toHaveLength(4);
  });

  it('describes the stars in the site’s language', () => {
    const { container } = renderReviews(
      { slides: [review] },
      {},
      {},
      { locale: 'fr', messages: readTranslations('fr') },
    );
    expect(
      container.querySelector('.review__stars').getAttribute('aria-label'),
    ).toBe('Note : 4 sur 5');
  });

  it('shows no stars without a rating, or with "No stars"', () => {
    const { container } = renderReviews({
      slides: [
        { ...review, rating: undefined },
        { ...review, '@id': 'r2', rating: '0' },
      ],
    });
    expect(container.querySelectorAll('figure.review')).toHaveLength(2);
    expect(container.querySelector('.review__stars')).toBeNull();
  });

  it('treats the picture as decoration: the name says who it is', () => {
    const { container } = renderReviews({ slides: [review] });
    const picture = container.querySelector('.review__picture');
    expect(picture.getAttribute('alt')).toBe('');
    expect(picture.getAttribute('src')).toContain('/people/thandi');
  });

  it('makes the name the review’s one link', () => {
    const { container } = renderReviews({ slides: [review] });
    const links = container.querySelectorAll('.carousel-slide-inner a');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('https://other.org/review');
    expect(links[0].textContent).toBe('Thandi Nkosi');
    // Not stretched over the review unless the editor asks for it.
    expect(links[0].className).not.toContain('embla__stretched-link');
  });

  it('stretches that link over the review when the whole card is clickable', () => {
    const { container } = renderReviews({
      clickableSlides: true,
      slides: [review, { ...review, '@id': 'r2', heading: '' }],
    });
    const [named, unnamed] = container.querySelectorAll(
      '.carousel-slide-inner',
    );
    expect(named.className).toContain('clickable');
    expect(named.querySelector('a').className).toContain(
      'embla__stretched-link',
    );
    // A link with no name has nothing to click: not a link, not clickable.
    expect(unnamed.className).not.toContain('clickable');
    expect(unnamed.querySelector('a')).toBeNull();
  });

  it('leaves unfinished reviews out for visitors and says nothing to them', () => {
    const { container } = renderReviews({
      slides: [
        review,
        { '@id': 'r2' },
        { ...review, '@id': 'r3', heading: '' },
      ],
    });
    expect(container.querySelectorAll('.embla__slide')).toHaveLength(2);
    expect(container.querySelector('.block__edit-hint')).toBeNull();
    expect(container.querySelector('.block__unfinished')).toBeNull();
  });

  it('shows editors what is unfinished', () => {
    const { container } = renderReviews(
      {
        slides: [
          review,
          { '@id': 'r2' },
          { ...review, '@id': 'r3', heading: '' },
        ],
      },
      { isEditMode: true, onChangeBlock: () => {} },
    );
    expect(container.querySelectorAll('.embla__slide')).toHaveLength(3);
    expect(container.querySelector('.block__unfinished').textContent).toBe(
      'Add the review text and the name in the sidebar.',
    );
    const warning = container.querySelector('.block__edit-hint--warning');
    expect(warning.textContent).toContain('has a link but no name');
    expect(warning.getAttribute('role')).toBe('status');
  });

  it('tells editors what to do when there are no reviews, and shows visitors nothing', () => {
    const editor = renderReviews(
      { title: 'What people say' },
      { isEditMode: true, onChangeBlock: () => {} },
    );
    expect(editor.container.textContent).toContain(
      'No reviews yet. Add reviews in the sidebar under Reviews.',
    );
    const visitor = renderReviews({ title: 'What people say' });
    expect(visitor.container.innerHTML).toBe('');
  });

  it('ignores an automatic fill left over from another style', () => {
    const { container, store } = renderReviews(
      {
        useListing: true,
        query: { query: [{ i: 'portal_type', v: ['News Item'] }] },
        slides: [review],
      },
      {},
      {
        search: {
          subrequests: {
            abcdef123: { items: [{ '@id': '/news/a', title: 'A news item' }] },
          },
        },
      },
    );
    expect(container.querySelectorAll('.embla__slide')).toHaveLength(1);
    expect(container.textContent).not.toContain('A news item');
    // No search is made for a carousel that doesn't show its results.
    expect(store.getActions()).toEqual([]);
  });

  it('names the section by its heading', () => {
    const { container } = renderReviews({
      title: 'What people say',
      slides: [review],
    });
    const section = container.querySelector('section.embla');
    const heading = container.querySelector('h2');
    expect(heading.textContent).toBe('What people say');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(section.className).toContain('type-reviews');
  });
});
