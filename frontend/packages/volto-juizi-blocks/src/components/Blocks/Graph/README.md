# Data visualisation block (`graphBlock`)

Figures from a spreadsheet shown as a chart, a table or cards. The figures come
from a CSV file on the site (the block always shows what's in the file) or are
pasted from a spreadsheet and kept with the page.

It replaces the separate GraphBlock add-on (`volto-GraphBlock`, used by CRA)
and keeps its block id and field ids, so saved blocks keep working. See
**Saved content** below for what changes on those pages.

Shared parts (dashboard, colours, the block toolkit and the conventions every
block follows) are in the repository's root `README.md`.

---

## Registration

Registered through the block list in `src/blocks/index.ts` (`view: View`,
`edit: makeBlockEdit(View)`, `juiziSchema: graphSchema`, `isConfigured`,
`usesColors`). It also registers two sidebar widgets through the block
definition's `widgets` key (`src/config/blocks.ts` merges them into
`config.widgets.widget`):

- `juiziChartType`: the visual picker, a grid of buttons grouped into Charts,
  Tables and Cards, with a description of the chosen view underneath.
- `juiziPasteTable`: a box to paste cells into, and "Use these figures", which
  reads them through the backend and stores `{ columns, rows }`.

A site that registered the old GraphBlock itself must remove that registration
(CRA: `volto-crasa/src/index.js`), or the two will fight over `graphBlock`.

## Dependencies

- `echarts` 6. Two builds:
  - **Server:** `renderSvg.js` draws each chart as SVG during server rendering
    (`echarts.init(null, null, { renderer: 'svg', ssr: true })`). It uses the
    full CommonJS build, as Node can't `require` the ES module `echarts/core`.
  - **Browser:** `echartsClient.js` is a tree-shaken `echarts/core` with the
    bar, line and pie charts, the SVG renderer and the tooltip, legend, grid
    and aria parts. It's a separate chunk (`juizi-echarts`), loaded only when
    a chart comes within 300px of the screen (straight away in the editor).
    Pages without a chart never load it.
- The backend package (`juizi.blocks.graph`) for the file's contents, the
  paste reader and the editor's preview. Without it, file-based blocks show
  "can't be read".

## Where the figures come from (backend)

Nobody ever presses "refresh". On every page request, a block serializer
transformer (`juizi.blocks.graph.transforms`) reads the linked CSV and adds
the table to the block as `dataTable`:

- **Never an old version:** parsed tables are cached per process (32 entries),
  keyed by the file's UID, its last-saved state (`_p_serial`) of both the file
  and its blob, the separator and the kind of view. A new upload changes the
  key, so the next page view shows it.
- **Low load:** a cached table costs a dictionary lookup. Long files are cut
  down before they reach the page: series views (bars, line, area, bars and
  line) draw at most 1,000 points, chosen with LTTB so the line keeps its
  peaks and dips; tables and cards show the first 1,000 rows with a note to
  visitors. Files over 5 MB aren't read; pasted figures are capped at 200 KB,
  1,000 rows and 50 columns.
- **Caches in front of Plone:** saving a new version of a file sends a purge
  (`z3c.caching`) for every page that links to it (`subscribers.py`).
- **Private files:** someone who can't see the file gets `error: 'private'`
  and no figures. Editors get a hint when visitors can't see the file yet.
- `dataTable` is never saved: the deserializer drops it.
- Link integrity knows about the file, so deleting it warns the editor.
- `@juizi-graph-data` (POST, needs Modify portal content) reads pasted text,
  and gives the editor a preview when they change the file, separator or
  view. The editor only asks for a preview when the page's own `dataTable`
  doesn't match what's chosen.

Separators are worked out from `; , tab |` unless the editor picks one;
files are read as UTF-8, then Windows-1252.

## Views

| Id                | Label              | Kind  | Needs                                                      |
| ----------------- | ------------------ | ----- | ---------------------------------------------------------- |
| `bar`             | Bars               | chart | 2 columns                                                  |
| `barHorizontal`   | Sideways bars      | chart | 2                                                          |
| `line`            | Line               | chart | 2                                                          |
| `area`            | Area               | chart | 2                                                          |
| `pie`             | Pie                | chart | 2                                                          |
| `doughnut`        | Doughnut           | chart | 2                                                          |
| `mixed`           | Bars and line      | chart | 3: the last column is a line, on its own axis on the right |
| `pyramid`         | Population pyramid | chart | 3: the first figures go left, the second right             |
| `table`           | Table              | table | 1                                                          |
| `searchableTable` | Table with search  | table | 1                                                          |
| `stats`           | Key figures        | cards | 2                                                          |
| `rankedBars`      | Ranked bars        | cards | 2 (3 groups the rows)                                      |
| `rankedCards`     | Top lists          | cards | 3                                                          |

The ids are the old block's `chartType` values.

## Sidebar

Your data → How to show it → Look → Title and caption → Advanced. Each panel
appears once the step before it is done, and only fields that do something in
the chosen view are shown.

**Top / Bottom padding** close the Look panel (the shared optional padding,
`graph-block--pad-top-*` / `--pad-bottom-*`). Left empty they show as None:
the block adds no space of its own and keeps the gap every block has below
it. Choosing a bottom padding, None included, replaces that gap.

## What the canvas shows

| State                                                  | Editor                                                                                                          | Visitor                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| No data source chosen                                  | Start screen with the two ways in                                                                               | nothing                          |
| File chosen as source, no file yet                     | How to add one (save, Add (+), come back)                                                                       | nothing                          |
| Paste chosen, nothing pasted                           | What to copy and where to paste                                                                                 | nothing                          |
| Figures, no view                                       | "Your figures are ready. Choose how to show them…"                                                              | nothing                          |
| Preview loading                                        | Skeleton                                                                                                        | (server already has the figures) |
| File missing, private or unreadable, no rows           | What went wrong and what to do                                                                                  | nothing                          |
| View needs more columns, or figures where there's text | What the view needs                                                                                             | nothing                          |
| Shown                                                  | The chart, table or cards, with hints (thinned, many bars, many slices, text columns left out, file not public) | The chart, table or cards        |

Keys (a pie's slices, or the series when there's more than one) are page
content under the chart, not part of the picture (`.graph-legend` in
`Chart.jsx`): they wrap onto more lines on narrow screens, keep the same
spacing on every line, and use the site's font. Each key is a button that
hides or shows its part of the chart once the chart is live (ECharts keeps a
hidden legend for this).

Charts have a "Show the figures as a table" disclosure when they have 200
rows or fewer, and an `aria-label` describing what they show.

## Colours

Charts take their colours from the dashboard's **Chart colours** list
(`color_config.blocks.graphBlock.chartColors`, an ordered list of the site's
colours; the backend validator keeps it). Without one, they use the site's
colours in order, leaving out the very light ones. SVG fills can't use CSS
variables, so the View reads the hex values from the settings.

Card views use **Card colour** from the site's list; the text colour follows.

## Printing

Before printing (the browser's `beforeprint`, also fired by the Print
button), each interactive chart draws a print copy at 680px wide, A4 or
Letter in portrait less 15mm margins. It's drawn the way the server draws
(SVG with a `viewBox`, so it scales to the paper) and in the page's font,
and it keeps any keys switched off on screen. The printout shows the copy
instead of the screen-wide chart, whose 12px labels would otherwise shrink
to about 7px. Charts never scrolled into view print the server's drawing,
which scales the same way.

No chart animates. Charts, cards and their titles and captions never split
across pages. Tables break only between rows and repeat the header row,
also under the Print button, which otherwise keeps every table whole; their
scrolling box is switched off in print, because a scrolling box can't be
split. Table with search prints every row, whatever was typed. The search
box and tooltips don't print.

## Happy path

**Draft, confirm in first-time editor test.**

From a file:

1. Add the CSV file to the site (Add (+) → File), and publish it.
2. On the page, add a **Data visualisation** block.
3. Sidebar, **Your data**: "Where is your data?" → A CSV file on this site,
   then pick the file under **CSV file**.
4. **How to show it**: click a view. The canvas redraws at once.
5. **Title and caption**: a title, and the source as the caption.
6. Save. To update the figures later, upload a new version of the file; every
   page using it updates.

From a spreadsheet:

1. Add the block; **Where is your data?** → Paste from a spreadsheet.
2. Copy the cells, including the row of column names; paste them under
   **Your figures** and press **Use these figures**.
3. Continue from step 4 above.

## Ready for FTE: where an editor may hesitate

- **Uploading a file means leaving the page** (save, add the file, come
  back). The canvas and the field help say so, but it's the biggest step.
  Pasting avoids it for small tables.
- After pasting, the figures are only used once the editor presses **Use
  these figures**; the canvas keeps saying what to do until then.
- **Thirteen views** in the picker. Each has a one-line description, and
  views that can't work with the data say why on the canvas.
- **Title level** (Advanced) is an accessibility setting that editors may not
  understand; it's left at "Under a section heading" unless changed.
- **Separator** (Advanced) is almost never needed; its help says to change it
  only when the columns come out wrong.

## Decisions and trade-offs

- **ECharts, drawn on the server as SVG**, then made interactive in the
  browser. The first browser render reads the server's SVG back from the page
  (`svgFromPage`, by element id) so it matches the server HTML exactly, an
  exception to "render the same thing on both sides" that avoids drawing the
  chart twice. The container keeps its aspect ratio, so nothing moves when the
  interactive chart takes over.
- **Figures fetched on every page request, not stored in the page.** Storing
  them would need someone to press refresh, and pages would show old figures
  until they did.
- **The old "shuffle colours" option is dropped.** Colours come from the
  dashboard in a fixed order, so the same series keeps its colour across
  charts.
- **Figure numbers** count the page's own graph blocks in order, leaving out
  those marked "Leave out of the figure numbers". Blocks inside other blocks
  (grids, columns) aren't numbered.
- Count-up on Key figures uses the shared `CountUp` (`_shared/CountUp.jsx`)
  and never runs with reduced motion or in print.

## Saved content

Changes for blocks saved with the old GraphBlock (CRA):

- **Colours change** until the site's Chart colours are set on the dashboard:
  the old block had its own hard-coded palette.
- **No animation:** charts appear drawn; Key figures still count up (saved
  `statAnimationMs` values keep working, an unusual one shows as "Custom").
- `shuffleColours` is ignored.
- `cardBackgroundColor` (the old `'css|tone'` value) is still read; new
  choices are stored as `cardColor`.
- Blocks with a `csvFile` and no `dataSource` are treated as file-based. The
  saved `delimiter` is kept.
- The old block's own 2rem space below each chart is gone (the gap between
  blocks stays); editors can add space with Top / Bottom padding.
- New fields: `dataSource`, `pastedTable`, `cardColor`, `titleLevel`,
  `paddingTop`, `paddingBottom`. The
  title stays a level-3 heading unless `titleLevel` is set.
- Long files: series views now draw at most 1,000 points and tables show the
  first 1,000 rows (CRA's SOX index has 7,612).

## Known issues

- Chart text sizes are fixed in the SVG, so a chart scaled down on a phone has
  small labels. Narrow charts and sideways bars suit phones better.
