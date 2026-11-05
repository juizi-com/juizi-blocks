/**
 * Dashboard tab "Export and import": copies the settings from one site to
 * another as a JSON file (settings/transfer.ts).
 *
 * Export downloads the saved settings. Import puts the parts the person
 * picks into the dashboard's draft, as unsaved changes: they look them over
 * on the other tabs and click Save, or Cancel to drop them.
 */
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  applyTransfer,
  buildTransferFile,
  missingGroups,
  readTransferFile,
  transferFileName,
} from '../../settings';
import messages from './messages';

const PART_LABELS = {
  blocks: messages.transferPartBlocks,
  language: messages.transferPartLanguage,
  colors: messages.transferPartColors,
  print: messages.transferPartPrint,
};

const PROBLEM_MESSAGES = {
  notJson: messages.transferNotJson,
  notOurs: messages.transferNotOurs,
  newerFormat: messages.transferNewerFormat,
};

/** Offers `text` as a file download in the browser. */
const download = (text, fileName) => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** A picked file's text. FileReader rather than `file.text()`, which older
 * browsers and the test environment lack. */
const readText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const formatDate = (intl, iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : intl.formatDate(date, { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * @param {object} props
 * @param {object} props.saved The settings as saved on this site.
 * @param {object} props.draft The dashboard's draft.
 * @param {boolean} props.dirty Whether the draft has unsaved changes.
 * @param {string} props.site This site's address.
 * @param {string} props.addonVersion The volto-juizi-blocks version.
 * @param {?Array<{id: string}>} props.userGroups This site's user groups,
 *   `null` until loaded.
 * @param {function} props.onImport Called with the new draft.
 */
const TransferPanel = ({
  saved,
  draft,
  dirty,
  site,
  addonVersion,
  userGroups,
  onImport,
}) => {
  const intl = useIntl();
  const input = useRef(null);
  // The file being imported: what readTransferFile made of it, its name,
  // and the parts ticked so far.
  const [loaded, setLoaded] = useState(null);
  const [chosen, setChosen] = useState([]);
  const [imported, setImported] = useState(null);

  const exportSettings = () => {
    const file = buildTransferFile(saved, { site, addonVersion });
    download(JSON.stringify(file, null, 2), transferFileName(site));
  };

  const readFile = async (event) => {
    const file = event.target.files?.[0];
    // Clear it, so picking the same file again reads it again.
    event.target.value = '';
    if (!file) return;
    let text;
    try {
      text = await readText(file);
    } catch {
      text = '';
    }
    const result = readTransferFile(text);
    setLoaded({ ...result, name: file.name });
    setChosen(result.ok ? result.parts : []);
    setImported(null);
  };

  const toggle = (part) =>
    setChosen((current) =>
      current.includes(part)
        ? current.filter((p) => p !== part)
        : [...current, part],
    );

  const importParts = () => {
    onImport(applyTransfer(draft, loaded.file, chosen));
    setImported(chosen);
    setLoaded(null);
    setChosen([]);
  };

  const missing =
    loaded?.ok && chosen.includes('blocks') && userGroups
      ? missingGroups(loaded.file, userGroups)
      : [];

  return (
    <>
      <section className="juizi-dashboard__section">
        <h2>{intl.formatMessage(messages.transferExport)}</h2>
        <p className="juizi-dashboard__help">
          {intl.formatMessage(messages.transferExportHelp)}
        </p>
        {dirty && (
          <p className="juizi-dashboard__hint juizi-dashboard__hint--warning">
            {intl.formatMessage(messages.transferExportUnsaved)}
          </p>
        )}
        <div className="juizi-dashboard__actions">
          <button
            type="button"
            className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
            onClick={exportSettings}
          >
            {intl.formatMessage(messages.transferExportButton)}
          </button>
        </div>
      </section>

      <section className="juizi-dashboard__section">
        <h2>{intl.formatMessage(messages.transferImport)}</h2>
        <p className="juizi-dashboard__help">
          {intl.formatMessage(messages.transferImportHelp)}
        </p>

        {imported && (
          <div className="juizi-dashboard__notice" role="status">
            {intl.formatMessage(messages.transferImported, {
              parts: imported
                .map((part) => intl.formatMessage(PART_LABELS[part]))
                .join(', '),
            })}
          </div>
        )}

        {loaded && !loaded.ok && (
          <div className="juizi-dashboard__error" role="alert">
            {intl.formatMessage(PROBLEM_MESSAGES[loaded.problem.code], {
              name: loaded.name,
            })}
          </div>
        )}

        {loaded?.ok && (
          <div className="juizi-dashboard__transfer">
            <p>
              {intl.formatMessage(messages.transferFrom, {
                name: loaded.name,
                site: loaded.file.site || '?',
                date: formatDate(intl, loaded.file.exported),
              })}
            </p>
            {loaded.parts.length === 0 ? (
              <p className="juizi-dashboard__hint juizi-dashboard__hint--warning">
                {intl.formatMessage(messages.transferNothing)}
              </p>
            ) : (
              <fieldset className="juizi-dashboard__parts">
                <legend>{intl.formatMessage(messages.transferChoose)}</legend>
                {loaded.parts.map((part) => (
                  <label key={part} className="juizi-dashboard__check">
                    <input
                      type="checkbox"
                      checked={chosen.includes(part)}
                      onChange={() => toggle(part)}
                    />
                    {intl.formatMessage(PART_LABELS[part])}
                  </label>
                ))}
              </fieldset>
            )}
            {loaded.invalid.map((part) => (
              <p
                key={part}
                className="juizi-dashboard__hint juizi-dashboard__hint--warning"
              >
                {intl.formatMessage(messages.transferPartInvalid, {
                  part: intl.formatMessage(PART_LABELS[part]),
                })}
              </p>
            ))}
            {missing.length > 0 && (
              <p className="juizi-dashboard__hint juizi-dashboard__hint--warning">
                {intl.formatMessage(messages.transferMissingGroups, {
                  groups: missing.join(', '),
                })}
              </p>
            )}
            <div className="juizi-dashboard__actions">
              <button
                type="button"
                className="juizi-dashboard__btn juizi-dashboard__btn--primary"
                onClick={importParts}
                disabled={chosen.length === 0}
              >
                {intl.formatMessage(messages.transferImportButton)}
              </button>
              <button
                type="button"
                className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
                onClick={() => setLoaded(null)}
              >
                {intl.formatMessage(messages.transferCancel)}
              </button>
            </div>
          </div>
        )}

        {!loaded?.ok && (
          <div className="juizi-dashboard__actions">
            <button
              type="button"
              className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
              onClick={() => input.current?.click()}
            >
              {intl.formatMessage(messages.transferChooseFile)}
            </button>
            <input
              ref={input}
              type="file"
              accept="application/json,.json"
              hidden
              aria-label={intl.formatMessage(messages.transferChooseFile)}
              onChange={readFile}
            />
          </div>
        )}
      </section>
    </>
  );
};

export default TransferPanel;
