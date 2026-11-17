"""Pages that draw a chart from a file are purged from caching proxies when
the file changes, so a cached copy of the page never shows the old data.

Pages know their files through link integrity (the block's links count as
references, see ``transforms.GraphBlockLinksRetriever``). Without a caching
proxy the purge event does nothing.

This runs for every file saved in the Zope process, so it stays out of the
way: only on sites with Juizi Blocks installed (its browser layer is on the
request), and a problem finding the pages is logged, never allowed to stop
the file being saved.
"""

from juizi.blocks.interfaces import IBrowserLayer
from z3c.caching.purge import Purge
from zope.event import notify
from zope.globalrequest import getRequest

import logging


logger = logging.getLogger(__name__)


def purge_pages_using_file(obj, event):
    if not IBrowserLayer.providedBy(getRequest()):
        return
    try:
        from plone.app.linkintegrity.utils import getIncomingLinks

        sources = [
            getattr(relation, "from_object", None) for relation in getIncomingLinks(obj)
        ]
    except Exception:  # any problem: log it, never block saving the file
        logger.warning(
            "Couldn't find the pages using %s to purge them",
            "/".join(obj.getPhysicalPath()),
            exc_info=True,
        )
        return
    for source in sources:
        if source is not None:
            notify(Purge(source))
