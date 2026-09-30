# juizi.blocks

Consolidated Juizi block set for Volto, with a central colour dashboard and per-block toggles

## Features

- Stores the Juizi Blocks settings (which blocks are switched off or on, the shared colours and block themes) in the Plone registry.
- Serves them to Volto through the `@juizi-blocks-settings` REST API service; only Managers can change them.
- Translated into French, Portuguese (`pt` and `pt_BR`), Spanish and Afrikaans, next to the English source.

## Translations

The package's own text (its name in the add-ons list and the registry field
descriptions) is in `src/juizi/blocks/locales/<code>/LC_MESSAGES/juizi.blocks.po`.
The dashboard and the blocks are translated in the frontend package,
`volto-juizi-blocks`.

> **The translations were produced by AI** (Claude, Anthropic's AI assistant)
> and have not yet been reviewed by native speakers. **We welcome feedback and
> collaboration:** please [open an issue](https://github.com/juizi-com/juizi-blocks/issues)
> or send a pull request if a wording is wrong or awkward, or to add a language.

Regenerate the translation files after changing text in the code with
`make i18n`.

## Installation

Install juizi.blocks with uv.

```shell
uv add juizi.blocks
```

Then install **Juizi Blocks** on the site (Site Setup → Add-ons). That
registers the settings and their REST service and installs `plone.volto` and
Volto Light Theme's backend package. It doesn't change the site's languages.
The frontend needs the Volto add-on `volto-juizi-blocks`.

## Development site

Create this repository's own Plone site.

```shell
make create-site
```

Besides the add-on, that applies the example content profile
(`juizi.blocks:initial`), which makes the site multilingual (English, French,
Portuguese, Brazilian Portuguese, Spanish, Afrikaans) and adds a page with one
of each block in every language, at `/<language>/juizi-blocks`. To add the
same to a site that already exists (safe to run again):

```shell
make create-language-demo
```

The code is in `src/juizi/blocks/setuphandlers/language_demo.py`, the words
on the pages in `language_demo_texts.py`.

## Contribute

- [Issue tracker](https://github.com/juizi-com/juizi-blocks/issues)
- [Source code](https://github.com/juizi-com/juizi-blocks/)

### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [uv](https://6.docs.plone.org/install/create-project-cookieplone.html#uv)
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)

### Installation 🔧

1.  Clone this repository.

    ```shell
    git clone git@github.com:juizi-com/juizi-blocks.git
    cd juizi-blocks/backend
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Add features using `plonecli` or `bobtemplates.plone`

This package provides markers as strings (`<!-- extra stuff goes here -->`) that are compatible with [`plonecli`](https://github.com/plone/plonecli) and [`bobtemplates.plone`](https://github.com/plone/bobtemplates.plone).
These markers act as hooks to add all kinds of features through subtemplates, including behaviors, control panels, upgrade steps, or other subtemplates from `bobtemplates.plone`.
`plonecli` is a command line client for `bobtemplates.plone`, adding autocompletion and other features.

To add a feature as a subtemplate to your package, use the following command pattern.

```shell
make add <template_name>
```

For example, you can add a content type to your package with the following command.

```shell
make add content_type
```

You can add a behavior with the following command.

```shell
make add behavior
```

```{seealso}
You can check the list of available subtemplates in the [`bobtemplates.plone` `README.md` file](https://github.com/plone/bobtemplates.plone/?tab=readme-ov-file#provided-subtemplates).
See also the documentation of [Mockup and Patternslib](https://6.docs.plone.org/classic-ui/mockup.html) for how to build the UI toolkit for Classic UI.
```

## License

The project is licensed under GPLv2.

## Contributors

- Karel Calitz (Juizi) [karel@juizi.com]
- Claude (Anthropic), AI coding assistant, via Claude Code

## Credits and acknowledgements 🙏

Generated from the [`cookieplone-templates`  template](https://github.com/plone/cookieplone-templates/tree/main/) on 2026-09-29 05:51:31.. A special thanks to all contributors and supporters!
