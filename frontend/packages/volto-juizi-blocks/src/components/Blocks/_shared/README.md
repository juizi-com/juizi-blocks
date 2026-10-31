# Shared block code (`_shared/`)

Code every Juizi block uses: the start screen (`BlockPlaceholder`), edit-only hints (`EditHint`), the error boundary, `BlockWrapper`, the mobile carousel (`MobileCarousel`), rich text display (`RichText`), the shared messages and `translator` (`messages.js`, `i18n.js`), and the link, image, choice, format, anchor and item helpers. `RichText.jsx` also has `plainTextToRichText`, which lets a plain-text field move to the rich-text widget without losing saved text. Image overlays are in `config/gradients.ts`.

It's documented with everything else the blocks share in the repository's root `README.md`, under **Shared block toolkit** and **Conventions every block follows**.
