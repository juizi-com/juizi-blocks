/**
 * The printout: the header and footer from the dashboard's Print settings,
 * the paper, the blocks left out, and getting the page ready for the
 * browser's print. Kept apart from the View so it can be tested on its own.
 *
 * Printing uses the browser's own print on the page itself (not a copy in a
 * frame), so the site's styles apply. While printing, everything outside the
 * page's content is hidden, and the header and footer are added around it.
 */
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { formatDate } from '../_shared/format';

/** The placeholders the dashboard offers, as typed: "[publication date]". */
export const PLACEHOLDERS = [
  'title',
  'section',
  'publication date',
  'today',
  'site name',
  'page address',
];

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/** Replaces [placeholders] with their values (escaped for HTML). Brackets
 * that aren't a placeholder are left as typed. */
export const fillPlaceholders = (text, values) =>
  String(text || '').replace(/\[([a-z ]+)\]/gi, (match, name) => {
    const key = name.trim().toLowerCase();
    return key in values ? escapeHtml(values[key]) : match;
  });

/**
 * "[section]": the title of the section the page is in, one level below the
 * main menu ("Risk Alert" for /products/risk-alert/2026/debt-peaks), or the
 * main menu section for pages higher up.
 */
export const sectionTitle = (breadcrumbs = []) => {
  const items = (breadcrumbs || []).filter((item) => item?.title);
  return (items.length >= 3 ? items[1] : items[0])?.title || '';
};

const isDate = (value) =>
  !!value && value !== 'None' && !String(value).startsWith('1969');

/** The placeholders' values for this page. */
export const printValues = ({
  content,
  breadcrumbs,
  site,
  language,
  pageUrl = '',
  now = new Date(),
}) => ({
  title: content?.title || '',
  section: sectionTitle(breadcrumbs),
  'publication date': isDate(content?.effective)
    ? formatDate(content.effective, undefined, language)
    : '',
  today: formatDate(now, undefined, language),
  'site name': site?.['plone.site_title'] || '',
  'page address': pageUrl,
});

/** The logo's address: the site logo, another picture, or none. */
export const printLogo = (printConfig, site) => {
  if (printConfig.logo === 'none') return '';
  if (printConfig.logo === 'custom') {
    return printConfig.logo_url ? flattenToAppURL(printConfig.logo_url) : '';
  }
  return site?.['plone.site_logo']
    ? flattenToAppURL(site['plone.site_logo'])
    : '';
};

const UNSAFE_ELEMENTS =
  'script, iframe, frame, object, embed, link, meta, base, form, input, button, textarea, select';
const UNSAFE_URL = /^\s*(?:javascript|vbscript|data(?!:image\/))/i;

/**
 * The web team's custom header or footer markup, without anything that
 * could run (scripts, frames, on… attributes, javascript: links). Site
 * managers write it, but it's shown to everyone who prints.
 */
export const cleanHtml = (html, doc = document) => {
  const template = doc.createElement('template');
  template.innerHTML = html;
  template.content
    .querySelectorAll(UNSAFE_ELEMENTS)
    .forEach((element) => element.remove());
  template.content.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach(({ name, value }) => {
      const lower = name.toLowerCase();
      if (
        lower.startsWith('on') ||
        (['href', 'src', 'xlink:href', 'action', 'formaction'].includes(
          lower,
        ) &&
          UNSAFE_URL.test(value))
      ) {
        element.removeAttribute(name);
      }
    });
  });
  return template.innerHTML;
};

/** The header's markup: the custom markup, else the logo and two lines. */
export const headerHtml = (printConfig, values, logo, doc) => {
  if (printConfig.header_html) {
    return cleanHtml(
      fillPlaceholders(printConfig.header_html, { ...values, logo }),
      doc,
    );
  }
  const heading = fillPlaceholders(printConfig.heading, values).trim();
  const subheading = fillPlaceholders(printConfig.subheading, values).trim();
  if (!logo && !heading && !subheading) return '';
  return [
    logo &&
      `<div class="juizi-print-header__logo"><img src="${escapeHtml(logo)}" alt="${escapeHtml(values['site name'])}"></div>`,
    (heading || subheading) &&
      `<div class="juizi-print-header__text">${
        heading ? `<p class="juizi-print-header__heading">${heading}</p>` : ''
      }${
        subheading
          ? `<p class="juizi-print-header__subheading">${subheading}</p>`
          : ''
      }</div>`,
  ]
    .filter(Boolean)
    .join('');
};

/** The footer's markup: the custom markup, else the footer text. */
export const footerHtml = (printConfig, values, logo, doc) => {
  if (printConfig.footer_html) {
    return cleanHtml(
      fillPlaceholders(printConfig.footer_html, { ...values, logo }),
      doc,
    );
  }
  const text = fillPlaceholders(printConfig.footer, values).trim();
  return text ? `<p>${text}</p>` : '';
};

const BLOCK_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/;

/** The paper, and the block types left out. */
export const pageCss = (printConfig) => {
  const excluded = (printConfig.exclude_blocks || [])
    .filter((blockType) => BLOCK_ID.test(blockType))
    .map((blockType) => `html.juizi-printing .block.${blockType}`);
  return [
    `@page { size: ${printConfig.paper_size || 'A4'} ${
      printConfig.orientation || 'portrait'
    }; margin: 15mm; }`,
    excluded.length
      ? `@media print { ${excluded.join(', ')} { display: none !important; } }`
      : '',
  ].join('\n');
};

/** The page's content: what's printed. */
export const findContent = (doc = document) =>
  doc.querySelector('#page-document') || doc.querySelector('main') || doc.body;

/**
 * Gets the page ready to print: the paper and left-out blocks, the header
 * and footer around the content, and everything else on the page hidden.
 * Only print styles change, so the screen looks the same. Returns a
 * function that puts everything back.
 */
export const preparePrint = ({ content, header, footer, css }) => {
  const doc = content.ownerDocument;
  const added = [];
  const style = doc.createElement('style');
  style.setAttribute('data-juizi-print', '');
  style.textContent = css;
  doc.head.appendChild(style);
  added.push(style);

  const place = (className, html, before) => {
    if (!html) return;
    const element = doc.createElement('div');
    element.className = className;
    element.innerHTML = html;
    content.parentNode.insertBefore(element, before);
    added.push(element);
  };
  place('juizi-print-header', header, content);
  place('juizi-print-footer', footer, content.nextSibling);

  // Everything beside the content and beside each of its containers, up to
  // the page itself: the site header, menus, footer, toolbar.
  const hidden = [];
  for (
    let node = content;
    node && node !== doc.body;
    node = node.parentElement
  ) {
    [...(node.parentElement?.children || [])].forEach((sibling) => {
      if (
        sibling !== node &&
        !added.includes(sibling) &&
        !sibling.hasAttribute('data-juizi-print-hidden')
      ) {
        sibling.setAttribute('data-juizi-print-hidden', '');
        hidden.push(sibling);
      }
    });
  }
  doc.documentElement.classList.add('juizi-printing');

  return () => {
    doc.documentElement.classList.remove('juizi-printing');
    hidden.forEach((element) =>
      element.removeAttribute('data-juizi-print-hidden'),
    );
    added.forEach((element) => element.remove());
  };
};

/**
 * Loads the content's pictures that are waiting to scroll into view, so
 * they're in the printout. Gives up after `timeout` milliseconds: a slow
 * picture shouldn't stop the printing.
 */
export const loadImages = (content, timeout = 5000) => {
  const pending = [...content.querySelectorAll('img')]
    .map((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
      if (img.complete) return null;
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
    .filter(Boolean);
  if (!pending.length) return Promise.resolve();
  return Promise.race([
    Promise.all(pending),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);
};
