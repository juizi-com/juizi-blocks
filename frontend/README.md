# Juizi Blocks (volto-juizi-blocks)

Consolidated Juizi block set for Volto, with a central colour dashboard and per-block toggles

[![npm](https://img.shields.io/npm/v/volto-juizi-blocks)](https://www.npmjs.com/package/volto-juizi-blocks)
[![CI](https://github.com/juizi-com/juizi-blocks/actions/workflows/main.yml/badge.svg)](https://github.com/juizi-com/juizi-blocks/actions/workflows/main.yml)


## Features

- A consolidated block set: Hero, Content Row, Carousel, Gallery, Callout and Redirect.
- A dashboard (Site Setup → Juizi Blocks) to switch blocks on or off, limit them to some user groups, and manage the colours and themes they share.
- Available in English, French, Portuguese (`pt` and `pt_BR`), Spanish and Afrikaans; German is scaffolded and falls back to English.

## Languages

The dashboard and the blocks follow the language Volto renders the site in.
The translations are in `packages/volto-juizi-blocks/locales/<code>/LC_MESSAGES/volto.po`.

> **The translations were produced by AI** (Claude, Anthropic's AI assistant)
> and have not yet been reviewed by native speakers. **We welcome feedback and
> collaboration:** please [open an issue](https://github.com/juizi-com/juizi-blocks/issues)
> or send a pull request if a wording is wrong or awkward, or to add a language.

Afrikaans isn't in Volto 18's own list of interface languages; the add-on adds
it, so an Afrikaans site gets the blocks in Afrikaans (Volto's own interface
stays in English until Volto is translated). The repository's root `README.md`
has the details, under **Languages**.

## Installation

The add-on needs **Volto 18** and
[Volto Light Theme](https://github.com/kitconcept/volto-light-theme) 7, and
the backend add-on `juizi.blocks` installed on the Plone site (it stores the
dashboard's settings).

Add `volto-juizi-blocks` to your `package.json`.

```json
"dependencies": {
    "volto-juizi-blocks": "*"
}
```

Add `volto-juizi-blocks` to your `volto.config.js`.

```javascript
const addons = ['volto-juizi-blocks'];
```

The blocks are styled for Volto Light Theme, which the add-on brings with it.
Use it as the site's theme in `volto.config.js`.

```javascript
const theme = '@kitconcept/volto-light-theme';
```

The add-on doesn't set the site's language. `volto-juizi-blocks:languageDemo`
(instead of `volto-juizi-blocks`) is this repository's own development setup:
it makes Volto multilingual in every translated language.

## Test installation

Visit http://localhost:3000/ in a browser and log in. The Juizi blocks are in
the block chooser under **Juizi**, and the dashboard is under Site Setup →
Juizi Blocks.

How the blocks, the dashboard, the colours and the shared styling work is
documented in the repository's root `README.md`; each block has its own
`README.md` in `packages/volto-juizi-blocks/src/components/Blocks/`.


## Development

The development of this add-on is done in isolation using pnpm workspaces, the latest `mrs-developer`, and other Volto core improvements.
For these reasons, it only works with pnpm and Volto 18.


### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 22
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)

### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:juizi-com/juizi-blocks.git
    cd juizi-blocks/frontend
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Make convenience commands

Run `make help` to list the available Make commands.


### Set up development environment

Install package requirements.

```shell
make install
```

### Start developing

Start the backend. Either this repository's own, from the repository root
(`make backend-create-site` once, then `make backend-start`), which has the
multilingual demo content, or a plain one in Docker:

```shell
make backend-docker-start
```

In a separate terminal session, start the frontend.

```shell
make start
```

### Lint code

Run ESlint, Prettier, and Stylelint in analyze mode.

```shell
make lint
```

### Format code

Run ESlint, Prettier, and Stylelint in fix mode.

```shell
make format
```

### i18n

Extract the i18n messages to locales.

```shell
make i18n
```

New messages appear in every `locales/<code>/LC_MESSAGES/volto.po` with an
empty `msgstr`: translate them for the languages listed in `TRANSLATED` in
`src/locales.test.js`, which fails while any of those is incomplete.

### Unit tests

Run unit tests.

```shell
make test
```

### Run Cypress tests

Run each of these steps in separate terminal sessions.

In the first session, start the frontend in development mode.

```shell
make acceptance-frontend-dev-start
```

In the second session, start the backend acceptance server.

```shell
make acceptance-backend-start
```

In the third session, start the Cypress interactive test runner.

```shell
make acceptance-test
```

## License

The project is licensed under the MIT license.
