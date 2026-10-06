import { defineMessages } from 'react-intl';

// Audio block: sidebar fields, the prompts editors see on the canvas, and
// the player's text for visitors.
export default defineMessages({
  audio: { id: 'juizi-audio-file', defaultMessage: 'Audio file' },
  audioHelp: {
    id: 'juizi-audio-file-help',
    defaultMessage:
      'Choose an audio file on this site, or paste the web address of one (for example an MP3). If the file isn’t on the site yet, upload it first: save this page, add it as a File with the Add (+) button in the toolbar, then come back and choose it here.',
  },
  description: {
    id: 'juizi-audio-description',
    defaultMessage: 'Description',
  },
  descriptionHelp: {
    id: 'juizi-audio-description-help',
    defaultMessage:
      'A sentence or two about what visitors will hear, shown above the player.',
  },
  transcript: { id: 'juizi-audio-transcript', defaultMessage: 'Transcript' },
  transcriptHelp: {
    id: 'juizi-audio-transcript-help',
    defaultMessage:
      'The words spoken in the recording. Visitors who can’t hear it can open and read it under the player.',
  },
  titleHelp: {
    id: 'juizi-audio-title-help',
    defaultMessage:
      'Shown above the player, and read out by screen readers as the player’s name.',
  },
  colors: { id: 'juizi-audio-colors', defaultMessage: 'Colours' },
  backgroundHelp: {
    id: 'juizi-audio-background-help',
    defaultMessage:
      'The title and text colour follow the background automatically.',
  },
  start: {
    id: 'juizi-audio-start',
    defaultMessage:
      'Link to an audio file under “Audio file” in the sidebar. No audio file on the site yet? Upload it first: save this page, add it as a File with the Add (+) button in the toolbar, then come back and choose it.',
  },
  cannotPlay: {
    id: 'juizi-audio-cannot-play',
    defaultMessage:
      'This file can’t be played. Check that it’s an audio file (such as an MP3), or choose a different one under “Audio file” in the sidebar.',
  },
  addTranscript: {
    id: 'juizi-audio-add-transcript',
    defaultMessage:
      'Optional: add a transcript in the sidebar, so visitors who can’t hear the recording can read it.',
  },
  playerLabel: { id: 'juizi-audio-player-label', defaultMessage: 'Audio' },
  showTranscript: {
    id: 'juizi-audio-show-transcript',
    defaultMessage: 'Read the transcript',
  },
  noPlayer: {
    id: 'juizi-audio-no-player',
    defaultMessage: 'Your browser can’t play this audio.',
  },
  download: {
    id: 'juizi-audio-download',
    defaultMessage: 'Download the audio file',
  },
});
