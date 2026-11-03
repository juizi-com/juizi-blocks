/**
 * Dashboard › Print: the Print button block's site-wide settings. Edits
 * draft.print_config; the dashboard saves it with the rest.
 */
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import config from '@plone/volto/registry';
import {
  getBlockColorList,
  getButtonChoices,
  getButtonClasses,
  getDefaultButton,
} from '../../config/colors';
import { translator } from '../Blocks/_shared/i18n';
import { PLACEHOLDERS } from '../Blocks/PrintButton/print';
import messages from './messages';

const PAPER_SIZES = ['A4', 'A3', 'A5', 'Letter', 'Legal'];

// Blocks that are text on the page rather than a block of their own: they
// can't be left out separately.
const NOT_EXCLUDABLE = [
  'printReport',
  'slate',
  'text',
  'title',
  'description',
  'slateTable',
];

const PLACEHOLDER_HELP = {
  title: messages.printPlaceholderTitle,
  section: messages.printPlaceholderSection,
  'publication date': messages.printPlaceholderPublicationDate,
  today: messages.printPlaceholderToday,
  'site name': messages.printPlaceholderSiteName,
  'page address': messages.printPlaceholderPageAddress,
};

const Section = ({ title, help, children }) => (
  <section className="juizi-dashboard__section">
    <h2>{title}</h2>
    {help && <p className="juizi-dashboard__help">{help}</p>}
    {children}
  </section>
);

const Field = ({ label, help, children }) => (
  <label className="juizi-dashboard__field juizi-dashboard__print-field">
    <span>{label}</span>
    {children}
    {help && <span className="juizi-dashboard__muted">{help}</span>}
  </label>
);

const PrintEditor = ({ printConfig, onChange }) => {
  const intl = useIntl();
  const t = translator(intl);
  const set = (key, value) => onChange({ ...printConfig, [key]: value });

  const buttonChoices = getButtonChoices(getBlockColorList('printReport'), t);
  const sample = getButtonClasses(
    printConfig.button_style || getDefaultButton(),
    'print-button',
  );

  // Every block type in this build, by name, plus any saved ones it lacks.
  const blockTypes = useMemo(() => {
    const blocksConfig = config.blocks.blocksConfig || {};
    const types = Object.values(blocksConfig)
      .filter((block) => block?.id && !NOT_EXCLUDABLE.includes(block.id))
      .map((block) => ({
        id: block.id,
        title: intl.formatMessage({
          id: block.title || block.id,
          defaultMessage: block.title || block.id,
        }),
      }));
    (printConfig.exclude_blocks || []).forEach((id) => {
      if (!types.some((type) => type.id === id)) types.push({ id, title: id });
    });
    // Two kinds with the same name (the site's own Hero and Juizi's): tell
    // them apart by their internal name.
    const counts = types.reduce(
      (all, type) => ({ ...all, [type.title]: (all[type.title] || 0) + 1 }),
      {},
    );
    return types
      .map((type) =>
        counts[type.title] > 1
          ? { ...type, title: `${type.title} (${type.id})` }
          : type,
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [intl, printConfig.exclude_blocks]);

  const excluded = printConfig.exclude_blocks || [];
  const toggleBlock = (id, checked) =>
    set(
      'exclude_blocks',
      checked ? [...excluded, id] : excluded.filter((other) => other !== id),
    );

  const placeholders = (
    <ul className="juizi-dashboard__placeholders">
      {PLACEHOLDERS.map((name) => (
        <li key={name}>
          <code>[{name}]</code> {intl.formatMessage(PLACEHOLDER_HELP[name])}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <Section
        title={intl.formatMessage(messages.printButton)}
        help={intl.formatMessage(messages.printButtonHelp)}
      >
        <div className="juizi-dashboard__print-row">
          <select
            className="juizi-dashboard__select"
            aria-label={intl.formatMessage(messages.printButton)}
            value={printConfig.button_style}
            onChange={(e) => set('button_style', e.target.value)}
          >
            <option value="">
              {intl.formatMessage(messages.printButtonAutomatic)}
            </option>
            {buttonChoices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {/* What the button looks like with this choice. */}
          <span className="juizi-print juizi-dashboard__print-sample">
            <button
              type="button"
              className={sample.className}
              style={sample.style}
              tabIndex={-1}
              aria-hidden="true"
            >
              {intl.formatMessage(messages.printSampleButton)}
            </button>
          </span>
        </div>
      </Section>

      <Section
        title={intl.formatMessage(messages.printHeader)}
        help={intl.formatMessage(messages.printHeaderHelp)}
      >
        <fieldset className="juizi-dashboard__print-logo">
          <legend>{intl.formatMessage(messages.printLogo)}</legend>
          {[
            ['site', messages.printLogoSite],
            ['custom', messages.printLogoCustom],
            ['none', messages.printLogoNone],
          ].map(([value, label]) => (
            <label key={value} className="juizi-dashboard__group-option">
              <input
                type="radio"
                name="juizi-print-logo"
                value={value}
                checked={printConfig.logo === value}
                onChange={() => set('logo', value)}
              />
              {intl.formatMessage(label)}
            </label>
          ))}
        </fieldset>
        {printConfig.logo === 'custom' && (
          <Field
            label={intl.formatMessage(messages.printLogoUrl)}
            help={intl.formatMessage(messages.printLogoUrlHelp)}
          >
            <input
              className="juizi-dashboard__input"
              value={printConfig.logo_url}
              placeholder="/images/print-logo.png"
              onChange={(e) => set('logo_url', e.target.value)}
            />
          </Field>
        )}
        <Field label={intl.formatMessage(messages.printHeading)}>
          <input
            className="juizi-dashboard__input"
            value={printConfig.heading}
            onChange={(e) => set('heading', e.target.value)}
          />
        </Field>
        <Field label={intl.formatMessage(messages.printSubheading)}>
          <input
            className="juizi-dashboard__input"
            value={printConfig.subheading}
            onChange={(e) => set('subheading', e.target.value)}
          />
        </Field>
        <p className="juizi-dashboard__help">
          {intl.formatMessage(messages.printPlaceholders)}
        </p>
        {placeholders}
      </Section>

      <Section
        title={intl.formatMessage(messages.printFooter)}
        help={intl.formatMessage(messages.printFooterHelp)}
      >
        <Field label={intl.formatMessage(messages.printFooterText)}>
          <input
            className="juizi-dashboard__input"
            value={printConfig.footer}
            onChange={(e) => set('footer', e.target.value)}
          />
        </Field>
      </Section>

      <Section
        title={intl.formatMessage(messages.printPaper)}
        help={intl.formatMessage(messages.printPaperHelp)}
      >
        <div className="juizi-dashboard__print-row">
          <Field label={intl.formatMessage(messages.printPaperSize)}>
            <select
              className="juizi-dashboard__select"
              value={printConfig.paper_size}
              onChange={(e) => set('paper_size', e.target.value)}
            >
              {PAPER_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label={intl.formatMessage(messages.printOrientation)}>
            <select
              className="juizi-dashboard__select"
              value={printConfig.orientation}
              onChange={(e) => set('orientation', e.target.value)}
            >
              <option value="portrait">
                {intl.formatMessage(messages.printPortrait)}
              </option>
              <option value="landscape">
                {intl.formatMessage(messages.printLandscape)}
              </option>
            </select>
          </Field>
        </div>
      </Section>

      <Section
        title={intl.formatMessage(messages.printLeftOut)}
        help={intl.formatMessage(messages.printLeftOutHelp)}
      >
        <div className="juizi-dashboard__print-blocks">
          {blockTypes.map(({ id, title }) => (
            <label key={id} className="juizi-dashboard__group-option">
              <input
                type="checkbox"
                checked={excluded.includes(id)}
                onChange={(e) => toggleBlock(id, e.target.checked)}
              />
              {title}
            </label>
          ))}
        </div>
      </Section>

      <Section title={intl.formatMessage(messages.advanced)}>
        <details
          className="juizi-dashboard__print-advanced"
          open={!!(printConfig.header_html || printConfig.footer_html)}
        >
          <summary>{intl.formatMessage(messages.printCustomLayout)}</summary>
          <p className="juizi-dashboard__help">
            {intl.formatMessage(messages.printCustomLayoutHelp)}
          </p>
          <Field label={intl.formatMessage(messages.printCustomHeader)}>
            <textarea
              className="juizi-dashboard__input juizi-dashboard__code"
              rows={6}
              spellCheck={false}
              value={printConfig.header_html}
              onChange={(e) => set('header_html', e.target.value)}
            />
          </Field>
          <Field label={intl.formatMessage(messages.printCustomFooter)}>
            <textarea
              className="juizi-dashboard__input juizi-dashboard__code"
              rows={4}
              spellCheck={false}
              value={printConfig.footer_html}
              onChange={(e) => set('footer_html', e.target.value)}
            />
          </Field>
        </details>
      </Section>
    </>
  );
};

export default PrintEditor;
