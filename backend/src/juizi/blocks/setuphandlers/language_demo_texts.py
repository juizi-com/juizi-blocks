"""The words on the language demo pages (see language_demo.py).

One entry per site language. Like the add-on's interface translations, the
French, Portuguese, Spanish and Afrikaans texts were written by an AI
assistant and have not been reviewed by native speakers.
"""

# The apostrophes are typographic on purpose.
# ruff: noqa: RUF001

# Site languages, in the order of the language switcher. The first one is the
# site's default language.
LANGUAGES = ["en", "fr", "pt", "pt-br", "es", "af"]

TEXTS = {
    "en": {
        "title": "Juizi Blocks in English",
        "description": (
            "One of each Juizi block, with its labels and messages in the "
            "language of this page."
        ),
        "preheader": "Block showcase",
        "row_heading": "What to look for",
        "row_description": (
            "Every block takes its wording from the language of the page it is on."
        ),
        "row_items": [
            (
                "Translated",
                "Button text, prompts and screen reader labels follow the "
                "language of the page.",
            ),
            (
                "Local dates and numbers",
                "Dates and numbers are written the way this language writes them.",
            ),
            (
                "One dashboard",
                "Blocks, colours and themes are managed in one place, in the "
                "editor's language.",
            ),
        ],
        "carousel_heading": "A carousel",
        "carousel_description": (
            "Use the arrows or the dots to move between the slides."
        ),
        "slides": [
            (
                "First slide",
                "A slide can have a picture, a heading, text and a button.",
            ),
            (
                "Second slide",
                "The arrows and dots are named for screen readers in this language.",
            ),
            ("Third slide", "On phones the arrows move below the carousel."),
            (
                "Fourth slide",
                "Cards can share the same height and the same picture shape.",
            ),
        ],
        "reviews_heading": "Example reviews",
        "reviews_description": (
            "Made-up reviews, to show the Reviews style of the carousel."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Content editor",
                "I added a carousel and published it in five minutes. Every label was "
                "in my own language.",
            ),
            (
                "Pieter van Wyk",
                "Web manager",
                "One dashboard sets the colours for every block, so our pages finally "
                "match.",
            ),
            (
                "Aisha Patel",
                "Accessibility tester",
                "The star rating is read out in words, so nobody has to count stars.",
            ),
        ],
        "gallery_heading": "A gallery",
        "gallery_description": "Click a picture to enlarge it.",
        "picture": "Picture {number}",
        "callout_title": "Try the Redirect block",
        "callout_text": (
            "The Redirect block sends visitors on to another page, so it has a "
            "page of its own. That page brings you straight back here."
        ),
        "callout_link": "Open the redirect page",
        "redirect_title": "Redirect demo",
        "redirect_description": (
            "This page sends visitors back to the block showcase."
        ),
    },
    "fr": {
        "title": "Juizi Blocks en français",
        "description": (
            "Un exemplaire de chaque bloc Juizi, avec ses libellés et ses "
            "messages dans la langue de cette page."
        ),
        "preheader": "Vitrine des blocs",
        "row_heading": "Ce qu’il faut regarder",
        "row_description": (
            "Chaque bloc reprend la langue de la page sur laquelle il se trouve."
        ),
        "row_items": [
            (
                "Traduit",
                "Le texte des boutons, les indications et les libellés pour "
                "lecteurs d’écran suivent la langue de la page.",
            ),
            (
                "Dates et nombres locaux",
                "Les dates et les nombres s’écrivent comme dans cette langue.",
            ),
            (
                "Un seul tableau de bord",
                "Les blocs, les couleurs et les thèmes se gèrent au même "
                "endroit, dans la langue du rédacteur.",
            ),
        ],
        "carousel_heading": "Un carrousel",
        "carousel_description": (
            "Utilisez les flèches ou les points pour passer d’une diapositive "
            "à l’autre."
        ),
        "slides": [
            (
                "Première diapositive",
                "Une diapositive peut avoir une image, un titre, un texte et "
                "un bouton.",
            ),
            (
                "Deuxième diapositive",
                "Les flèches et les points sont nommés dans cette langue pour "
                "les lecteurs d’écran.",
            ),
            (
                "Troisième diapositive",
                "Sur téléphone, les flèches passent sous le carrousel.",
            ),
            (
                "Quatrième diapositive",
                "Les cartes peuvent avoir la même hauteur et la même forme d’image.",
            ),
        ],
        "reviews_heading": "Exemples d’avis",
        "reviews_description": (
            "Des avis inventés, pour montrer le style Avis du carrousel."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Rédactrice de contenu",
                "J’ai ajouté un carrousel et je l’ai publié en cinq minutes. Tous les "
                "libellés étaient dans ma langue.",
            ),
            (
                "Pieter van Wyk",
                "Responsable web",
                "Un seul tableau de bord règle les couleurs de tous les blocs : nos "
                "pages sont enfin assorties.",
            ),
            (
                "Aisha Patel",
                "Testeuse d’accessibilité",
                "La note en étoiles est lue en toutes lettres : personne n’a besoin de"
                " compter les étoiles.",
            ),
        ],
        "gallery_heading": "Une galerie",
        "gallery_description": "Cliquez sur une image pour l’agrandir.",
        "picture": "Image {number}",
        "callout_title": "Essayez le bloc Redirection",
        "callout_text": (
            "Le bloc Redirection envoie les visiteurs vers une autre page : il a "
            "donc sa propre page. Celle-ci vous ramène directement ici."
        ),
        "callout_link": "Ouvrir la page de redirection",
        "redirect_title": "Démonstration de la redirection",
        "redirect_description": (
            "Cette page renvoie les visiteurs vers la vitrine des blocs."
        ),
    },
    "pt": {
        "title": "Juizi Blocks em português",
        "description": (
            "Um exemplar de cada bloco Juizi, com as etiquetas e mensagens na "
            "língua desta página."
        ),
        "preheader": "Mostra de blocos",
        "row_heading": "O que observar",
        "row_description": ("Cada bloco usa a língua da página em que se encontra."),
        "row_items": [
            (
                "Traduzido",
                "O texto dos botões, as indicações e as etiquetas para "
                "leitores de ecrã seguem a língua da página.",
            ),
            (
                "Datas e números locais",
                "As datas e os números escrevem-se como nesta língua.",
            ),
            (
                "Um só painel",
                "Os blocos, as cores e os temas gerem-se num só lugar, na "
                "língua do editor.",
            ),
        ],
        "carousel_heading": "Um carrossel",
        "carousel_description": (
            "Use as setas ou os pontos para passar de um diapositivo para outro."
        ),
        "slides": [
            (
                "Primeiro diapositivo",
                "Um diapositivo pode ter uma imagem, um cabeçalho, texto e um botão.",
            ),
            (
                "Segundo diapositivo",
                "As setas e os pontos têm nome nesta língua para os leitores de ecrã.",
            ),
            (
                "Terceiro diapositivo",
                "Nos telemóveis, as setas passam para baixo do carrossel.",
            ),
            (
                "Quarto diapositivo",
                "Os cartões podem ter a mesma altura e o mesmo formato de imagem.",
            ),
        ],
        "reviews_heading": "Exemplos de avaliações",
        "reviews_description": (
            "Avaliações inventadas, para mostrar o estilo Avaliações do carrossel."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Editora de conteúdos",
                "Adicionei um carrossel e publiquei-o em cinco minutos. Todas as "
                "etiquetas estavam na minha língua.",
            ),
            (
                "Pieter van Wyk",
                "Gestor do site",
                "Um só painel define as cores de todos os blocos, por isso as nossas "
                "páginas finalmente combinam.",
            ),
            (
                "Aisha Patel",
                "Testadora de acessibilidade",
                "A classificação por estrelas é lida por extenso, por isso ninguém tem"
                " de contar estrelas.",
            ),
        ],
        "gallery_heading": "Uma galeria",
        "gallery_description": "Clique numa imagem para a ampliar.",
        "picture": "Imagem {number}",
        "callout_title": "Experimente o bloco Redirecionamento",
        "callout_text": (
            "O bloco Redirecionamento envia os visitantes para outra página, "
            "por isso tem uma página só para si. Essa página traz de volta a "
            "esta."
        ),
        "callout_link": "Abrir a página de redirecionamento",
        "redirect_title": "Demonstração do redirecionamento",
        "redirect_description": (
            "Esta página envia os visitantes de volta à mostra de blocos."
        ),
    },
    "pt-br": {
        "title": "Juizi Blocks em português (Brasil)",
        "description": (
            "Um exemplar de cada bloco Juizi, com as etiquetas e mensagens no "
            "idioma desta página."
        ),
        "preheader": "Mostra de blocos",
        "row_heading": "O que observar",
        "row_description": ("Cada bloco usa o idioma da página em que se encontra."),
        "row_items": [
            (
                "Traduzido",
                "O texto dos botões, as indicações e as etiquetas para "
                "leitores de tela seguem o idioma da página.",
            ),
            (
                "Datas e números locais",
                "As datas e os números são escritos como neste idioma.",
            ),
            (
                "Um só painel",
                "Os blocos, as cores e os temas são gerenciados em um só "
                "lugar, no idioma do editor.",
            ),
        ],
        "carousel_heading": "Um carrossel",
        "carousel_description": (
            "Use as setas ou os pontos para passar de um slide para outro."
        ),
        "slides": [
            (
                "Primeiro slide",
                "Um slide pode ter uma imagem, um cabeçalho, texto e um botão.",
            ),
            (
                "Segundo slide",
                "As setas e os pontos têm nome neste idioma para os leitores de tela.",
            ),
            (
                "Terceiro slide",
                "Nos celulares, as setas passam para baixo do carrossel.",
            ),
            (
                "Quarto slide",
                "Os cartões podem ter a mesma altura e o mesmo formato de imagem.",
            ),
        ],
        "reviews_heading": "Exemplos de avaliações",
        "reviews_description": (
            "Avaliações inventadas, para mostrar o estilo Avaliações do carrossel."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Editora de conteúdo",
                "Adicionei um carrossel e publiquei em cinco minutos. Todos os rótulos"
                " estavam no meu idioma.",
            ),
            (
                "Pieter van Wyk",
                "Gerente do site",
                "Um único painel define as cores de todos os blocos, então nossas "
                "páginas finalmente combinam.",
            ),
            (
                "Aisha Patel",
                "Testadora de acessibilidade",
                "A avaliação por estrelas é lida por extenso, então ninguém precisa "
                "contar estrelas.",
            ),
        ],
        "gallery_heading": "Uma galeria",
        "gallery_description": "Clique em uma imagem para ampliá-la.",
        "picture": "Imagem {number}",
        "callout_title": "Experimente o bloco Redirecionamento",
        "callout_text": (
            "O bloco Redirecionamento envia os visitantes para outra página, "
            "por isso tem uma página própria. Essa página traz você de volta "
            "para cá."
        ),
        "callout_link": "Abrir a página de redirecionamento",
        "redirect_title": "Demonstração do redirecionamento",
        "redirect_description": (
            "Esta página envia os visitantes de volta à mostra de blocos."
        ),
    },
    "es": {
        "title": "Juizi Blocks en español",
        "description": (
            "Un ejemplar de cada bloque Juizi, con sus etiquetas y mensajes en "
            "el idioma de esta página."
        ),
        "preheader": "Muestra de bloques",
        "row_heading": "En qué fijarse",
        "row_description": (
            "Cada bloque usa el idioma de la página en la que se encuentra."
        ),
        "row_items": [
            (
                "Traducido",
                "El texto de los botones, las indicaciones y las etiquetas "
                "para lectores de pantalla siguen el idioma de la página.",
            ),
            (
                "Fechas y números locales",
                "Las fechas y los números se escriben como en este idioma.",
            ),
            (
                "Un solo panel",
                "Los bloques, los colores y los temas se gestionan en un solo "
                "lugar, en el idioma del editor.",
            ),
        ],
        "carousel_heading": "Un carrusel",
        "carousel_description": (
            "Use las flechas o los puntos para pasar de una diapositiva a otra."
        ),
        "slides": [
            (
                "Primera diapositiva",
                "Una diapositiva puede tener una imagen, un encabezado, texto "
                "y un botón.",
            ),
            (
                "Segunda diapositiva",
                "Las flechas y los puntos tienen nombre en este idioma para "
                "los lectores de pantalla.",
            ),
            (
                "Tercera diapositiva",
                "En los móviles, las flechas pasan debajo del carrusel.",
            ),
            (
                "Cuarta diapositiva",
                "Las tarjetas pueden tener la misma altura y la misma forma de imagen.",
            ),
        ],
        "reviews_heading": "Reseñas de ejemplo",
        "reviews_description": (
            "Reseñas inventadas, para mostrar el estilo Reseñas del carrusel."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Editora de contenidos",
                "Añadí un carrusel y lo publiqué en cinco minutos. Todas las etiquetas"
                " estaban en mi idioma.",
            ),
            (
                "Pieter van Wyk",
                "Responsable web",
                "Un solo panel define los colores de todos los bloques, así que "
                "nuestras páginas por fin combinan.",
            ),
            (
                "Aisha Patel",
                "Evaluadora de accesibilidad",
                "La valoración con estrellas se lee con palabras, así que nadie tiene "
                "que contar estrellas.",
            ),
        ],
        "gallery_heading": "Una galería",
        "gallery_description": "Pulse una imagen para ampliarla.",
        "picture": "Imagen {number}",
        "callout_title": "Pruebe el bloque Redirección",
        "callout_text": (
            "El bloque Redirección envía a los visitantes a otra página, por "
            "eso tiene una página propia. Esa página le trae de vuelta aquí."
        ),
        "callout_link": "Abrir la página de redirección",
        "redirect_title": "Demostración de la redirección",
        "redirect_description": (
            "Esta página envía a los visitantes de vuelta a la muestra de bloques."
        ),
    },
    "af": {
        "title": "Juizi Blocks in Afrikaans",
        "description": (
            "Een van elke Juizi-blok, met sy etikette en boodskappe in die taal "
            "van hierdie bladsy."
        ),
        "preheader": "Blokvertoning",
        "row_heading": "Waarna om te kyk",
        "row_description": (
            "Elke blok neem sy bewoording uit die taal van die bladsy waarop dit is."
        ),
        "row_items": [
            (
                "Vertaal",
                "Knoppieteks, aanwysings en skermleser-etikette volg die taal "
                "van die bladsy.",
            ),
            (
                "Plaaslike datums en getalle",
                "Datums en getalle word geskryf soos hierdie taal dit skryf.",
            ),
            (
                "Een paneelbord",
                "Blokke, kleure en temas word op een plek bestuur, in die "
                "redakteur se taal.",
            ),
        ],
        "carousel_heading": "’n Karrousel",
        "carousel_description": (
            "Gebruik die pyltjies of die kolletjies om tussen die skyfies te beweeg."
        ),
        "slides": [
            (
                "Eerste skyfie",
                "’n Skyfie kan ’n prent, ’n opskrif, teks en ’n knoppie hê.",
            ),
            (
                "Tweede skyfie",
                "Die pyltjies en kolletjies word in hierdie taal vir "
                "skermlesers benoem.",
            ),
            ("Derde skyfie", "Op fone skuif die pyltjies onder die karrousel in."),
            (
                "Vierde skyfie",
                "Kaarte kan dieselfde hoogte en dieselfde prentvorm hê.",
            ),
        ],
        "reviews_heading": "Voorbeeldresensies",
        "reviews_description": (
            "Versinde resensies, om die karrousel se Resensies-styl te wys."
        ),
        # (name, organisation or role, review text)
        "reviews": [
            (
                "Thandi Nkosi",
                "Inhoudsredakteur",
                "Ek het ’n karrousel bygevoeg en dit binne vyf minute gepubliseer. "
                "Elke etiket was in my eie taal.",
            ),
            (
                "Pieter van Wyk",
                "Webbestuurder",
                "Een paneelbord stel die kleure vir elke blok, so ons bladsye pas "
                "uiteindelik by mekaar.",
            ),
            (
                "Aisha Patel",
                "Toeganklikheidstoetser",
                "Die stergradering word in woorde voorgelees, so niemand hoef sterre "
                "te tel nie.",
            ),
        ],
        "gallery_heading": "’n Galery",
        "gallery_description": "Klik op ’n prent om dit te vergroot.",
        "picture": "Prent {number}",
        "callout_title": "Probeer die Herleiding-blok",
        "callout_text": (
            "Die Herleiding-blok stuur besoekers na ’n ander bladsy, daarom "
            "het dit sy eie bladsy. Daardie bladsy bring jou dadelik hierheen "
            "terug."
        ),
        "callout_link": "Maak die herleidingsbladsy oop",
        "redirect_title": "Herleiding-demonstrasie",
        "redirect_description": (
            "Hierdie bladsy stuur besoekers terug na die blokvertoning."
        ),
    },
}
