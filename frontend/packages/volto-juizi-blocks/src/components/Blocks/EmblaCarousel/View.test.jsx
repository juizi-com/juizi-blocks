// Render of a manual slide with an external link
// and a button label (audit C3). Volto's Jest setup needs a window, so this
// can't prove the absence of `window` reads during a real server render:
// confirm that on a running site (see block-audit-actions.md C3).
import React from 'react';
import { render } from '@testing-library/react';
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
