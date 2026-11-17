/**
 * The table behind a Data visualisation block.
 *
 * Where it comes from:
 * - a linked CSV file: the backend adds the file's current rows to the
 *   block as `dataTable` every time the page is sent (juizi.blocks.graph);
 *   never saved with the page;
 * - pasted data: `pastedTable`, saved in the block (`dataSource: 'paste'`).
 *
 * Both have the same shape: { columns: [...], rows: [[...], ...] } with
 * cells as text. Numbers are read here, the same way for both.
 */

/** Blocks saved by the older GraphBlock have a file and no dataSource. */
export const getDataSource = (data = {}) =>
  data.dataSource || (hasFileLink(data) ? 'file' : undefined);

export const hasFileLink = (data = {}) => !!getFileReference(data.csvFile);

/** The link picker's value as text ('' when none). */
export const getFileReference = (value) => {
  const item = Array.isArray(value) ? value[0] : value;
  if (item && typeof item === 'object') return item['@id'] || '';
  return typeof item === 'string' ? item : '';
};

/** The table to draw, or null when there is none (yet). `preview` is a
 * table the editor's live preview fetched (see useEditorPreview). */
export const getTable = (data = {}, preview) => {
  if (getDataSource(data) === 'paste') {
    const pasted = data.pastedTable;
    if (!pasted?.columns?.length) return null;
    return {
      columns: pasted.columns,
      rows: pasted.rows || [],
      total: (pasted.rows || []).length,
      error: (pasted.rows || []).length ? null : 'empty',
    };
  }
  const table = preview || data.dataTable;
  if (!table) return null;
  return { columns: [], rows: [], ...table };
};

/** "1,234.5", " 8.63% ", "1 000" → number; null when it isn't one. */
export const toNumber = (value) => {
  const text = String(value ?? '').replace(/[,%\s ]/g, '');
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

export const isPercent = (value) => String(value ?? '').includes('%');

/** Columns 1..n as chart series, with what's needed to label them. */
export const getSeries = (table) =>
  (table?.columns || []).slice(1).map((name, index) => {
    const column = index + 1;
    const cells = table.rows.map((row) => row[column]);
    const values = cells.map(toNumber);
    const filled = cells.filter((cell) => String(cell ?? '').trim() !== '');
    return {
      name,
      column,
      values,
      // A column of numbers: at least one, and no text among the filled cells.
      numeric:
        values.some((v) => v !== null) &&
        filled.every((cell) => toNumber(cell) !== null),
      percent: filled.length > 0 && filled.every(isPercent),
    };
  });

export const getLabels = (table) =>
  (table?.rows || []).map((row) => row[0] ?? '');

/**
 * The figure number for captions ("Figure 2: …"): Data visualisation
 * blocks with a caption earlier on the page count, unless they're left
 * out of the numbering. Worked out from the page's block order, so the
 * server and the browser agree (the older block counted in the browser).
 * Blocks inside other blocks (columns, grids) aren't counted.
 */
export const getFigureNumber = (properties, blockId) => {
  const items = properties?.blocks_layout?.items || [];
  const blocks = properties?.blocks || {};
  let count = 0;
  for (const id of items) {
    const block = blocks[id];
    if (block?.['@type'] === 'graphBlock' && !block.independent) count += 1;
    if (id === blockId) return block && !block.independent ? count : null;
  }
  return null;
};
