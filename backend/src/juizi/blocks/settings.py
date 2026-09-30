"""Defaults and validation for the Juizi Blocks site settings.

The colour configuration is a JSON document shaped like::

    {
        "colors": [
            {
                "name": "green",          # CSS variable: var(--green)
                "label": "Green",
                "value": "#2e7d32",
                "dark": true,             # dark colours get light text
                "foreground": ""          # optional text colour override
            }
        ],
        "themes": [                       # Volto Light Theme block themes
            {
                "name": "green",
                "label": "Green",
                "background": {"color": "green"},
                "foreground": {"color": "white"},
                "surface": {"color": "white"},
                "muted": {"color": "white", "opacity": 70}
            }
        ],
        "blocks": {                       # per-block allow lists
            "contentRow": {"colors": ["green", "white"]},
            "juiziCallout": {             # Callout only: colours per type
                "calloutTypes": {"warning": {"background": "gold"}}
            },
            "teaser": {"themes": ["green"], "defaultTheme": "green"}
        }
    }

Empty or missing allow lists mean "everything". Theme slots reference colours
by name; unknown slots (e.g. the retired "accent") are dropped. The
frontend mirrors these defaults in settings/constants.ts.
"""

import json
import re


THEME_SLOTS = ("background", "foreground", "surface", "muted")
# Callout block: colours each callout type starts with (dashboard setting).
CALLOUT_BLOCK = "juiziCallout"
CALLOUT_TYPE_SLOTS = ("background", "icon")
REQUIRED_THEME_SLOTS = ("background", "foreground")

DEFAULT_COLOR_CONFIG = {
    "colors": [
        {"name": "white", "label": "White", "value": "#ffffff", "dark": False},
        {"name": "green", "label": "Green", "value": "#2e7d32", "dark": True},
        {"name": "darkgreen", "label": "Dark Green", "value": "#1b4d20", "dark": True},
        {
            "name": "fadedgreen",
            "label": "Faded Green",
            "value": "#e3f1e4",
            "dark": False,
        },
        {"name": "darkblue", "label": "Blue", "value": "#123e6b", "dark": True},
        {"name": "fadedblue", "label": "Faded Blue", "value": "#e2ecf6", "dark": False},
        {"name": "gold", "label": "Gold", "value": "#9a7415", "dark": True},
        {"name": "fadedgold", "label": "Faded Gold", "value": "#f6efdc", "dark": False},
    ],
    "themes": [
        {
            "name": "default",
            "label": "Default",
            "background": {"color": "white"},
            "foreground": {"color": "darkblue"},
            "surface": {"color": "fadedblue"},
            "muted": {"color": "darkblue", "opacity": 70},
        },
        {
            "name": "green",
            "label": "Green",
            "background": {"color": "green"},
            "foreground": {"color": "white"},
            "surface": {"color": "white"},
            "muted": {"color": "white", "opacity": 70},
        },
        {
            "name": "faded-blue",
            "label": "Faded Blue",
            "background": {"color": "fadedblue"},
            "foreground": {"color": "darkblue"},
            "surface": {"color": "white"},
            "muted": {"color": "darkblue", "opacity": 70},
        },
    ],
    "blocks": {},
}

DEFAULT_COLOR_CONFIG_JSON = json.dumps(DEFAULT_COLOR_CONFIG, indent=2)

# Only hex colours are accepted: the values end up inside a stylesheet.
HEX_COLOR = re.compile(
    r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$"
)
# Colour names become CSS variable names, theme names VLT theme ids.
NAME = re.compile(r"^[a-z][a-z0-9-]{0,39}$")
BLOCK_ID = re.compile(r"^[A-Za-z_][A-Za-z0-9_-]{0,79}$")
MAX_ENTRIES = 50
MAX_LABEL_LENGTH = 80


class SettingsValidationError(ValueError):
    """Raised when submitted settings are not acceptable."""


def validate_block_ids(value, key: str = "disabled_blocks") -> list[str]:
    if not isinstance(value, list):
        raise SettingsValidationError(f"{key} must be a list")
    result = []
    for block_id in value:
        if not isinstance(block_id, str) or not BLOCK_ID.match(block_id):
            raise SettingsValidationError(f"Invalid block id: {block_id!r}")
        if block_id not in result:
            result.append(block_id)
    return result


def _hex(value, what: str) -> str:
    if not isinstance(value, str) or not HEX_COLOR.match(value):
        raise SettingsValidationError(f"{what} must be a hex colour, got {value!r}")
    return value.lower()


def _name_and_label(entry, kind: str) -> tuple[str, str]:
    if not isinstance(entry, dict):
        raise SettingsValidationError(f"{kind} entries must be objects")
    name = entry.get("name")
    if not isinstance(name, str) or not NAME.match(name):
        raise SettingsValidationError(
            f"Invalid {kind} name {name!r}: use lowercase letters, digits and "
            "dashes, starting with a letter"
        )
    label = entry.get("label") or name
    if not isinstance(label, str) or len(label) > MAX_LABEL_LENGTH:
        raise SettingsValidationError(f"Invalid label for {kind} {name!r}")
    return name, label


def _entry_list(value, kind: str) -> list:
    if not isinstance(value, list) or not value:
        raise SettingsValidationError(f"Add at least one {kind}")
    if len(value) > MAX_ENTRIES:
        raise SettingsValidationError(f"At most {MAX_ENTRIES} {kind}s are allowed")
    return value


def _check_unique(names: list[str], kind: str):
    duplicates = {name for name in names if names.count(name) > 1}
    if duplicates:
        raise SettingsValidationError(
            f"Duplicate {kind} names: {', '.join(sorted(duplicates))}"
        )


def _validate_color(entry) -> dict:
    name, label = _name_and_label(entry, "colour")
    result = {
        "name": name,
        "label": label,
        "value": _hex(entry.get("value"), f"Colour {name!r}"),
        "dark": bool(entry.get("dark")),
    }
    foreground = entry.get("foreground")
    if foreground:
        result["foreground"] = _hex(foreground, f"Colour {name!r} text colour")
    return result


def _validate_slot(slot, theme: str, slot_name: str, colors: list[str]) -> dict:
    if not isinstance(slot, dict) or slot.get("color") not in colors:
        raise SettingsValidationError(
            f"Theme {theme!r}: {slot_name} must use a colour from the list"
        )
    result = {"color": slot["color"]}
    opacity = slot.get("opacity")
    if opacity is not None:
        if isinstance(opacity, bool) or not isinstance(opacity, (int, float)):
            raise SettingsValidationError(
                f"Theme {theme!r}: {slot_name} opacity must be a number"
            )
        opacity = max(0, min(100, int(opacity)))
        if opacity < 100:
            result["opacity"] = opacity
    return result


def _validate_theme(entry, colors: list[str]) -> dict:
    name, label = _name_and_label(entry, "theme")
    result = {"name": name, "label": label}
    for slot_name in THEME_SLOTS:
        slot = entry.get(slot_name)
        if slot is None:
            if slot_name in REQUIRED_THEME_SLOTS:
                raise SettingsValidationError(
                    f"Theme {name!r}: pick a {slot_name} colour"
                )
            continue
        result[slot_name] = _validate_slot(slot, name, slot_name, colors)
    return result


def _validate_block(block_id, block_config, colors: list[str], themes: list[str]):
    if not isinstance(block_id, str) or not BLOCK_ID.match(block_id):
        raise SettingsValidationError(f"Invalid block id: {block_id!r}")
    if not isinstance(block_config, dict):
        raise SettingsValidationError(f"Config for {block_id!r} must be an object")
    # References to removed colours/themes are dropped rather than rejected:
    # removing a colour should just work.
    allowed_colors = [n for n in block_config.get("colors") or [] if n in colors]
    allowed_themes = [n for n in block_config.get("themes") or [] if n in themes]
    result = {"colors": allowed_colors, "themes": allowed_themes}
    default = block_config.get("defaultTheme")
    if default in (allowed_themes or themes):
        result["defaultTheme"] = default
    if block_id == CALLOUT_BLOCK and "calloutTypes" in block_config:
        result["calloutTypes"] = _validate_callout_types(
            block_config["calloutTypes"], colors
        )
    return result


def _validate_callout_types(value, colors: list[str]) -> dict:
    """The colours each Callout type starts with: {type: {slot: colour}}.
    Unknown slots and removed colours are dropped, like the allow lists."""
    if not isinstance(value, dict):
        raise SettingsValidationError("calloutTypes must be an object")
    result = {}
    for callout_type, slots in value.items():
        if not isinstance(callout_type, str) or not NAME.match(callout_type):
            raise SettingsValidationError(f"Invalid callout type: {callout_type!r}")
        if not isinstance(slots, dict):
            raise SettingsValidationError(
                f"Callout type {callout_type!r} must be an object"
            )
        result[callout_type] = {
            slot: slots[slot]
            for slot in CALLOUT_TYPE_SLOTS
            if slots.get(slot) in colors
        }
    return result


def validate_color_config(value) -> dict:
    """Validate and normalise a colour configuration, returning a clean copy."""
    if not isinstance(value, dict):
        raise SettingsValidationError("color_config must be an object")

    colors = [_validate_color(e) for e in _entry_list(value.get("colors"), "colour")]
    color_names = [c["name"] for c in colors]
    _check_unique(color_names, "colour")

    themes = [
        _validate_theme(e, color_names)
        for e in _entry_list(value.get("themes"), "theme")
    ]
    theme_names = [t["name"] for t in themes]
    _check_unique(theme_names, "theme")

    blocks_in = value.get("blocks") or {}
    if not isinstance(blocks_in, dict):
        raise SettingsValidationError("blocks must be an object")
    blocks = {
        block_id: _validate_block(block_id, config, color_names, theme_names)
        for block_id, config in blocks_in.items()
    }
    return {"colors": colors, "themes": themes, "blocks": blocks}


def load_color_config(raw: str | None) -> dict:
    """Parse the stored JSON, falling back to the defaults if it is unusable
    (including configurations saved in an older format)."""
    if raw:
        try:
            return validate_color_config(json.loads(raw))
        except (ValueError, TypeError):
            pass
    return validate_color_config(DEFAULT_COLOR_CONFIG)
