"""Pages that draw a chart from a file are purged from caching proxies when
the file changes, so a cached copy of the page never shows the old data.

Pages know their files through link integrity (the block's links count as
references, see ``transforms.GraphBlockLinksRetriever``). Without a caching
proxy the purge event does nothing.
"""

from z3c.caching.purge import Purge
from zope.event import notify


def purge_pages_using_file(obj, event):
    try:
        from plone.app.linkintegrity.utils import getIncomingLinks
    except ImportError:  # pragma: no cover
        return
    try:
        relations = list(getIncomingLinks(obj))
    except KeyError:  # no intid yet: nothing links to it
        return
    for relation in relations:
        source = getattr(relation, "from_object", None)
        if source is not None:
            notify(Purge(source))
