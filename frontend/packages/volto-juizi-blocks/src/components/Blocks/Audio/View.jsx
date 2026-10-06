import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  colorValueToKey,
  getColorTextStyle,
  isColorDark,
} from '../../../config/colors';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { blockAnchorId } from '../_shared/anchors';
import { isEditing } from '../_shared/editMode';
import { getAudioHref, getAudioTitle } from './audio';
import messages from './messages';

import './audio.css';

const hasColor = (value) => !!value && value !== 'transparent';

/** Text typed in a text area: paragraphs at blank lines, line breaks kept. */
const Paragraphs = ({ text, className }) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p className={className} key={index}>
        {paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </p>
    ));

// Volto's block wrapper adds a new block on Enter and moves between blocks
// on the arrow keys: in the editor, leave those keys to the player.
const keepKeys = (event) => event.stopPropagation();

const Audio = (props) => {
  const { data, block } = props;
  const isEditMode = isEditing(props);
  const intl = useIntl();
  const href = getAudioHref(data);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [href]);

  // Nothing to play: visitors see nothing; editors get the start screen.
  if (!href && !isEditMode) return null;

  const blockId = props.id || block;
  const title = (data.title || '').trim();
  const description = (data.description || '').trim();
  const transcript = (data.transcript || '').trim();
  const titleId = title ? blockAnchorId(title, blockId, 'audio') : undefined;

  // Colours come from the shared colour list (values like var(--green)).
  // The title and text colour follow the background.
  const background = data.backgroundColor;
  const hasBackground = hasColor(background);
  const isDark = hasBackground && isColorDark(background);
  const className = [
    'juizi-block',
    'juizi-audio',
    hasBackground && `bg-${colorValueToKey(background)}`,
    hasBackground && (isDark ? 'bg-dark' : 'bg-light'),
  ]
    .filter(Boolean)
    .join(' ');
  const style = hasBackground
    ? { backgroundColor: background, ...getColorTextStyle(background) }
    : undefined;

  // Recorded audio needs a transcript (WCAG 1.2.1), which the block offers,
  // not a timed caption track: editors have no way to make WebVTT files.
  const player = (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio
      className="juizi-audio__player"
      controls
      preload="metadata"
      src={href}
      {...(titleId
        ? { 'aria-labelledby': titleId }
        : {
            'aria-label':
              getAudioTitle(data) || intl.formatMessage(messages.playerLabel),
          })}
      onError={() => setFailed(true)}
    >
      <p>
        {intl.formatMessage(messages.noPlayer)}{' '}
        <a href={href} download>
          {intl.formatMessage(messages.download)}
        </a>
      </p>
    </audio>
  );

  return (
    <BlockWrapper
      {...props}
      className={hasBackground ? `tone-${isDark ? 'light' : 'dark'}` : ''}
    >
      {/* Outer layer: full width, no background. Inner layer: the box with
          the background colour. */}
      <div className="juizi-audio-wrapper">
        <div className={className} style={style}>
          {title && (
            <h2 className="juizi-audio__title" id={titleId}>
              {title}
            </h2>
          )}
          {description && (
            <Paragraphs
              text={description}
              className="juizi-audio__description"
            />
          )}
          {href ? (
            isEditMode ? (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div className="juizi-audio__player-frame" onKeyDown={keepKeys}>
                {player}
              </div>
            ) : (
              player
            )
          ) : (
            <BlockPlaceholder
              blockClass="juizi-audio"
              prompt={intl.formatMessage(messages.start)}
            />
          )}
          {transcript && (
            <details className="juizi-audio__transcript">
              <summary>{intl.formatMessage(messages.showTranscript)}</summary>
              <div className="juizi-audio__transcript-text">
                <Paragraphs text={transcript} />
              </div>
            </details>
          )}
          <EditHint
            isEditMode={isEditMode && !!href && failed}
            tone="warning"
            live
          >
            {intl.formatMessage(messages.cannotPlay)}
          </EditHint>
          <EditHint isEditMode={isEditMode && !!href && !transcript}>
            {intl.formatMessage(messages.addTranscript)}
          </EditHint>
        </div>
      </div>
    </BlockWrapper>
  );
};

const AudioView = (props) => {
  const isEditMode = isEditing(props);
  return (
    <BlockErrorBoundary
      blockClass="juizi-audio"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(props.data)}
    >
      <Audio {...props} isEditMode={isEditMode} />
    </BlockErrorBoundary>
  );
};

export default AudioView;
