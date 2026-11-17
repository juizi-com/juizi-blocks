"""Turn CSV text into the table the Data visualisation block draws.

The result is plain JSON::

    {
        "columns": ["Date", "Price"],
        "rows": [["30/01/1996", "186.3"], ...],   # cells as text, trimmed
        "total": 7612,          # data rows in the file
        "thinned": true,        # long series reduced to MAX_ROWS points
        "truncated": false,     # only the first MAX_ROWS rows sent
        "delimiter": ";",       # the separator used (detected or chosen)
        "error": null,          # or "empty", "too-big", "unreadable"
    }

Cells stay text: the frontend reads numbers (``8.63%``, ``1,234``) the same
way for files and pasted data.

Page weight: a page carries at most MAX_ROWS rows. Charts of longer series
are thinned with Largest-Triangle-Three-Buckets, which keeps the peaks and
troughs a reader would notice; tables and cards get the first MAX_ROWS rows
and say so.
"""

from collections import OrderedDict

import csv
import io
import re
import threading


MAX_ROWS = 1000
# A file larger than this isn't read at all: it would cost every page view.
MAX_FILE_BYTES = 5 * 1024 * 1024
# Pasted data is stored in the page itself, so it is kept smaller.
MAX_PASTE_BYTES = 200 * 1024

DELIMITERS = (";", ",", "\t", "|")
AUTO = "auto"

# Views that draw a series along an axis: long data is thinned, not cut off.
SERIES_VIEWS = {"bar", "barHorizontal", "line", "area", "mixed", "scatter"}

_NUMBER_JUNK = re.compile(r"[,%\s\u00a0]")


def to_number(value):
    """``"1,234.5"``, ``" 8.63% "`` -> float; None when it isn't a number."""
    text = _NUMBER_JUNK.sub("", str(value or ""))
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def decode(raw: bytes) -> str:
    """Spreadsheets save UTF-8 (often with a BOM) or Windows-1252."""
    for encoding in ("utf-8-sig", "cp1252"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("latin-1")


def detect_delimiter(text: str) -> str:
    """The separator that splits the first lines most consistently.

    Counted on the header and the next few lines, ignoring quoted text:
    the right separator gives the same number of columns on every line.
    """
    lines = [line for line in text.splitlines() if line.strip()][:6]
    if not lines:
        return ";"
    best, best_score = ";", (0, 0)
    for delimiter in DELIMITERS:
        counts = [
            len(next(csv.reader([line], delimiter=delimiter))) - 1 for line in lines
        ]
        if counts[0] == 0:
            continue
        consistent = sum(1 for c in counts if c == counts[0])
        score = (consistent, counts[0])
        if score > best_score:
            best, best_score = delimiter, score
    return best


def parse(text: str, delimiter: str | None = None) -> dict:
    """All rows of CSV text, trimmed, with blank lines left out."""
    if not delimiter or delimiter == AUTO or delimiter not in DELIMITERS:
        delimiter = detect_delimiter(text)
    reader = csv.reader(io.StringIO(text), delimiter=delimiter)
    rows = [[cell.strip() for cell in row] for row in reader]
    rows = [row for row in rows if any(row)]
    if not rows:
        return {"columns": [], "rows": [], "delimiter": delimiter, "error": "empty"}
    columns = rows[0]
    width = len(columns)
    # Every row as wide as the header: short rows padded, extra cells dropped.
    body = [(row + [""] * width)[:width] for row in rows[1:]]
    return {
        "columns": columns,
        "rows": body,
        "delimiter": delimiter,
        "error": None if body else "empty",
    }


def lttb(rows: list, column: int, threshold: int) -> list:
    """Largest-Triangle-Three-Buckets over one numeric column.

    Picks ``threshold`` rows (always the first and the last) whose points
    keep the shape of the line. Rows are kept whole, so the other series in
    the same rows come along unchanged.
    """
    count = len(rows)
    if threshold >= count or threshold < 3:
        return rows
    values = [to_number(row[column]) if column < len(row) else None for row in rows]
    values = [v if v is not None else 0.0 for v in values]
    sampled = [rows[0]]
    every = (count - 2) / (threshold - 2)
    a = 0
    for i in range(threshold - 2):
        # Average of the next bucket: the third corner of the triangle.
        start = int((i + 1) * every) + 1
        end = min(int((i + 2) * every) + 1, count)
        span = max(end - start, 1)
        avg_x = sum(range(start, end)) / span
        avg_y = sum(values[start:end]) / span
        # The point in this bucket making the largest triangle with the
        # previously chosen point and that average.
        lo = int(i * every) + 1
        hi = int((i + 1) * every) + 1
        best, best_area = lo, -1.0
        for j in range(lo, hi):
            area = abs(
                (a - avg_x) * (values[j] - values[a]) - (a - j) * (avg_y - values[a])
            )
            if area > best_area:
                best, best_area = j, area
        sampled.append(rows[best])
        a = best
    sampled.append(rows[-1])
    return sampled


def fit(table: dict, view: str | None) -> dict:
    """Limit a parsed table to what a page should carry for this view."""
    rows = table.get("rows") or []
    result = dict(table, total=len(rows), thinned=False, truncated=False)
    if len(rows) <= MAX_ROWS:
        return result
    if view in SERIES_VIEWS and len(table.get("columns") or []) > 1:
        result["rows"] = lttb(rows, 1, MAX_ROWS)
        result["thinned"] = True
    else:
        result["rows"] = rows[:MAX_ROWS]
        result["truncated"] = True
    return result


def from_bytes(raw: bytes, delimiter: str | None, view: str | None) -> dict:
    if len(raw) > MAX_FILE_BYTES:
        return {"columns": [], "rows": [], "total": 0, "error": "too-big"}
    try:
        return fit(parse(decode(raw), delimiter), view)
    except csv.Error:
        return {"columns": [], "rows": [], "total": 0, "error": "unreadable"}


def from_text(text: str, delimiter: str | None, view: str | None = None) -> dict:
    if len(text.encode("utf-8")) > MAX_PASTE_BYTES:
        return {"columns": [], "rows": [], "total": 0, "error": "too-big"}
    try:
        return fit(parse(text, delimiter), view)
    except csv.Error:
        return {"columns": [], "rows": [], "total": 0, "error": "unreadable"}


def view_kind(view: str | None) -> str:
    """Thinning only depends on whether the view draws a series."""
    return "series" if view in SERIES_VIEWS else "rows"


class TableCache:
    """Parsed tables per file version, so a page view doesn't re-read the
    file. Keyed by the file's persistent serial, which changes whenever the
    file is saved: an old version is never served after a new upload."""

    def __init__(self, size: int = 32):
        self.size = size
        self._items = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            if key not in self._items:
                return None
            self._items.move_to_end(key)
            return self._items[key]

    def set(self, key, value):
        with self._lock:
            self._items[key] = value
            self._items.move_to_end(key)
            while len(self._items) > self.size:
                self._items.popitem(last=False)

    def clear(self):
        with self._lock:
            self._items.clear()


cache = TableCache()
