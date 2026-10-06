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

    def test_site_title_untouched(self, portal):
        """Installing doesn't rename the site."""
        from plone import api

        assert api.portal.get_registry_record("plone.site_title") != "Juizi Blocks"

    def test_email_from_name_untouched(self, portal):
        from plone import api

        name = api.portal.get_registry_record("plone.email_from_name")
        assert name != "Juizi Blocks"

    def test_volto_light_theme_not_installed(self, installer):
        """Volto Light Theme is the site's choice, set up by the dev site."""
        assert installer.is_product_installed("kitconcept.voltolighttheme") is False

    def test_site_root_behaviors_untouched(self, get_behaviors):
        behaviors = get_behaviors("Plone Site")
        for name in (
            "voltolighttheme.header",
            "voltolighttheme.theme",
            "voltolighttheme.footer",
        ):
            assert name not in behaviors

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


class TestDevsiteProfile:
    """The add-on's own development site (``scripts/create_site.py``)."""

    def test_sets_up_volto_light_theme(
        self, portal, setup_tool, installer, get_behaviors
    ):
        from plone import api

        setup_tool.runAllImportStepsFromProfile(f"profile-{PACKAGE_NAME}:devsite")

        assert installer.is_product_installed("kitconcept.voltolighttheme") is True
        behaviors = get_behaviors("Plone Site")
        for name in (
            "voltolighttheme.header",
            "voltolighttheme.theme",
            "voltolighttheme.footer",
            "volto.blocks",
        ):
            assert name in behaviors
        assert api.portal.get_registry_record("plone.site_title") == "Juizi Blocks"


def listed_addons(portal):
    """The add-on ids Site Setup → Add-ons lists (plone.restapi's @addons)."""
    from plone.restapi.services.addons.addons import Addons

    return list(Addons(portal, portal.REQUEST).get_addons())


class TestAddonsListing:
    """juizi.blocks is offered in Site Setup → Add-ons only once installed;
    before that, a frontend with volto-juizi-blocks offers the install."""

    def test_listed_once_installed(self, portal, installer):
        assert installer.is_product_installable(PACKAGE_NAME) is True
        assert PACKAGE_NAME in listed_addons(portal)

    def test_hidden_until_installed(self, portal, installer, setup_tool):
        from Products.GenericSetup.tool import UNKNOWN

        setup_tool.setLastVersionForProfile(f"{PACKAGE_NAME}:default", UNKNOWN)

        assert installer.is_product_installed(PACKAGE_NAME) is False
        assert installer.is_product_installable(PACKAGE_NAME) is False
        assert PACKAGE_NAME not in listed_addons(portal)
        # Still installable when asked for explicitly.
        assert installer.is_product_installable(PACKAGE_NAME, allow_hidden=True)

    def test_installs_while_hidden(self, portal, installer, setup_tool):
        """Volto's Install button (POST @addons/juizi.blocks/install) still
        works while it's left out of the list: the frontend adds it there."""
        from plone.restapi.services.addons.addons import Addons
        from Products.GenericSetup.tool import UNKNOWN

        setup_tool.setLastVersionForProfile(f"{PACKAGE_NAME}:default", UNKNOWN)

        assert Addons(portal, portal.REQUEST).install_product(PACKAGE_NAME)
        assert installer.is_product_installed(PACKAGE_NAME) is True
        assert PACKAGE_NAME in listed_addons(portal)
