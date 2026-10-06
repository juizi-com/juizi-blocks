import { getHref, isExternalHref } from './links';
import { withSavedChoice, msToSeconds } from './choices';
import { formatDate, formatNumber, toLocale } from './format';
import { blockAnchorId, slugify } from './anchors';

jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'https://www.example.org',
    apiPath: 'https://www.example.org',
    internalApiPath: 'http://backend:8080/Plone',
    externalRoutes: [],
  },
}));

describe('getHref', () => {
  it('accepts every stored link shape', () => {
    expect(getHref([{ '@id': 'https://www.example.org/about' }])).toBe(
      '/about',
    );
    expect(getHref({ '@id': '/news' })).toBe('/news');
    // Older Redirect blocks saved a plain URL string (legacy safeguard L2).
    expect(getHref('https://other.org/x')).toBe('https://other.org/x');
    expect(getHref('/contact')).toBe('/contact');
  });

  it('keeps a link to the home page', () => {
    // The site root flattens to '', which read as "no link": buttons to the
    // home page were hidden from visitors and flagged as unfinished.
    expect(getHref([{ '@id': 'https://www.example.org' }])).toBe('/');
    expect(getHref({ '@id': '/' })).toBe('/');
    expect(getHref('https://www.example.org')).toBe('/');
    expect(
      getHref({
        '@id': '/l',
        '@type': 'Link',
        // eslint-disable-next-line no-template-curly-in-string
        remoteUrl: '${portal_url}',
      }),
    ).toBe('/');
  });

  it("returns '' when there is no usable link", () => {
    [undefined, null, '', '   ', [], [{}], {}, 42].forEach((value) =>
      expect(getHref(value)).toBe(''),
    );
  });

  it('links files to their download and Link items to their target', () => {
    expect(getHref([{ '@id': '/doc.pdf', '@type': 'File' }])).toBe(
      '/doc.pdf/@@download/file',
    );
    // Visitors are given the download address already: don't add it twice.
    expect(
      getHref([
        {
          '@id': 'https://www.example.org/doc.pdf/@@download/file',
          '@type': 'File',
        },
      ]),
    ).toBe('/doc.pdf/@@download/file');
    expect(
      getHref({ '@id': '/l', '@type': 'Link', remoteUrl: 'https://a.org' }),
    ).toBe('https://a.org');
    expect(
      getHref({
        '@id': '/l',
        '@type': 'Link',
        remoteUrl: '${portal_url}/events', // eslint-disable-line no-template-curly-in-string
      }),
    ).toBe('/events');
  });
});

describe('isExternalHref', () => {
  it('only treats other sites as external', () => {
    expect(isExternalHref('https://other.org/page')).toBe(true);
    expect(isExternalHref('//other.org/page')).toBe(true);
    expect(isExternalHref('https://www.example.org/page')).toBe(false);
    expect(isExternalHref('/page')).toBe(false);
    expect(isExternalHref('#top')).toBe(false);
    expect(isExternalHref('mailto:a@b.org')).toBe(false);
    expect(isExternalHref('')).toBe(false);
  });
});

describe('withSavedChoice', () => {
  const choices = [
    [4000, '4 seconds'],
    [8000, '8 seconds'],
  ];

  // Values as strings: Volto's select widget can't label a number.
  const asStrings = [
    ['4000', '4 seconds'],
    ['8000', '8 seconds'],
  ];

  it('gives the choices only, as strings, for known or empty values', () => {
    expect(withSavedChoice(choices, 8000)).toEqual(asStrings);
    expect(withSavedChoice(choices, '8000')).toEqual(asStrings);
    expect(withSavedChoice(choices, undefined)).toEqual(asStrings);
  });

  it('adds an unusual saved value as a custom choice', () => {
    expect(withSavedChoice(choices, 5000, msToSeconds)).toEqual([
      ...asStrings,
      ['5000', 'Custom (5 seconds)'],
    ]);
    expect(msToSeconds(1500)).toBe('1.5 seconds');
    expect(msToSeconds(1000)).toBe('1 second');
  });
});

describe('format', () => {
  it('formats dates and numbers as en-GB', () => {
    expect(formatDate('2024-11-13T10:00:00')).toBe('13 November 2024');
    expect(formatDate('not a date')).toBe('');
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('follows the site language, with British English for "en"', () => {
    const date = '2024-11-13T10:00:00';
    expect(formatDate(date, undefined, 'en')).toBe('13 November 2024');
    expect(formatDate(date, undefined, 'fr')).toBe('13 novembre 2024');
    expect(formatDate(date, undefined, 'es')).toBe('13 de noviembre de 2024');
    expect(formatDate(date, undefined, 'pt_BR')).toBe('13 de novembro de 2024');
    expect(formatDate(date, undefined, 'af')).toBe('13 November 2024');
    expect(formatDate(date, undefined, 'not a language')).toBe(
      '13 November 2024',
    );
    expect(toLocale('pt_BR')).toBe('pt-BR');
    expect(toLocale(undefined)).toBe('en-GB');
  });
});

describe('anchors', () => {
  it('keeps the anchor ids blocks already use on live pages', () => {
    expect(slugify('Our <b>Team</b> & Friends')).toBe('our-team-friends');
    expect(blockAnchorId('Our Team', 'abcdef123')).toBe('our-team-abcdef');
    expect(blockAnchorId('', 'abcdef123', 'embla')).toBe('embla-abcdef');
    expect(blockAnchorId('', 'abcdef123')).toBeUndefined();
  });
});
