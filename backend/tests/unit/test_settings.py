from copy import deepcopy
from juizi.blocks.settings import DEFAULT_COLOR_CONFIG
from juizi.blocks.settings import load_color_config
from juizi.blocks.settings import SettingsValidationError
from juizi.blocks.settings import validate_color_config

import json
import pytest


def config(**changes):
    result = deepcopy(DEFAULT_COLOR_CONFIG)
    result.update(changes)
    return result


def test_default_config_is_valid():
    assert validate_color_config(DEFAULT_COLOR_CONFIG) == DEFAULT_COLOR_CONFIG


@pytest.mark.parametrize(
    "raw",
    [
        None,
        "",
        "not json",
        "[]",
        # The first release stored a flat palette; it falls back to defaults.
        json.dumps({"palette": [{"name": "default"}], "blocks": {}}),
    ],
)
def test_load_falls_back_to_defaults(raw):
    assert load_color_config(raw) == DEFAULT_COLOR_CONFIG


def test_colours_are_normalised():
    colors = [
        {"name": "brand", "label": "Brand", "value": "#FF6600", "dark": 1},
        {"name": "ink", "value": "#000", "foreground": "#FFF"},
    ]
    themes = [
        {
            "name": "brand",
            "label": "Brand",
            "background": {"color": "brand"},
            "foreground": {"color": "ink", "opacity": 100},
            "muted": {"color": "ink", "opacity": 150},
        }
    ]
    result = validate_color_config({"colors": colors, "themes": themes})
    assert result["colors"] == [
        {"name": "brand", "label": "Brand", "value": "#ff6600", "dark": True},
        {
            "name": "ink",
            "label": "ink",
            "value": "#000",
            "dark": False,
            "foreground": "#fff",
        },
    ]
    # Full opacity is dropped, out-of-range opacity is clamped.
    assert result["themes"][0]["foreground"] == {"color": "ink"}
    assert "opacity" not in result["themes"][0]["muted"]


def test_retired_accent_slot_is_dropped():
    theme = {
        "name": "t",
        "background": {"color": "white"},
        "foreground": {"color": "green"},
        "accent": {"color": "gold"},
    }
    result = validate_color_config(config(themes=[theme]))
    assert "accent" not in result["themes"][0]


def test_block_lists_drop_unknown_names():
    result = validate_color_config(
        config(
            blocks={
                "contentRow": {"colors": ["green", "gone"]},
                "juiziCallout": {"themes": ["green"], "defaultTheme": "default"},
            }
        )
    )
    assert result["blocks"]["contentRow"] == {"colors": ["green"], "themes": []}
    # A default outside the allowed themes is dropped.
    assert result["blocks"]["juiziCallout"] == {"colors": [], "themes": ["green"]}


def test_callout_type_colours_are_kept_and_cleaned():
    result = validate_color_config(
        config(
            blocks={
                "juiziCallout": {
                    "calloutTypes": {
                        "warning": {"background": "gold", "icon": "gone"},
                        "tip": {"icon": "green", "extra": "white"},
                    }
                },
                # Only the Callout has per-type colours.
                "contentRow": {"calloutTypes": {"tip": {"icon": "green"}}},
            }
        )
    )
    assert result["blocks"]["juiziCallout"]["calloutTypes"] == {
        "warning": {"background": "gold"},
        "tip": {"icon": "green"},
    }
    assert "calloutTypes" not in result["blocks"]["contentRow"]


@pytest.mark.parametrize(
    "bad",
    [
        config(colors=[]),
        config(themes=[]),
        config(colors=[{"name": "x", "value": "red;}body{"}]),
        config(colors=[{"name": "Bad Name", "value": "#fff"}]),
        config(
            colors=DEFAULT_COLOR_CONFIG["colors"] + [DEFAULT_COLOR_CONFIG["colors"][0]]
        ),
        config(themes=[{"name": "t", "background": {"color": "white"}}]),
        config(
            themes=[
                {
                    "name": "t",
                    "background": {"color": "white"},
                    "foreground": {"color": "missing"},
                }
            ]
        ),
        config(blocks={"<x>": {}}),
        config(blocks={"juiziCallout": {"calloutTypes": []}}),
        config(blocks={"juiziCallout": {"calloutTypes": {"Bad Type": {}}}}),
        config(blocks={"juiziCallout": {"calloutTypes": {"tip": "gold"}}}),
    ],
)
def test_invalid_configs(bad):
    with pytest.raises(SettingsValidationError):
        validate_color_config(bad)
