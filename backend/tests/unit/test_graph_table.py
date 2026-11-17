from juizi.blocks.graph import table

import pytest


CRA_INCREASES = (
    "  Service ;  Approved average increase \n  Electricity ;8.63%\n  Water ;12.50%\n\n"
)


def test_parse_trims_cells_and_skips_blank_lines():
    result = table.parse(CRA_INCREASES, ";")
    assert result["columns"] == ["Service", "Approved average increase"]
    assert result["rows"] == [["Electricity", "8.63%"], ["Water", "12.50%"]]
    assert result["error"] is None


@pytest.mark.parametrize(
    "text, expected",
    [
        ("a;b\n1,5;2\n", ";"),
        ("a,b,c\n1,2,3\n", ","),
        ("a\tb\n1\t2\n", "\t"),
        ("a|b\n1|2\n", "|"),
        # Thousands separators in a semicolon file don't fool it.
        ("Name;Total\nA;1,234\nB;5,678\n", ";"),
        # Commas inside quotes don't count.
        ('Mineral,Uses\nCobalt,"Batteries, metallurgy"\n', ","),
    ],
)
def test_detect_delimiter(text, expected):
    assert table.detect_delimiter(text) == expected


def test_auto_and_unknown_delimiters_detect():
    assert table.parse("a,b\n1,2\n", "auto")["delimiter"] == ","
    assert table.parse("a,b\n1,2\n", "#")["delimiter"] == ","
    assert table.parse("a,b\n1,2\n", None)["delimiter"] == ","


def test_rows_padded_and_cut_to_header_width():
    result = table.parse("a;b;c\n1\n1;2;3;4\n", ";")
    assert result["rows"] == [["1", "", ""], ["1", "2", "3"]]


def test_header_only_is_empty():
    assert table.parse("a;b\n", ";")["error"] == "empty"
    assert table.parse("", ";")["error"] == "empty"


def test_decode_bom_and_windows_1252():
    assert table.decode("﻿a;b".encode()) == "a;b"
    assert table.decode("Caf\xe9".encode("cp1252")) == "Café"


@pytest.mark.parametrize(
    "value, expected",
    [
        ("1,234.5", 1234.5),
        (" 8.63% ", 8.63),
        ("1 000", 1000.0),
        ("abc", None),
        ("", None),
        (None, None),
        ("-3", -3.0),
    ],
)
def test_to_number(value, expected):
    assert table.to_number(value) == expected


def series(count):
    return [[f"d{i}", str((i % 50) * (1 if i % 2 else -1))] for i in range(count)]


def test_long_series_thinned_for_charts():
    rows = series(7612)
    rows[3000][1] = "9999"  # a spike a reader would notice
    result = table.fit({"columns": ["Date", "Price"], "rows": rows}, "line")
    assert result["thinned"] is True
    assert result["truncated"] is False
    assert result["total"] == 7612
    assert len(result["rows"]) == table.MAX_ROWS
    assert result["rows"][0] == rows[0]
    assert result["rows"][-1] == rows[-1]
    assert ["d3000", "9999"] in result["rows"]


def test_long_tables_truncated():
    rows = series(1500)
    result = table.fit({"columns": ["Date", "Price"], "rows": rows}, "table")
    assert result["truncated"] is True
    assert result["thinned"] is False
    assert result["rows"] == rows[: table.MAX_ROWS]


def test_short_data_untouched():
    rows = series(10)
    result = table.fit({"columns": ["a", "b"], "rows": rows}, "line")
    assert result["rows"] == rows
    assert result["total"] == 10
    assert not result["thinned"] and not result["truncated"]


def test_too_big():
    assert table.from_text("a;b\n" + "x;1\n" * 60000, ";")["error"] == "too-big"
    big = b"a;b\n" + b"x;1\n" * (table.MAX_FILE_BYTES // 4 + 1)
    assert table.from_bytes(big, ";", None)["error"] == "too-big"


def test_cache_evicts_oldest():
    cache = table.TableCache(size=2)
    cache.set("a", 1)
    cache.set("b", 2)
    cache.get("a")
    cache.set("c", 3)
    assert cache.get("b") is None
    assert cache.get("a") == 1
    assert cache.get("c") == 3
