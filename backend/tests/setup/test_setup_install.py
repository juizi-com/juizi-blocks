from juizi.blocks import PACKAGE_NAME


class TestSetupInstall:
    def test_addon_installed(self, installer):
        """Test if juizi.blocks is installed."""
        assert installer.is_product_installed(PACKAGE_NAME) is True

    def test_browserlayer(self, browser_layers):
        """Test that IBrowserLayer is registered."""
        from juizi.blocks.interfaces import IBrowserLayer

        assert IBrowserLayer in browser_layers

    def test_latest_version(self, profile_last_version):
        """Test latest version of default profile."""
        assert profile_last_version(f"{PACKAGE_NAME}:default") == "1002"

    def test_volto_light_theme_installed(self, installer):
        assert installer.is_product_installed("kitconcept.voltolighttheme") is True

    def test_site_root_has_vlt_behaviors(self, get_behaviors):
        behaviors = get_behaviors("Plone Site")
        for name in (
            "voltolighttheme.header",
            "voltolighttheme.theme",
            "voltolighttheme.footer",
            "volto.blocks",
        ):
            assert name in behaviors

    def test_settings_registered(self, portal):
        from juizi.blocks.interfaces import IJuiziBlocksSettings
        from plone.registry.interfaces import IRegistry
        from zope.component import getUtility

        records = getUtility(IRegistry).forInterface(
            IJuiziBlocksSettings, prefix="juizi.blocks"
        )
        assert records.disabled_blocks == []
        assert records.enabled_blocks == []
        assert records.block_groups == "{}"
        assert records.color_config


class TestUpgrade1001:
    def test_adds_enabled_blocks_record(self, portal, setup_tool):
        from plone.registry.interfaces import IRegistry
        from zope.component import getUtility

        registry = getUtility(IRegistry)
        key = "juizi.blocks.enabled_blocks"
        registry.records["juizi.blocks.disabled_blocks"].value = ["toc"]
        del registry.records[key]
        setup_tool.setLastVersionForProfile(f"{PACKAGE_NAME}:default", "1000")

        setup_tool.upgradeProfile(f"{PACKAGE_NAME}:default")

        assert registry[key] == []
        # Existing values survive the registry re-import.
        assert registry["juizi.blocks.disabled_blocks"] == ["toc"]
        assert setup_tool.getLastVersionForProfile(f"{PACKAGE_NAME}:default") == (
            "1002",
        )


class TestUpgrade1002:
    def test_adds_block_groups_record(self, portal, setup_tool):
        from plone.registry.interfaces import IRegistry
        from zope.component import getUtility

        registry = getUtility(IRegistry)
        key = "juizi.blocks.block_groups"
        registry.records["juizi.blocks.enabled_blocks"].value = ["hero"]
        del registry.records[key]
        setup_tool.setLastVersionForProfile(f"{PACKAGE_NAME}:default", "1001")

        setup_tool.upgradeProfile(f"{PACKAGE_NAME}:default")

        assert registry[key] == "{}"
        assert registry["juizi.blocks.enabled_blocks"] == ["hero"]
        assert setup_tool.getLastVersionForProfile(f"{PACKAGE_NAME}:default") == (
            "1002",
        )
