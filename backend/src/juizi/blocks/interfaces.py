"""Module where all interfaces, events and exceptions live."""

from juizi.blocks import _
from juizi.blocks.settings import DEFAULT_COLOR_CONFIG_JSON
from zope import schema
from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


class IJuiziBlocksSettings(Interface):
    """Site-wide configuration for the Juizi block set.

    Stored in the Plone registry under the ``juizi.blocks`` prefix and exposed
    to Volto through the ``@juizi-blocks-settings`` service.
    """

    disabled_blocks = schema.List(
        title=_("Disabled blocks"),
        description=_(
            "Block type ids switched off in the dashboard: editors can no "
            "longer add them. Existing blocks of these types keep rendering."
        ),
        value_type=schema.ASCIILine(),
        required=False,
        default=[],
        missing_value=[],
    )

    enabled_blocks = schema.List(
        title=_("Enabled blocks"),
        description=_(
            "Block type ids switched on in the dashboard although their own "
            "configuration keeps them out of the block chooser."
        ),
        value_type=schema.ASCIILine(),
        required=False,
        default=[],
        missing_value=[],
    )

    block_groups = schema.Text(
        title=_("Block groups"),
        description=_(
            "JSON object mapping block type ids to the user groups that may "
            "add them. Blocks without an entry are offered to everybody."
        ),
        required=False,
        default="{}",
        missing_value="{}",
    )

    color_config = schema.Text(
        title=_("Colour configuration"),
        description=_(
            "JSON document holding the master colour list, the block themes "
            "built from it, and per-block allow lists."
        ),
        required=False,
        default=DEFAULT_COLOR_CONFIG_JSON,
    )
