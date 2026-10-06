// A site without Volto Light Theme: only volto-juizi-blocks. Used by
// `make build-without-vlt` (and CI) to prove the add-on builds and works
// without the theme. The development site uses volto.config.js.
const addons = ['volto-juizi-blocks'];
const theme = '';

module.exports = {
  addons,
  theme,
};
