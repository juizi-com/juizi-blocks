# Audio block (`audioBlock`)

A sound recording with a player, and an optional title, description and transcript, on a background colour from the site's colour list.

Shared parts (dashboard, colours, shared styling and tokens, links, the block toolkit and the conventions every block follows) are in the repository's root `README.md`.

## Registration

Defined in `index.js` and listed in `src/blocks/index.ts`. The Edit is the shared `makeBlockEdit`; the schema is registered as `juiziSchema`. `usesColors: true` puts it in the dashboard's "Colours per block" table.

The id `audioBlock` is the one the older `juizi-volto-audio-block` add-on used, so its blocks play here without conversion (see "Older blocks").

## What the editor sees

| State | Editor | Visitor |
| --- | --- | --- |
| No file yet | the title and description if typed, and a start prompt: link a file under **Audio file** in the sidebar, or upload it to the site first if it isn't there yet | nothing |
| File set | the player as visitors see it, and an "Optional:" hint to add a transcript until there is one | the player |
| File can't be played (not audio, missing, unsupported) | a warning under the player | the browser's own player, with a download link in browsers that can't play audio at all |
| Error | the shared error message (`BlockErrorBoundary`) | nothing |

There is no display style to choose: the first thing the editor does is add the file.

## Sidebar

1. **Audio file**: the link picker, limited to Files, also accepting a web address (an MP3 hosted elsewhere).
2. **Title**: an `h2` above the player. It is also the player's accessible name (`aria-labelledby`) and gives the block an anchor id (`blockAnchorId`).
3. **Description**: a text area shown above the player. Blank lines start a new paragraph.
4. **Transcript**: a text area shown under the player in a closed "Read the transcript" section (`<details>`).
5. **Colours → Background colour**: from the colour list the dashboard allows for the block, with a real "None". The title and text colour follow the background (`getColorTextStyle`, `bg-dark` / `bg-light`, `tone-*`); they are not separate choices.

No field has a schema default.

## Linking, not uploading

Everything happens in the sidebar, like our other blocks: the block links to an audio file, it doesn't upload one. An editor whose file isn't on the site yet is told, on the canvas and under **Audio file**, to upload it first (save the page, add it as a File with the toolbar's Add button, then come back and choose it).

## Accessibility

- The native `<audio controls>` player: keyboard operable, and announced by screen readers by the title, or by the file's name when there is no title.
- A transcript, for visitors who can't hear the recording (WCAG 1.2.1 asks for one for recorded audio). The editor is reminded until there is one; it isn't required, because some recordings (music) have nothing to transcribe.
- In the editor, the player keeps Enter and the arrow keys to themselves: Volto's block wrapper would otherwise add a new block on Enter and move to the next block on the arrow keys.
- No autoplay.

## Older blocks

The older add-on saved a plain path in `url` (`/page/song.mp3/@@download/file/song.mp3`). This block:

- still plays `url` when there is no `audio`;
- shows that file in the sidebar's **Audio file** field (`getFormData`), so the editor can see what plays;
- keeps `url` when other fields change, and drops it only when the editor picks or clears a file (`getChangedData`).

Nothing changes in saved content until an editor picks a new file. The older add-on had no title, description or background, so those blocks show just the player. **One visible change:** the older block sat in the page's text column; this one uses the shared block width (`--juizi-audio-width`, which follows `--juizi-content-width`), like the Callout, so on wide screens the player is wider than before. A site that wants it back in the text column sets `--juizi-audio-width` in its theme.

plone.restapi stores both `url` and the picker's `@id` as UID references when the page is saved, so a file that is moved or renamed keeps playing.

The older add-on also changed every site's language settings (it set English only). That doesn't come across: a site moving from it to juizi-blocks should remove it.

## Happy path — draft, confirm in first-time editor test

1. Add an **Audio** block. The canvas asks for an audio file.
2. Choose the file under **Audio file** in the sidebar (or paste the web address of one). The player appears. If the file isn't on the site yet: save the page, add the file with **Add (+) → File**, then come back and choose it.
3. Type a **Title**, a short **Description** and the **Transcript**.
4. Optionally choose a **Background colour**.
5. Publish.

## Decisions and trade-offs

- A block of its own, not a display style of an existing block: no Juizi block plays media.
- No download link, autoplay or loop options: the common case is "play this recording". Browsers' players offer download themselves.
- The transcript is an "Optional:" hint, not a requirement (music has nothing to transcribe).
- No upload button on the canvas (decided 2026-10-06): the block links to a file chosen in the sidebar, like our other blocks; editors upload the file to the site first. The cost is an extra round trip for a file that isn't on the site yet, which the start prompt and the field's help text explain.
