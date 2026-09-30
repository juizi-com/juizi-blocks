from juizi.blocks import logger
from juizi.blocks.setuphandlers.language_demo import setup_language_demo
from pathlib import Path
from plone import api
from plone.exportimport import importers
from Products.GenericSetup.tool import SetupTool


EXAMPLE_CONTENT_FOLDER = Path(__file__).parent / "examplecontent"


def create_example_content(portal_setup: SetupTool):
    """Import content available at the examplecontent folder."""
    portal = api.portal.get()
    importer = importers.get_importer(portal)
    for line in importer.import_site(EXAMPLE_CONTENT_FOLDER):
        logger.info(line)


def create_language_demo(portal_setup: SetupTool):
    """Make the example site multilingual, with a block showcase page in
    every language."""
    setup_language_demo(api.portal.get())
