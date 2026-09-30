"""REST API endpoint for the Juizi Blocks dashboard.

GET   /@juizi-blocks-settings
      -> {"disabled_blocks": [...], "enabled_blocks": [...], "color_config": {...}}
PATCH /@juizi-blocks-settings  with any subset of those keys

disabled_blocks: switched off in the dashboard.
enabled_blocks:  switched on although the block's own config keeps it off.
A block id in both lists counts as disabled.
"""

from juizi.blocks.interfaces import IJuiziBlocksSettings
from juizi.blocks.settings import load_color_config
from juizi.blocks.settings import SettingsValidationError
from juizi.blocks.settings import validate_color_config
from juizi.blocks.settings import validate_block_ids
from plone.protect.interfaces import IDisableCSRFProtection
from plone.registry.interfaces import IRegistry
from plone.restapi.deserializer import json_body
from plone.restapi.services import Service
from zope.component import getUtility
from zope.interface import alsoProvides

import json


def _records():
    registry = getUtility(IRegistry)
    # check=False: a record added in a later version and not yet created by
    # its upgrade step reads as its missing_value instead of failing.
    return registry.forInterface(
        IJuiziBlocksSettings, prefix="juizi.blocks", check=False
    )


def serialize_settings(context, records) -> dict:
    return {
        "@id": f"{context.absolute_url()}/@juizi-blocks-settings",
        "disabled_blocks": list(records.disabled_blocks or []),
        "enabled_blocks": list(records.enabled_blocks or []),
        "color_config": load_color_config(records.color_config),
    }


class SettingsGet(Service):
    def reply(self):
        return serialize_settings(self.context, _records())


class SettingsPatch(Service):
    def reply(self):
        # Same as core plone.restapi write services: token auth, no CSRF form.
        alsoProvides(self.request, IDisableCSRFProtection)

        data = json_body(self.request)
        if not isinstance(data, dict):
            return self._error("Expected a JSON object")

        records = _records()
        try:
            block_lists = {
                key: validate_block_ids(data[key], key)
                for key in ("disabled_blocks", "enabled_blocks")
                if key in data
            }
            color_config = (
                validate_color_config(data["color_config"])
                if "color_config" in data
                else None
            )
        except SettingsValidationError as exc:
            return self._error(str(exc))

        for key, value in block_lists.items():
            setattr(records, key, value)
        # Keep the lists disjoint: "off" wins over "on".
        disabled = set(records.disabled_blocks or [])
        records.enabled_blocks = [
            block_id
            for block_id in records.enabled_blocks or []
            if block_id not in disabled
        ]
        if color_config is not None:
            records.color_config = json.dumps(color_config, indent=2)

        return serialize_settings(self.context, records)

    def _error(self, message: str) -> dict:
        self.request.response.setStatus(400)
        return {"error": {"type": "ValidationError", "message": message}}
