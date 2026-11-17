/**
 * Data visualisation block: one table of data, shown the way the editor
 * picks (chart, table or cards). See README.md.
 */
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import Api from '@plone/volto/helpers/Api/Api';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import { formatNumber } from '../_shared/format';
import { useJuiziBlocksSettings } from '../../../settings';
import Chart from './Chart';
import { RankedBars, RankedCards, StatsCards } from './Cards';
import DataTable from './DataTable';
import {
  getDataSource,
  getFigureNumber,
  getFileReference,
  getSeries,
  getTable,
} from './data';
import { paddingClasses } from '../_shared/choices';
import { getChartPalette } from './palette';
import { getView, PIE_VIEWS, viewKind } from './views';
import messages from './messages';

import './graph.scss';

/** Rows up to which charts also offer their numbers as a table. */
const NUMBERS_TABLE_MAX = 200;

/**
 * Editor only: the linked file's table, fetched again when the editor
 * changes the file, the separator or the kind of view, so the preview
 * follows at once instead of after saving. Visitors get the table with the
 * page (`dataTable`, added by the backend).
 */
// The saved link is a resolveuid; the editor sees the file's address.
const toPath = (url = '') =>
  flattenToAppURL(url)
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/\/@@download\/file\/?$/, '')
    .replace(/\/$/, '');
const samePath = (a, b) => !!a && !!b && toPath(a) === toPath(b);

const useEditorPreview = (props, isEditMode) => {
  const { data } = props;
  const reference =
    getDataSource(data) === 'file' ? getFileReference(data.csvFile) : '';
  const delimiter = data.delimiter || 'auto';
  const kind = viewKind(data.chartType);
  const source = data.dataTable?.source;
  const current =
    !!source &&
    (source.file === reference ||
      samePath(data.dataTable?.fileUrl, reference)) &&
    source.delimiter === delimiter &&
    source.kind === kind;
  const wanted = isEditMode && !!reference && !current;
  const key = `${reference}|${delimiter}|${kind}`;
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!wanted) {
      setPreview(null);
      return undefined;
    }
    let cancelled = false;
    setPreview({ key, loading: true });
    new Api()
      .post(`${getBaseUrl(props.pathname || '')}/@juizi-graph-data`, {
        data: { file: reference, delimiter, view: data.chartType },
      })
      .then((table) => !cancelled && setPreview({ key, table }))
      .catch(
        () => !cancelled && setPreview({ key, table: { error: 'unreadable' } }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, key]);

  if (!wanted) return { table: null, loading: false };
  if (!preview || preview.key !== key || preview.loading) {
    return { table: null, loading: true };
  }
  return { table: preview.table, loading: false };
};

const ERROR_MESSAGES = {
  missing: messages.errorMissing,
  private: messages.errorPrivate,
  'too-big': messages.errorTooBig,
  unreadable: messages.errorUnreadable,
  empty: messages.errorEmpty,
};

const Graph = (props) => {
  const { data, block, isEditMode } = props;
  const intl = useIntl();
  const t = (message, values) => intl.formatMessage(message, values);
  const settings = useJuiziBlocksSettings();
  const blockId = props.id || block;
  const source = getDataSource(data);
  const preview = useEditorPreview(props, isEditMode);
  const table = getTable(data, preview.table);
  const view = getView(data.chartType);
  const palette = getChartPalette(settings?.color_config);

  const placeholder = (prompt, modes) =>
    isEditMode ? (
      <BlockWrapper {...props}>
        <BlockPlaceholder
          blockClass="graph-block"
          prompt={prompt}
          modes={modes}
        />
      </BlockWrapper>
    ) : null;

  // 1. Where does the data come from?
  if (!source) {
    return placeholder(t(messages.startPrompt), [
      { name: t(messages.sourceFile), description: t(messages.sourceFileHelp) },
      {
        name: t(messages.sourcePaste),
        description: t(messages.sourcePasteHelp),
      },
    ]);
  }
  if (source === 'file' && !getFileReference(data.csvFile)) {
    return placeholder(t(messages.chooseFilePrompt));
  }
  if (source === 'paste' && !table) {
    return placeholder(t(messages.pastePrompt));
  }

  // 2. The data, while the editor's preview loads.
  if (!table && preview.loading) {
    return isEditMode ? (
      <BlockWrapper {...props}>
        <div
          className="graph-block graph-block--loading skeleton"
          aria-busy="true"
        />
      </BlockWrapper>
    ) : null;
  }
  if (!table) return null;
  if (table.error && table.error !== 'empty') {
    return placeholder(
      t(ERROR_MESSAGES[table.error] || messages.errorUnreadable),
    );
  }
  if (table.error === 'empty' || !table.rows.length) {
    return placeholder(t(messages.errorEmpty));
  }

  // 3. How to show it?
  if (!view) {
    return placeholder(t(messages.chooseViewPrompt));
  }

  const numericSeries = getSeries(table).filter((s) => s.numeric);
  const tooFewColumns = table.columns.length < view.minColumns;
  const noNumbers = view.kind === 'chart' && numericSeries.length === 0;
  if (tooFewColumns || noNumbers) {
    if (!isEditMode) return null;
    return placeholder(
      tooFewColumns
        ? t(messages.needsColumns, {
            view: t(view.label),
            count: view.minColumns,
          })
        : t(messages.needsNumbers, { view: t(view.label) }),
    );
  }

  const title = (data.title || '').trim();
  // Level 3 unless the editor chose otherwise (the older block's level).
  const TitleTag = ['h2', 'h3', 'h4'].includes(data.titleLevel)
    ? data.titleLevel
    : 'h3';
  const captionText = (data.description || '').trim();
  const figure = getFigureNumber(props.properties, blockId);
  const total = table.total || table.rows.length;
  const rowCount = formatNumber(table.rows.length, intl.locale);
  const totalCount = formatNumber(total, intl.locale);
  const label = [
    title,
    t(messages.chartSummary, {
      view: t(view.label),
      series: numericSeries.map((s) => s.name).join(', '),
      category: table.columns[0],
      rows: totalCount,
    }),
  ]
    .filter(Boolean)
    .join('. ');

  let body;
  if (view.kind === 'chart') {
    body = (
      <>
        <Chart
          view={view.id}
          table={table}
          data={data}
          palette={palette}
          language={intl.locale}
          label={label}
          domId={`graph-${blockId}`}
          eager={isEditMode}
        />
        {table.rows.length <= NUMBERS_TABLE_MAX && (
          <details className="graph-block__numbers">
            <summary>{t(messages.showNumbers)}</summary>
            <DataTable table={table} data={data} caption={label} />
          </details>
        )}
      </>
    );
  } else if (view.kind === 'table') {
    body = (
      <DataTable
        table={table}
        data={data}
        searchable={view.id === 'searchableTable'}
        caption={title || undefined}
      />
    );
  } else if (view.id === 'stats') {
    body = <StatsCards table={table} data={data} />;
  } else if (view.id === 'rankedBars') {
    body = <RankedBars table={table} data={data} />;
  } else {
    body = <RankedCards table={table} data={data} />;
  }

  return (
    <BlockWrapper
      {...props}
      className={cx(props.className, `type-${view.id}`, {
        'graph-block--narrow': !!data.useNarrow,
      })}
    >
      <figure
        style={{ '--graph-accent': palette[0] }}
        className={cx(
          'graph-block',
          `graph-block--${view.kind}`,
          paddingClasses('graph-block', data),
          {
            independent: !!data.independent,
            [`align-${data.cardAlignment}`]:
              view.kind === 'cards' && !!data.cardAlignment,
          },
        )}
      >
        {title && <TitleTag className="graph-block__title">{title}</TitleTag>}
        {body}
        {table.truncated && (
          <p className="graph-block__note">
            {t(messages.truncatedNote, { shown: rowCount, total: totalCount })}
          </p>
        )}
        {captionText && (
          <figcaption className="graph-block__caption">
            {figure ? (
              <strong>{t(messages.figure, { number: figure })} </strong>
            ) : null}
            {captionText}
          </figcaption>
        )}
        <EditHint
          isEditMode={
            isEditMode && source === 'file' && table.fileIsPublic === false
          }
          tone="warning"
        >
          {t(messages.filePrivate)}
        </EditHint>
        <EditHint isEditMode={isEditMode && !!table.thinned}>
          {t(messages.thinnedHint, { total: totalCount, shown: rowCount })}
        </EditHint>
        <EditHint
          isEditMode={
            isEditMode &&
            ['bar', 'mixed'].includes(view.id) &&
            table.rows.length > 60
          }
        >
          {t(messages.manyBarsHint)}
        </EditHint>
        <EditHint
          isEditMode={
            isEditMode && PIE_VIEWS.includes(view.id) && table.rows.length > 8
          }
        >
          {t(messages.manySlicesHint)}
        </EditHint>
        <EditHint
          isEditMode={
            isEditMode &&
            view.kind === 'chart' &&
            numericSeries.length < getSeries(table).length
          }
        >
          {t(messages.textColumnsHint)}
        </EditHint>
      </figure>
    </BlockWrapper>
  );
};

const GraphView = (props) => {
  const isEditMode = isEditing(props);
  return (
    <BlockErrorBoundary
      blockClass="graph-block"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(props.data)}
    >
      <Graph {...props} isEditMode={isEditMode} />
    </BlockErrorBoundary>
  );
};

export default GraphView;
