"""One release, one version: the backend package, the frontend add-on and the
repository's version.txt must agree. npm writes a pre-release as
`1.0.0-alpha.0`, Python as `1.0.0a0`. Bump them together (see the README,
"Versions"). Skipped outside this repository."""

from juizi.blocks import __version__
from pathlib import Path

import json
import pytest
import re


REPO = Path(__file__).resolve().parents[3]
VERSION_TXT = REPO / "version.txt"
ADDON_PACKAGE = REPO / "frontend" / "packages" / "volto-juizi-blocks" / "package.json"

pytestmark = pytest.mark.skipif(
    not (VERSION_TXT.exists() and ADDON_PACKAGE.exists()),
    reason="not in the juizi-blocks repository",
)


def to_python(version):
    """npm's pre-release form in Python's (PEP 440) spelling."""
    for npm, py in (("alpha", "a"), ("beta", "b"), ("rc", "rc")):
        version = re.sub(rf"-{npm}\.(\d+)$", rf"{py}\1", version)
    return version


def test_to_python():
    assert to_python("1.0.0-alpha.0") == "1.0.0a0"
    assert to_python("2.1.0-rc.3") == "2.1.0rc3"
    assert to_python("1.2.0") == "1.2.0"


def test_same_version_everywhere():
    release = VERSION_TXT.read_text().strip()
    addon = json.loads(ADDON_PACKAGE.read_text())["version"]
    workspace = json.loads((REPO / "frontend" / "package.json").read_text())["version"]
    assert {
        "juizi.blocks __version__": __version__,
        "volto-juizi-blocks": to_python(addon),
        "frontend workspace": to_python(workspace),
    } == {
        "juizi.blocks __version__": release,
        "volto-juizi-blocks": release,
        "frontend workspace": release,
    }
