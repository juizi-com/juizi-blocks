import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import View from './View';
import printButton from './index';
import { printButtonSchema } from './schema';
import {
  cleanHtml,
  fillPlaceholders,
  footerHtml,
  headerHtml,
  pageCss,
  preparePrint,
  printLogo,
  printValues,
  sectionTitle,
} from './print';
import { DEFAULT_PRINT_CONFIG } from '../../../settings';

jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('../_shared/BlockWrapper');

const content = {
  '@id': '/products/risk-alert/debt-peaks',
  title: 'Debt peaks at last',
  effective: '2026-10-26T08:00:00+00:00',
};
const breadcrumbs = [
  { '@id': '/products', title: 'Products' },
  { '@id': '/products/risk-alert', title: 'Risk Alert' },
  { '@id': '/products/risk-alert/debt-peaks', title: 'Debt peaks at last' },
];
const site = {
  'plone.site_title': 'Centre for Risk Analysis',
  'plone.site_logo': 'http://localhost:3000/@@site-logo/logo.svg',
};
const values = printValues({
  content,
  breadcrumbs,
  site,
  pageUrl: 'https://example.org/debt-peaks',
  now: new Date('2026-11-03T10:00:00Z'),
});

const renderView = (props, printConfig = {}) => {
  const store = configureStore()({
    content: { data: content },
    breadcrumbs: { items: breadcrumbs },
    site: { data: site },
    juiziBlocksSettings: {
      data: { print_config: { ...DEFAULT_PRINT_CONFIG, ...printConfig } },
    },
  });
  return render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <View data={{ '@type': 'printReport' }} {...props} />
      </IntlProvider>
    </Provider>,
  );
};

describe('Print button block', () => {
  it('keeps the Print Report block id sites already use', () => {
    expect(printButton.id).toBe('printReport');
    expect(printButton.usesColors).toBe(true);
  });

  it('offers the text, look and position, with no schema defaults', () => {
    const schema = printButtonSchema({ data: {} });
    expect(schema.fieldsets[0].fields).toEqual([
      'label',
      'buttonStyle',
      'align',
    ]);
    Object.values(schema.properties).forEach((field) =>
      expect(field.default).toBeUndefined(),
    );
  });

  it('shows a Print button in the site’s style, on the right', () => {
    const { container } = renderView({}, { button_style: 'solid__green' });
    const button = screen.getByRole('button', { name: 'Print' });
    expect(button.className).toContain('btn-solid');
    expect(button.className).toContain('btn-color-green');
    expect(container.querySelector('.juizi-print--right')).not.toBeNull();
  });

  it('lets a block choose its own text, look and position', () => {
    const { container } = renderView(
      {
        data: {
          '@type': 'printReport',
          label: 'Print this report',
          buttonStyle: 'outline__gold',
          align: 'left',
        },
      },
      { button_style: 'solid__green' },
    );
    const button = screen.getByRole('button', { name: 'Print this report' });
    expect(button.className).toContain('btn-outline');
    expect(button.className).toContain('btn-color-gold');
    expect(container.querySelector('.juizi-print--left')).not.toBeNull();
  });

  it('only explains itself in the editor, where it never prints', () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => {});
    const { container } = renderView({ isEditMode: true });
    expect(container.textContent).toContain('Site Setup › Juizi Blocks');
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(print).not.toHaveBeenCalled();
    print.mockRestore();

    const visitor = renderView({});
    expect(visitor.container.textContent).not.toContain('Site Setup');
  });

  it('keeps a right-hand button in the flow in the editor, so it can be selected', () => {
    const editor = renderView({ isEditMode: true });
    expect(
      editor.container.querySelector(
        '.juizi-print--right.juizi-print--editing',
      ),
    ).not.toBeNull();
    const visitor = renderView({});
    expect(visitor.container.querySelector('.juizi-print--editing')).toBeNull();
  });

  it('prints the page with the header and footer added', async () => {
    document.body.innerHTML = '';
    const page = document.createElement('main');
    page.innerHTML = '<div id="page-document"><p>Report</p></div>';
    document.body.appendChild(page);
    let added = null;
    const print = jest.spyOn(window, 'print').mockImplementation(() => {
      added = document.querySelector('.juizi-print-header')?.textContent;
    });
    renderView({});
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    await screen.findByRole('button', { name: 'Preparing…' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(print).toHaveBeenCalled();
    expect(added).toContain('Risk Alert');
    // Put back once printing is done.
    window.dispatchEvent(new Event('afterprint'));
    expect(document.querySelector('.juizi-print-header')).toBeNull();
    await screen.findByRole('button', { name: 'Print' });
    print.mockRestore();
  });
});

describe('printout', () => {
  it('fills in the placeholders, escaped, leaving other brackets alone', () => {
    expect(fillPlaceholders('[section] · [Publication date]', values)).toBe(
      'Risk Alert · 26 October 2026',
    );
    expect(fillPlaceholders('[today] [unknown]', values)).toBe(
      '3 November 2026 [unknown]',
    );
    expect(fillPlaceholders('[title]', { title: '<b>A & B</b>' })).toBe(
      '&lt;b&gt;A &amp; B&lt;/b&gt;',
    );
  });

  it('takes the section one level below the main menu', () => {
    expect(sectionTitle(breadcrumbs)).toBe('Risk Alert');
    expect(sectionTitle(breadcrumbs.slice(0, 2))).toBe('Products');
    expect(sectionTitle([])).toBe('');
  });

  it('leaves out dates a page never had', () => {
    expect(
      printValues({ content: { effective: 'None' } })['publication date'],
    ).toBe('');
  });

  it('uses the site logo, another picture or none', () => {
    expect(printLogo(DEFAULT_PRINT_CONFIG, site)).toBe('/@@site-logo/logo.svg');
    expect(
      printLogo(
        { logo: 'custom', logo_url: 'http://localhost:3000/images/p.png' },
        site,
      ),
    ).toBe('/images/p.png');
    expect(printLogo({ logo: 'none' }, site)).toBe('');
  });

  it('builds the header and footer from the settings', () => {
    const header = headerHtml(DEFAULT_PRINT_CONFIG, values, '/logo.svg');
    expect(header).toContain('<img src="/logo.svg"');
    expect(header).toContain('Risk Alert');
    expect(header).toContain('26 October 2026');
    expect(footerHtml(DEFAULT_PRINT_CONFIG, values)).toBe(
      '<p>Printed from Centre for Risk Analysis on 3 November 2026</p>',
    );
    // Nothing to show: no header at all.
    expect(
      headerHtml({ heading: '', subheading: '[unknown date]' }, {}, ''),
    ).toBe(
      '<div class="juizi-print-header__text"><p class="juizi-print-header__subheading">[unknown date]</p></div>',
    );
    expect(headerHtml({ heading: '', subheading: '' }, values, '')).toBe('');
  });

  it('uses the web team’s markup, without anything that runs', () => {
    const config = {
      ...DEFAULT_PRINT_CONFIG,
      header_html:
        '<div onclick="steal()"><img src="[logo]"><script>steal()</script><a href="javascript:steal()">[title]</a></div>',
    };
    const html = headerHtml(config, values, '/logo.svg');
    expect(html).toBe(
      '<div><img src="/logo.svg"><a>Debt peaks at last</a></div>',
    );
    expect(cleanHtml('<img src="data:image/png;base64,AA">')).toContain(
      'data:image/png',
    );
  });

  it('sets the paper and leaves out the chosen blocks', () => {
    const css = pageCss({
      paper_size: 'Letter',
      orientation: 'landscape',
      exclude_blocks: ['video', 'bad}id'],
    });
    expect(css).toContain('size: Letter landscape');
    expect(css).toContain('html.juizi-printing .block.video');
    expect(css).not.toContain('bad');
  });

  it('hides everything around the content while printing, then undoes it', () => {
    document.body.innerHTML =
      '<header id="h"></header><div id="wrap"><nav id="n"></nav><div id="page-document"></div></div><footer id="f"></footer>';
    const content = document.getElementById('page-document');
    const cleanup = preparePrint({
      content,
      header: '<p>Top</p>',
      footer: '<p>Bottom</p>',
      css: '@page {}',
    });
    const hidden = [...document.querySelectorAll('[data-juizi-print-hidden]')];
    expect(hidden.map((element) => element.id).sort()).toEqual(['f', 'h', 'n']);
    expect(content.previousElementSibling.className).toBe('juizi-print-header');
    expect(content.nextElementSibling.className).toBe('juizi-print-footer');
    expect(document.documentElement.classList).toContain('juizi-printing');
    cleanup();
    expect(document.querySelectorAll('[data-juizi-print-hidden]').length).toBe(
      0,
    );
    expect(document.querySelector('.juizi-print-header')).toBeNull();
    expect(document.querySelector('style[data-juizi-print]')).toBeNull();
    expect(document.documentElement.classList).not.toContain('juizi-printing');
  });
});
