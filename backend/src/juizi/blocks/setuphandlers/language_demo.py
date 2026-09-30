"""A multilingual demo site: one page per language with one of each block.

``setup_language_demo(portal)``:

- makes the site multilingual (plone.app.multilingual) with the languages in
  ``language_demo_texts.LANGUAGES``, which creates a folder per language;
- adds a page ``<language>/juizi-blocks`` holding a Hero, a Content Row, a
  Carousel, a second Carousel in its Reviews style, a Gallery and a Callout,
  written in that language, and links the pages to each other as translations;
- adds ``<language>/juizi-blocks/redirect``, a page with the Redirect block. It has
  its own page because the block sends visitors away from the page it is on;
  it sends them back to ``<language>/juizi-blocks``.

It is safe to run again: existing pages are left alone.

This is demo content for the add-on's own development site (the ``initial``
profile and ``scripts/create_language_demo.py``). Installing the add-on on a
site does none of this.
"""

from io import BytesIO
from juizi.blocks import logger
from juizi.blocks.setuphandlers.language_demo_texts import LANGUAGES
from juizi.blocks.setuphandlers.language_demo_texts import TEXTS
from PIL import Image
from PIL import ImageDraw
from plone import api
from plone.app.multilingual.browser.setup import SetupMultilingualSite
from plone.app.multilingual.interfaces import IPloneAppMultilingualInstalled
from plone.app.multilingual.interfaces import ITranslationManager
from plone.base.utils import get_installer
from plone.namedfile.file import NamedBlobImage
from plone.restapi.interfaces import IDeserializeFromJson
from uuid import uuid4
from zope.component import getMultiAdapter
from zope.interface import alsoProvides


# Not "blocks": that name is taken on every folder by the blocks field.
PAGE_ID = "juizi-blocks"
REDIRECT_ID = "redirect"
PICTURES = 4

# The block test pages' photos: used for the demo pictures when the site has
# them, so the pages look like a real site. Otherwise simple pictures are
# drawn (see _drawn_pictures).
PHOTOS_PATH = "juizi-block-tests/media/photos"

# Colours of the drawn pictures: (sky, hill, foreground).
PALETTES = [
    ((226, 236, 246), (18, 62, 107), (46, 125, 50)),
    ((246, 239, 220), (154, 116, 21), (27, 77, 32)),
    ((227, 241, 228), (46, 125, 50), (18, 62, 107)),
    ((255, 255, 255), (27, 77, 32), (154, 116, 21)),
]


def setup_languages(portal):
    """Make the site multilingual, with a folder for every language."""
    installer = get_installer(portal, portal.REQUEST)
    if not installer.is_product_installed("plone.app.multilingual"):
        installer.install_product("plone.app.multilingual")
    api.portal.set_registry_record("plone.available_languages", list(LANGUAGES))
    api.portal.set_registry_record("plone.default_language", LANGUAGES[0])
    SetupMultilingualSite().setupSite(portal)
    # New content takes the language of its folder only on requests that
    # carry the multilingual layer; a request made before the install (a
    # script, the profile import) doesn't have it yet.
    alsoProvides(portal.REQUEST, IPloneAppMultilingualInstalled)


def _drawn_pictures():
    """Simple landscape pictures, for a site without photos of its own."""
    pictures = []
    for sky, hill, foreground in PALETTES[:PICTURES]:
        image = Image.new("RGB", (1200, 800), sky)
        draw = ImageDraw.Draw(image)
        draw.ellipse((820, 120, 980, 280), fill=(255, 255, 255))
        draw.polygon([(0, 560), (380, 300), (760, 560)], fill=hill)
        draw.polygon([(440, 600), (860, 360), (1200, 600)], fill=hill)
        draw.rectangle((0, 560, 1200, 800), fill=foreground)
        data = BytesIO()
        image.save(data, "JPEG", quality=85)
        pictures.append((data.getvalue(), "image/jpeg", "jpg"))
    return pictures


def _pictures(portal):
    """[(data, content type, file extension)]: the site's photos, or drawn."""
    folder = portal.unrestrictedTraverse(PHOTOS_PATH, None)
    photos = []
    if folder is not None:
        for item in folder.objectValues():
            blob = getattr(item, "image", None)
            if blob is None or not blob.contentType.startswith("image/"):
                continue
            # Wide pictures only: they suit the hero and the cards.
            width, height = blob.getImageSize()
            if width <= height:
                continue
            extension = blob.filename.rsplit(".", 1)[-1].lower()
            photos.append((blob.data, blob.contentType, extension))
            if len(photos) == PICTURES:
                return photos
    return _drawn_pictures()


def _block(block_type, **data):
    return {"@type": block_type, **data}


def _reference(obj, **extra):
    """How the object browser stores a picked item. The REST deserializer
    turns the URL into a stable reference (resolveuid)."""
    return [{"@id": obj.absolute_url(), "title": obj.Title(), **extra}]


def _item(**data):
    """A list item (slide, row item): named in the sidebar after its heading."""
    return {"@id": str(uuid4()), "title": data.get("heading", ""), **data}


def _set_blocks(obj, blocks):
    """Store blocks the way the editor does, through the REST deserializer."""
    ids = [str(uuid4()) for _ in blocks]
    deserializer = getMultiAdapter((obj, obj.REQUEST), IDeserializeFromJson)
    deserializer(
        validate_all=False,
        data={
            "blocks": dict(zip(ids, blocks, strict=True)),
            "blocks_layout": {"items": ids},
        },
    )


# Star ratings of the three made-up reviews.
REVIEW_RATINGS = ["5", "4", "5"]


def _reviews_block(text, images):
    """The Carousel in its Reviews style, with made-up reviews."""
    return _block(
        "emblaCarousel",
        displayMode="reviews",
        title=text["reviews_heading"],
        description=text["reviews_description"],
        loop=True,
        slidesToShow=3,
        minSlidesOnMobile=1,
        arrowPosition="below",
        alignment="center",
        equalHeight=True,
        backgroundColor="transparent",
        slideBackgroundColor="var(--fadedgold)",
        slides=[
            _item(
                heading=name,
                organisation=organisation,
                content=review,
                rating=rating,
                image=_reference(image, **{"@type": "Image"}),
            )
            for image, rating, (name, organisation, review) in zip(
                images, REVIEW_RATINGS, text["reviews"], strict=False
            )
        ],
    )


def _showcase_blocks(text, images, redirect_page):
    row_icons = ["Globe", "Calendar", "Settings"]
    return [
        _block("title"),
        _block(
            "juiziHero",
            blockMode="hero",
            usePageTitle=True,
            usePageDescription=True,
            preheader=text["preheader"],
            alignment="left",
            buttonsDisplayMode="buttons",
            buttons=[],
            isPrimaryHeading=True,
            hideTitle=False,
            backgroundImage=_reference(images[0], **{"@type": "Image"}),
            backgroundPosition="center",
            overlayStyle="gradient",
            paddingTop="extra-spacious",
            paddingBottom="spacious",
        ),
        _block(
            "contentRow",
            displayMode="icon",
            columns=3,
            headerAlignment="center",
            itemsAlignment="center",
            headerText=text["row_heading"],
            descriptionText=text["row_description"],
            backgroundColor="var(--fadedgreen)",
            iconPosition="above",
            paddingTop="spacious",
            paddingBottom="spacious",
            items=[
                _item(
                    heading=heading,
                    text=body,
                    icon=icon,
                    iconCircleColor="var(--green)",
                )
                for icon, (heading, body) in zip(
                    row_icons, text["row_items"], strict=True
                )
            ],
        ),
        _block(
            "emblaCarousel",
            displayMode="image-top",
            title=text["carousel_heading"],
            description=text["carousel_description"],
            loop=True,
            slidesToShow=2,
            minSlidesOnMobile=1,
            arrowPosition="bottom",
            alignment="left",
            imageAspectRatio="3:2",
            equalHeight=True,
            backgroundColor="transparent",
            slideBackgroundColor="var(--fadedblue)",
            slides=[
                _item(
                    heading=heading,
                    content=body,
                    image=_reference(image, **{"@type": "Image"}),
                )
                for image, (heading, body) in zip(images, text["slides"], strict=True)
            ],
        ),
        _reviews_block(text, images),
        _block(
            "emblaGallery",
            displayMode="carousel",
            carouselStyle="featured",
            # The pictures stored inside this page.
            sourceMode="context",
            contextItemTypes=["Image", "Link"],
            title=text["gallery_heading"],
            description=text["gallery_description"],
            loop=True,
            alignment="left",
            enableLightbox=True,
            showCaptionOnItem=False,
            showCaptionInLightbox=True,
            thumbnailHeight="90",
            arrowPosition="sides",
            arrowStyle="default",
            backgroundColor="transparent",
        ),
        _block(
            "juiziCallout",
            calloutType="tip",
            icon="lightbulb",
            title=text["callout_title"],
            text=text["callout_text"],
            link=_reference(redirect_page),
            linkTitle=text["callout_link"],
            backgroundColor="var(--fadedgold)",
        ),
    ]


def _create_pages(folder, text, pictures):
    """The showcase page and its redirect page in one language folder."""
    page = api.content.create(
        container=folder,
        type="Document",
        id=PAGE_ID,
        title=text["title"],
        description=text["description"],
    )
    images = [
        api.content.create(
            container=page,
            type="Image",
            id=f"picture-{number}.{extension}",
            title=text["picture"].format(number=number),
            image=NamedBlobImage(
                data=data,
                contentType=content_type,
                filename=f"picture-{number}.{extension}",
            ),
        )
        for number, (data, content_type, extension) in enumerate(pictures, start=1)
    ]
    redirect_page = api.content.create(
        container=page,
        type="Document",
        id=REDIRECT_ID,
        title=text["redirect_title"],
        description=text["redirect_description"],
    )
    # Kept out of the navigation: it is reached from the callout.
    redirect_page.exclude_from_nav = True
    _set_blocks(
        redirect_page,
        [
            _block("title"),
            _block(
                "redirectBlock",
                url=_reference(page),
                pageName=text["title"],
            ),
        ],
    )
    _set_blocks(page, _showcase_blocks(text, images, redirect_page))
    for obj in (page, redirect_page):
        api.content.transition(obj=obj, transition="publish")
        obj.reindexObject()
    return page, redirect_page


def _link_translations(pages):
    """Make the pages translations of one another ({language: page})."""
    canonical = ITranslationManager(pages[LANGUAGES[0]])
    for language, page in pages.items():
        if language != LANGUAGES[0] and not canonical.has_translation(language):
            canonical.register_translation(language, page)


def create_language_pages(portal):
    """Add the showcase pages to every language folder that lacks them."""
    pictures = None
    pages, redirect_pages = {}, {}
    for language in LANGUAGES:
        folder = portal[language]
        if PAGE_ID in folder:
            pages[language] = folder[PAGE_ID]
            if REDIRECT_ID in folder[PAGE_ID]:
                redirect_pages[language] = folder[PAGE_ID][REDIRECT_ID]
            logger.info(f"Language demo: /{language}/{PAGE_ID} already exists")
            continue
        if pictures is None:
            pictures = _pictures(portal)
        pages[language], redirect_pages[language] = _create_pages(
            folder, TEXTS[language], pictures
        )
        logger.info(f"Language demo: created /{language}/{PAGE_ID}")
    _link_translations(pages)
    if LANGUAGES[0] in redirect_pages:
        _link_translations(redirect_pages)


def setup_language_demo(portal):
    setup_languages(portal)
    create_language_pages(portal)
