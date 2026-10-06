import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IntlProvider } from 'react-intl';
import View from './View';
import audio from './index';
import { audioSchema } from './schema';
import {
  getAudioHref,
  getChangedData,
  getFormData as getAudioFormData,
} from './audio';
import messages from './messages';

jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('../_shared/BlockWrapper');

const intl = { formatMessage: (m) => m.defaultMessage };
const renderView = (props) =>
  render(
    <IntlProvider locale="en">
      <View {...props} />
    </IntlProvider>,
  );
const file = [
  { '@id': '/news/episode-1/episode.mp3', title: 'Episode 1', '@type': 'File' },
];

describe('Audio block', () => {
  it('keeps the older add-on’s block id and is in the colour tables', () => {
    expect(audio.id).toBe('audioBlock');
    expect(audio.usesColors).toBe(true);
  });

  it('renders nothing on the live site until a file is set', () => {
    const { container } = renderView({ data: { '@type': 'audioBlock' } });
    expect(container.innerHTML).toBe('');
    // A title alone isn't enough to show visitors anything.
    const titled = renderView({
      data: { '@type': 'audioBlock', title: 'Episode 1' },
    });
    expect(titled.container.innerHTML).toBe('');
  });

  it('points editors to the sidebar while editing', () => {
    const { container } = renderView({
      data: { '@type': 'audioBlock' },
      block: 'abc',
      isEditMode: true,
    });
    expect(container.querySelector('.block-placeholder')).not.toBeNull();
    expect(screen.getByText(messages.start.defaultMessage)).toBeTruthy();
    // Linking happens in the sidebar: no controls on the canvas.
    expect(container.querySelector('button, input')).toBeNull();
    expect(container.querySelector('audio')).toBeNull();
  });

  it('plays a picked file from its download address', () => {
    const { container } = renderView({
      data: { '@type': 'audioBlock', audio: file },
    });
    const player = container.querySelector('audio');
    expect(player.getAttribute('src')).toBe(
      '/news/episode-1/episode.mp3/@@download/file',
    );
    expect(player.hasAttribute('controls')).toBe(true);
    // Named after the file when there's no title.
    expect(player.getAttribute('aria-label')).toBe('Episode 1');
    // A download link for browsers that can't play it.
    expect(
      container.querySelector('audio a[download]').getAttribute('href'),
    ).toBe('/news/episode-1/episode.mp3/@@download/file');
  });

  it('keeps playing blocks saved by the older add-on', () => {
    const data = {
      '@type': 'audioBlock',
      url: '/news/episode-1/episode.mp3/@@download/file/episode.mp3',
    };
    const { container } = renderView({ data });
    expect(container.querySelector('audio').getAttribute('src')).toBe(
      '/news/episode-1/episode.mp3/@@download/file/episode.mp3',
    );
    // The sidebar shows which file plays…
    expect(getAudioFormData(data).audio).toEqual([
      {
        '@id': '/news/episode-1/episode.mp3',
        title: 'episode.mp3',
        '@type': 'File',
      },
    ]);
    // …other changes keep the old address…
    expect(getChangedData('title', 'Hi', data)).toEqual({
      ...data,
      title: 'Hi',
    });
    // …and picking or clearing a file replaces it.
    expect(getChangedData('audio', file, data)).toEqual({
      '@type': 'audioBlock',
      audio: file,
    });
    expect(getAudioHref(getChangedData('audio', [], data))).toBe('');
    // A cleared picker falls back to nothing, not to an empty old address.
    expect(getAudioHref({ url: '' })).toBe('');
  });

  it('labels the player with the title and shows the text', () => {
    const { container } = renderView({
      id: 'f00ba4-1234',
      data: {
        '@type': 'audioBlock',
        audio: file,
        title: 'Episode 1',
        description: 'Our first episode.\n\nWith guests.',
        transcript: 'Hello\nand welcome.',
      },
    });
    const heading = container.querySelector('h2.juizi-audio__title');
    expect(heading.id).toBe('episode-1-f00ba4');
    const player = container.querySelector('audio');
    expect(player.getAttribute('aria-labelledby')).toBe('episode-1-f00ba4');
    expect(player.hasAttribute('aria-label')).toBe(false);
    expect(
      container.querySelectorAll('p.juizi-audio__description'),
    ).toHaveLength(2);
    const transcript = container.querySelector('details');
    expect(transcript.querySelector('summary').textContent).toBe(
      'Read the transcript',
    );
    expect(transcript.querySelector('p').innerHTML).toBe(
      'Hello<br>and welcome.',
    );
  });

  it('suggests a transcript to editors, and never to visitors', () => {
    const data = { '@type': 'audioBlock', audio: file };
    const edit = renderView({ data, isEditMode: true, block: 'abc' });
    expect(edit.container.textContent).toContain('Optional: add a transcript');
    const live = renderView({ data });
    expect(live.container.textContent).not.toContain('add a transcript');
    expect(live.container.querySelector('button')).toBeNull();
  });

  it('warns editors when the file can’t be played', () => {
    const { container } = renderView({
      data: { '@type': 'audioBlock', audio: file, transcript: 'Hi' },
      isEditMode: true,
      block: 'abc',
    });
    expect(container.textContent).not.toContain('can’t be played');
    fireEvent.error(container.querySelector('audio'));
    expect(screen.getByRole('status').textContent).toContain('can’t be played');
  });

  it('keeps Enter and the arrow keys for the player while editing', () => {
    const onKeyDown = jest.fn();
    const { container } = render(
      <IntlProvider locale="en">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div onKeyDown={onKeyDown}>
          <View
            data={{ '@type': 'audioBlock', audio: file }}
            isEditMode
            block="abc"
          />
        </div>
      </IntlProvider>,
    );
    fireEvent.keyDown(container.querySelector('audio'), { key: 'ArrowDown' });
    fireEvent.keyDown(container.querySelector('audio'), { key: 'Enter' });
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('applies the background and its text colour', () => {
    // jsdom rejects var() in colour properties, so check the markup React
    // renders (as on the server) instead of the DOM.
    const html = renderToStaticMarkup(
      <IntlProvider locale="en">
        <View
          data={{
            '@type': 'audioBlock',
            audio: file,
            backgroundColor: 'var(--green)',
          }}
        />
      </IntlProvider>,
    );
    expect(html).toContain('class="block audioBlock tone-light"');
    expect(html).toContain(
      'class="juizi-block juizi-audio bg-green bg-dark" style="background-color:var(--green);color:var(--green-foreground)"',
    );
  });

  it('has a sidebar in working order, with no schema defaults', () => {
    const schema = audioSchema({ intl, props: { data: {} } });
    expect(schema.fieldsets.map((f) => [f.id, f.fields])).toEqual([
      ['default', ['audio', 'title', 'description', 'transcript']],
      ['colors', ['backgroundColor']],
    ]);
    Object.values(schema.properties).forEach((field) =>
      expect(field.default).toBeUndefined(),
    );
    expect(schema.properties.audio.selectableTypes).toEqual(['File']);
    expect(schema.properties.backgroundColor.choices[0]).toEqual([
      'transparent',
      'None',
    ]);
  });
});
