"""Make an existing site multilingual and add the block showcase pages.

For a site created before the language demo existed (new sites get it from
``make create-site``). Safe to run again: existing pages are left alone.

    make create-language-demo
"""

from AccessControl.SecurityManagement import newSecurityManager
from juizi.blocks.interfaces import IBrowserLayer
from juizi.blocks.setuphandlers.language_demo import setup_language_demo
from Testing.makerequest import makerequest
from zope.component.hooks import setSite
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import os
import transaction


site_id = os.getenv("SITE_ID", "Plone")

app = makerequest(globals()["app"])
request = app.REQUEST
directlyProvides(request, IBrowserLayer, *directlyProvidedBy(request))

admin = app.acl_users.getUserById("admin")
newSecurityManager(None, admin.__of__(app.acl_users))

site = app[site_id]
setSite(site)
setup_language_demo(site)
transaction.commit()
app._p_jar.sync()
