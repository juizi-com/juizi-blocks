# Redirect block (`redirectBlock`)

Sends visitors from this page to another page or site. Editors and other logged-in users are never redirected.

Shared parts (dashboard, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

## Registration

Registered through the block list in `src/blocks/index.ts` like the other Juizi blocks: `edit: makeBlockEdit(View)`, options in the sidebar (`juiziSchema: redirectSchema`, `sidebarTab: 1`). The canvas is the View in edit mode, which never redirects and has no link that would leave the edit form.

## Sidebar

- **Send visitors to** (`url`): the link picker. Same field name as before, so saved redirects keep working, including destinations saved as a plain URL string.
- **Page name** (`pageName`, optional, shown once there's a destination): used instead of the web address wherever the block names the destination.

## What people see

| Who | Destination set | What they see |
|---|---|---|
| Editor (canvas) | no | Start screen: "Choose where to send visitors in the sidebar…" |
| Editor (canvas) | yes | "Visitors will be sent to <page name or address>" (address in brackets after a page name), and a note about search engines. A warning if it's this same page |
| Logged-in user viewing the page | yes | "Visitors will be sent to …" and a "Go to <page name / the page> now" link (they aren't redirected themselves) |
| Logged-in user viewing the page | no | "This redirect has no destination yet, so visitors stay on this page. Edit the page to choose one." |
| Visitor | yes | "Redirecting in 3…" ("Taking you to <page name> in 3…" with a page name) and a "Go now" link to skip the countdown, then the destination |
| Visitor | no, or this same page | Nothing (the page shows as normal) |

The message box keeps side padding inside its border (`--juizi-redirect-padding`, 1.25rem), like the Callout. The editor's start screen uses its own class (`redirect-block-placeholder`) so it doesn't pick up the message box's styles.

## Guards

- **Same page:** a destination that is this page (ignoring query, hash and trailing slash) never redirects, and the editor is warned as soon as they choose it.
- **Loops:** before redirecting, the block remembers the page in the visitor's browser session (`sessionStorage`, `redirectTarget.js`). A page that would redirect the same visitor again within 10 seconds (two pages redirecting to each other) shows the page instead. If storage isn't available, it redirects as normal.
- **Older content:** destinations saved as a plain URL string work, as well as the link picker's usual format (`_shared/links.js` `getHref`).

## Happy path — draft, confirm in first-time editor test

1. Add a **Redirect** block to the page to move visitors away from.
2. In the sidebar, under **Send visitors to**, choose the page (or type a web address). Optionally give it a **Page name**.
3. Save. Viewing the page while logged in shows where visitors will go; visitors are sent there after a short countdown.

## Decisions and trade-offs (2026-09 audit)

- Visitors never see a message when nothing is set up (R1).
- Same-page and loop guards (R2).
- **The redirect happens in the browser after a 3-second countdown (R3).** Search engines and visitors without JavaScript get the original page, and search engines keep listing it. For a permanent move, a site administrator should set up a redirect (Site Setup → URL management). A server-side redirect was considered (Volto's `server.jsx` turns a React Router `<Redirect>` into an HTTP redirect) and declined for now; the canvas says this in plain words.
- The canvas is the View with `isEditMode` (`_shared/editMode.js`), which never redirects (R4, revised: the block used to have a form-only canvas).
- Styles use the site variables with fallbacks (R5).
- The block renders inside `BlockWrapper` (`@kitconcept/volto-bm3-compat`).

## Known issues

- Loop detection only works within one browser tab session.
