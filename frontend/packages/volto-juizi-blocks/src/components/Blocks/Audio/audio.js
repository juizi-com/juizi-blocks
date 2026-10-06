/**
 * Where the Audio block's file comes from.
 *
 * - `audio`: the link picker's value (`[{ '@id', title, '@type' }]`), set
 *   in the sidebar. Files link to their download.
 * - `url`: the older juizi-volto-audio-block saved a plain path to the
 *   file's download (`/page/song.mp3/@@download/file`). Still read, so those
 *   blocks keep playing; it's dropped once the editor picks a new file.
 *
 * plone.restapi stores both as UID references when the page is saved, so
 * moving or renaming the file doesn't break the block.
 */
import { getHref } from '../_shared/links';

const DOWNLOAD = /\/@@download\/file(\/[^/]*)?$/;

const hasPick = (audio) => (Array.isArray(audio) ? audio.length > 0 : !!audio);

/** The address the player plays, or '' when no file is set. */
export const getAudioHref = (data = {}) =>
  hasPick(data.audio) ? getHref(data.audio) : getHref(data.url);

/** The file's own title, if the link picker stored one. */
export const getAudioTitle = (data = {}) => {
  const item = Array.isArray(data.audio) ? data.audio[0] : data.audio;
  return (item && typeof item === 'object' && item.title) || '';
};

/**
 * What the sidebar edits: an older block's `url` is shown in the "Audio
 * file" field, so the editor can see which file plays. Nothing is saved
 * until they change a field.
 */
export const getFormData = (data = {}) => {
  if (hasPick(data.audio) || typeof data.url !== 'string' || !data.url) {
    return data;
  }
  const url = data.url.trim();
  const isDownload = DOWNLOAD.test(url);
  const id = url.replace(DOWNLOAD, '');
  return {
    ...data,
    audio: [
      {
        '@id': id,
        title: decodeURIComponent(id.split('/').pop() || id),
        ...(isDownload ? { '@type': 'File' } : {}),
      },
    ],
  };
};

/** Picking (or clearing) a file replaces an older block's `url`. */
export const getChangedData = (id, value, data) => {
  if (id !== 'audio') return { ...data, [id]: value };
  const { url, ...rest } = data;
  return { ...rest, audio: value };
};
