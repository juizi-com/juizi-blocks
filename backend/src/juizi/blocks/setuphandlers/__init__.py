from plone.base.interfaces.installable import INonInstallable
from Products.CMFCore.utils import getToolByName
from Products.GenericSetup.tool import UNKNOWN
from zope.component.hooks import getSite
from zope.interface import implementer


DEFAULT_PROFILE = "juizi.blocks:default"


def is_installed_here():
    """Whether juizi.blocks is installed on the current site.

    Read from portal_setup directly: asking Plone's installer would ask this
    utility again (it checks the non-installable lists).
    """
    setup = getToolByName(getSite(), "portal_setup", None)
    if setup is None:
        return False
    return setup.getLastVersionForProfile(DEFAULT_PROFILE) != UNKNOWN


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide the uninstall and development site profiles from
        site-creation and quickinstaller."""
        return [
            "juizi.blocks:uninstall",
            "juizi.blocks:devsite",
        ]

    def getNonInstallableProducts(self):
        """Hide the upgrades package from site-creation and quickinstaller.

        juizi.blocks itself is left out of the backend's add-ons list until it
        is installed on the site. Several sites can share one backend, and only
        the ones whose frontend includes volto-juizi-blocks can use it: that
        frontend adds it to Site Setup → Add-ons itself, and Volto's usual
        Install button installs it (a hidden product can still be installed
        by name). Once installed, it is listed as usual, for upgrades.
        """
        hidden = ["juizi.blocks.upgrades"]
        if not is_installed_here():
            hidden.append("juizi.blocks")
        return hidden
