/**
 * Juizi Blocks dashboard: Site Setup > Juizi Blocks (/controlpanel/juizi-blocks)
 *
 * Edits a local draft of the settings and saves it with a single PATCH to
 * @juizi-blocks-settings (Manager only on the backend).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import isEqual from 'lodash/isEqual';
import { toast } from 'react-toastify';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { useClient } from '@plone/volto/hooks/client/useClient';
import { getParentUrl } from '@plone/volto/helpers/Url/Url';
import { listGroups } from '@plone/volto/actions/groups/groups';
import { listActions } from '@plone/volto/actions/actions/actions';
import backSVG from '@plone/volto/icons/back.svg';
import saveSVG from '@plone/volto/icons/save.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import packageJson from '../../../package.json';
import { juiziBlocks } from '../../blocks';
import {
  EDITOR_LANGUAGES,
  getJuiziBlocksSettings,
  groupBlocks,
  updateJuiziBlocksSettings,
  useJuiziBlocksSettingsState,
  validateColorConfig,
} from '../../settings';
import BlockToggles from './BlockToggles';
import ColorsEditor from './ColorsEditor';
import ThemesEditor from './ThemesEditor';
import { hasVLT } from '../../config/vlt';
import BlockMatrix from './BlockMatrix';
import CalloutTypesEditor from './CalloutTypesEditor';
import PrintEditor from './PrintEditor';
import TransferPanel from './TransferPanel';
import messages from './messages';

const colorBlocks = juiziBlocks.filter((block) => block.usesColors);
const themeBlocks = juiziBlocks.filter((block) => block.usesThemes);
const hasCallout = juiziBlocks.some((block) => block.id === 'juiziCallout');

const Section = ({ title, help, children }) => (
  <section className="juizi-dashboard__section">
    <h2>{title}</h2>
    {help && <p className="juizi-dashboard__help">{help}</p>}
    {children}
  </section>
);

const toDraft = (data) => ({
  disabled_blocks: data.disabled_blocks || [],
  enabled_blocks: data.enabled_blocks || [],
  block_groups: data.block_groups || {},
  editor_language: data.editor_language || '',
  color_config: data.color_config,
  print_config: data.print_config,
});

const TABS = ['blocks', 'colors', 'print'];
/** Only for people who can see Site Setup (Managers and Site
 * Administrators): saving an import needs their rights on the backend. */
const ADMIN_TABS = ['transfer'];

const TAB_LABELS = {
  blocks: messages.tabBlocks,
  colors: messages.tabColors,
  print: messages.tabPrint,
  transfer: messages.tabTransfer,
};

/** Whether the user can see Site Setup, as Volto's toolbar decides it.
 * The dashboard loads the actions itself (see below). */
const useCanManage = () =>
  useSelector(
    (state) =>
      state.actions?.actions?.user?.some(
        (action) => action.id === 'plone_setup',
      ) ?? false,
  );

/** A problem from validateColorConfig as a sentence in the editor's
 * language. */
const issueText = (intl, { code, label, index, name, slot }) => {
  const isTheme = code.startsWith('theme');
  return intl.formatMessage(
    messages[`error${code.charAt(0).toUpperCase()}${code.slice(1)}`],
    {
      label:
        label ||
        intl.formatMessage(
          isTheme ? messages.unnamedTheme : messages.unnamedColor,
          { number: (index ?? 0) + 1 },
        ),
      name,
      slot: slot ? intl.formatMessage(messages[`slot_${slot}`]) : undefined,
    },
  );
};

const Dashboard = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const isClient = useClient();
  const state = useJuiziBlocksSettingsState();
  // Whether the site switches on Volto Light Theme (config/vlt.ts).
  const withVLT = hasVLT();
  const saved = useMemo(() => toDraft(state.data), [state.data]);
  const [draft, setDraft] = useState(saved);
  // The tab is kept in the URL hash (#colors) so it can be linked to.
  const canManage = useCanManage();
  const tabs = canManage ? [...TABS, ...ADMIN_TABS] : TABS;
  const [tab, setTab] = useState(
    [...TABS, ...ADMIN_TABS].includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : 'blocks',
  );
  // A linked admin tab, or the user's actions not loaded yet: the page
  // shows Blocks until it may show the tab.
  const shownTab = tabs.includes(tab) ? tab : 'blocks';
  const selectTab = (next) => {
    setTab(next);
    history.replace({ ...location, hash: next === 'blocks' ? '' : next });
  };
  // Every block registered in this build, read from the live config, so
  // blocks added or removed by a rebuild show up without any migration.
  const blockGroups = useMemo(
    () =>
      groupBlocks(config.blocks.blocksConfig, config.blocks.groupBlocksOrder),
    [],
  );

  // The site's user groups, for limiting blocks to some of them. They load
  // in the browser only: until then (and while the server renders, and the
  // browser's first render matches it) they're unknown, `null`, rather than
  // "none", so the page hydrates without a mismatch.
  const groups = useSelector((state) => state.groups);
  const userGroups =
    isClient && groups?.list?.loaded ? groups.groups || [] : null;

  useEffect(() => {
    dispatch(getJuiziBlocksSettings());
    dispatch(listGroups());
    // Volto gets the user's actions with the page's content, and a control
    // panel has none: opened directly, the store has no actions and the
    // admin tabs would stay hidden. Volto's own Users and Groups control
    // panel loads them the same way.
    dispatch(listActions(''));
  }, [dispatch]);

  // Reset the draft whenever fresh settings arrive from the backend.
  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = !isEqual(draft, saved);
  const errors = validateColorConfig(draft.color_config);
  const saving = state.update.loading;

  const save = () => {
    if (errors.length || saving) return;
    const printChanged = !isEqual(draft.print_config, saved.print_config);
    dispatch(updateJuiziBlocksSettings(draft))
      .then((result) =>
        // An older backend answers without print settings: it dropped them.
        printChanged && !(result && 'print_config' in result)
          ? toast.error(
              <Toast
                error
                title={intl.formatMessage(messages.printNotSaved)}
                content={intl.formatMessage(messages.printNotSupported)}
              />,
            )
          : toast.success(
              <Toast success title={intl.formatMessage(messages.saved)} />,
            ),
      )
      .catch((error) =>
        toast.error(
          <Toast
            error
            title={intl.formatMessage(messages.saveFailed)}
            content={error?.response?.body?.error?.message || ''}
          />,
        ),
      );
  };

  const setColorConfig = (color_config) =>
    setDraft((current) => ({ ...current, color_config }));

  if (state.installed === false) {
    return (
      <div className="juizi-dashboard controlpanel-juizi-blocks">
        <Helmet title={intl.formatMessage(messages.title)} />
        <h1>{intl.formatMessage(messages.title)}</h1>
        <div className="juizi-dashboard__error" role="alert">
          {intl.formatMessage(messages.notInstalled)}
        </div>
      </div>
    );
  }

  return (
    <div className="juizi-dashboard controlpanel-juizi-blocks">
      <Helmet title={intl.formatMessage(messages.title)} />
      <h1>{intl.formatMessage(messages.title)}</h1>
      <p className="juizi-dashboard__description">
        {intl.formatMessage(messages.intro)}
      </p>

      {state.get.error && (
        <div className="juizi-dashboard__error" role="alert">
          {intl.formatMessage(messages.loadFailed)}
        </div>
      )}

      {errors.length > 0 && (
        <div className="juizi-dashboard__error" role="alert">
          <strong>{intl.formatMessage(messages.fixErrors)}</strong>
          <ul>
            {errors.map((error) => {
              const text = issueText(intl, error);
              return <li key={text}>{text}</li>;
            })}
          </ul>
        </div>
      )}

      {dirty && errors.length === 0 && (
        <div className="juizi-dashboard__unsaved">
          <span>{intl.formatMessage(messages.unsaved)}</span>
          <button
            type="button"
            className="juizi-dashboard__btn juizi-dashboard__btn--primary"
            onClick={save}
            disabled={saving}
          >
            {intl.formatMessage(messages.save)}
          </button>
          <button
            type="button"
            className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
            onClick={() => setDraft(saved)}
            disabled={saving}
          >
            {intl.formatMessage(messages.cancel)}
          </button>
        </div>
      )}

      <div className="juizi-dashboard__tabs" role="tablist">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={shownTab === id}
            className={
              shownTab === id
                ? 'juizi-dashboard__tab juizi-dashboard__tab--active'
                : 'juizi-dashboard__tab'
            }
            onClick={() => selectTab(id)}
          >
            {intl.formatMessage(TAB_LABELS[id])}
          </button>
        ))}
      </div>

      {shownTab === 'blocks' && (
        <Section
          title={intl.formatMessage(messages.editingLanguage)}
          help={intl.formatMessage(messages.editingLanguageHelp)}
        >
          <select
            className="juizi-dashboard__select juizi-dashboard__language"
            aria-label={intl.formatMessage(messages.editingLanguage)}
            value={draft.editor_language}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                editor_language: e.target.value,
              }))
            }
          >
            <option value="">
              {intl.formatMessage(messages.editingLanguageFollow)}
            </option>
            {EDITOR_LANGUAGES.map(({ code, name }) => (
              <option key={code} value={code} lang={code}>
                {name}
              </option>
            ))}
          </select>
        </Section>
      )}

      {shownTab === 'blocks' && (
        <Section
          title={intl.formatMessage(messages.blocks)}
          help={intl.formatMessage(messages.blocksHelp)}
        >
          <BlockToggles
            groups={blockGroups}
            lists={draft}
            userGroups={userGroups}
            onChange={(lists) =>
              setDraft((current) => ({ ...current, ...lists }))
            }
          />
        </Section>
      )}

      {shownTab === 'colors' && (
        <>
          <Section
            title={intl.formatMessage(messages.colors)}
            help={intl.formatMessage(messages.colorsHelp)}
          >
            <ColorsEditor
              colorConfig={draft.color_config}
              onChange={setColorConfig}
            />
          </Section>

          {/* Themes are Volto Light Theme's: only offered on sites with it. */}
          {withVLT && (
            <Section
              title={intl.formatMessage(messages.themes)}
              help={intl.formatMessage(messages.themesHelp)}
            >
              <ThemesEditor
                colorConfig={draft.color_config}
                onChange={setColorConfig}
              />
            </Section>
          )}

          {colorBlocks.length > 0 && (
            <Section
              title={intl.formatMessage(messages.colorsPerBlock)}
              help={intl.formatMessage(messages.colorsPerBlockHelp)}
            >
              <BlockMatrix
                kind="colors"
                blocks={colorBlocks}
                colorConfig={draft.color_config}
                onChange={setColorConfig}
              />
            </Section>
          )}

          {hasCallout && (
            <Section
              title={intl.formatMessage(messages.calloutTypes)}
              help={intl.formatMessage(messages.calloutTypesHelp)}
            >
              <CalloutTypesEditor
                colorConfig={draft.color_config}
                onChange={setColorConfig}
              />
            </Section>
          )}

          {withVLT && themeBlocks.length > 0 && (
            <Section
              title={intl.formatMessage(messages.themesPerBlock)}
              help={intl.formatMessage(messages.themesPerBlockHelp)}
            >
              <BlockMatrix
                kind="themes"
                blocks={themeBlocks}
                colorConfig={draft.color_config}
                onChange={setColorConfig}
              />
            </Section>
          )}
        </>
      )}

      {shownTab === 'print' && state.printSupported === false && (
        <div className="juizi-dashboard__error" role="alert">
          {intl.formatMessage(messages.printNotSupported)}
        </div>
      )}

      {shownTab === 'print' && (
        <PrintEditor
          printConfig={draft.print_config}
          onChange={(print_config) =>
            setDraft((current) => ({ ...current, print_config }))
          }
        />
      )}

      {shownTab === 'transfer' && (
        <TransferPanel
          saved={saved}
          draft={draft}
          dirty={dirty}
          site={(state.data?.['@id'] || '').replace(
            /\/@juizi-blocks-settings$/,
            '',
          )}
          addonVersion={packageJson.version}
          userGroups={userGroups}
          onImport={setDraft}
        />
      )}

      {/* Not a <p>: Volto Light Theme restyles every `.content-area p > a`. */}
      <div className="juizi-dashboard__version-footer">
        <span className="juizi-dashboard__credit">
          <span aria-hidden>❤️🤖</span> Vibe Coded with Care by{' '}
          <a
            href="https://github.com/aboycalledhero"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboycalledhero
          </a>
        </span>
        <span className="juizi-dashboard__version">
          {packageJson.name} v{packageJson.version}
        </span>
      </div>

      {isClient &&
        createPortal(
          <Toolbar
            pathname={location.pathname}
            hideDefaultViewButtons
            inner={
              <>
                <Button
                  className="save"
                  aria-label={intl.formatMessage(messages.save)}
                  title={intl.formatMessage(messages.save)}
                  onClick={save}
                  disabled={!dirty || errors.length > 0 || saving}
                >
                  <Icon
                    name={saveSVG}
                    className="circled"
                    size="30px"
                    title={intl.formatMessage(messages.save)}
                  />
                </Button>
                {dirty ? (
                  <Button
                    className="cancel"
                    aria-label={intl.formatMessage(messages.cancel)}
                    title={intl.formatMessage(messages.cancel)}
                    onClick={() => setDraft(saved)}
                  >
                    <Icon
                      name={clearSVG}
                      className="circled"
                      size="30px"
                      title={intl.formatMessage(messages.cancel)}
                    />
                  </Button>
                ) : (
                  <Button
                    className="item"
                    aria-label={intl.formatMessage(messages.back)}
                    title={intl.formatMessage(messages.back)}
                    onClick={() =>
                      history.push(getParentUrl(location.pathname))
                    }
                  >
                    <Icon
                      name={backSVG}
                      className="contents circled"
                      size="30px"
                    />
                  </Button>
                )}
              </>
            }
          />,
          document.getElementById('toolbar'),
        )}
    </div>
  );
};

export default Dashboard;
