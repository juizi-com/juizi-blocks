import React from 'react';
import { ArrowRight } from 'lucide-react';
import { defineMessages, useIntl } from 'react-intl';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import {
  colorValueToKey,
  getColorTextStyle,
  isColorDark,
} from '../../../config/colors';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import { calloutIcons } from './icons';
import { calloutTypes, isCalloutConfigured } from './types';

const messages = defineMessages({
  empty: {
    id: 'juizi-callout-empty',
    defaultMessage: 'Add a title and text in the sidebar.',
  },
  more: { id: 'juizi-callout-more', defaultMessage: 'Read more' },
  iconContrast: {
    id: 'juizi-callout-icon-contrast',
    defaultMessage:
      'The icon colour is hard to see on this background. Choose a lighter or darker one under Colours.',
  },
  linkContrast: {
    id: 'juizi-callout-link-contrast',
    defaultMessage:
      'The link colour is hard to see on this background. Choose a lighter or darker one under Colours.',
  },
});

const CalloutPlaceholder = () => (
  <BlockPlaceholder
    blockClass="juizi-callout"
    prompt="Select a callout type in the sidebar to get started."
    modes={calloutTypes.map(({ label, description }) => ({
      name: label,
      description,
    }))}
  />
);

const hasColor = (value) => !!value && value !== 'transparent';

/** Rough readability check: the same colour, or two colours that are both
 * dark or both light. */
const clashes = (background, color) =>
  hasColor(background) &&
  hasColor(color) &&
  (background === color || isColorDark(background) === isColorDark(color));

const CalloutView = (props) => {
  const { data } = props;
  const isEditMode = isEditing(props);
  const intl = useIntl();
  // No type chosen yet: placeholder while editing, nothing on the live site.
  if (!isCalloutConfigured(data)) {
    return isEditMode ? (
      <BlockWrapper {...props}>
        <CalloutPlaceholder />
      </BlockWrapper>
    ) : null;
  }
  const Icon = (calloutIcons[data.icon] || calloutIcons.info).component;
  const link = Array.isArray(data.link) ? data.link[0] : data.link;
  const isEmpty = !data.title && !data.text;

  // Colours come from the shared colour list (values like var(--green)).
  const background = data.backgroundColor;
  const hasBackground = hasColor(background);
  const tone = hasBackground && isColorDark(background) ? 'light' : 'dark';
  const className = [
    'juizi-block',
    'juizi-callout',
    data.calloutType && `juizi-callout--${data.calloutType}`,
    hasBackground && `bg-${colorValueToKey(background)}`,
    hasBackground && (isColorDark(background) ? 'bg-dark' : 'bg-light'),
  ]
    .filter(Boolean)
    .join(' ');
  const style = hasBackground
    ? { backgroundColor: background, ...getColorTextStyle(background) }
    : undefined;
  // Same pattern as the unified buttons: VLT colours links with
  // var(--link-foreground-color), so set it on the link itself. Without a
  // link colour the link follows the callout's text colour.
  const linkStyle = {
    '--link-foreground-color': data.linkColor || 'currentColor',
    ...(data.linkColor ? { color: data.linkColor } : {}),
  };

  return (
    <BlockWrapper
      {...props}
      className={[
        data.calloutType && `type-${data.calloutType}`,
        hasBackground && `tone-${tone}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Outer layer: full width, no background (the callout itself isn't
          full width). Inner layer: the callout box, with its background. */}
      <div className="juizi-callout-wrapper">
        <div className={className} style={style}>
          <div
            className="juizi-callout__icon"
            aria-hidden
            style={data.iconColor ? { color: data.iconColor } : undefined}
          >
            <Icon size={32} strokeWidth={1.75} />
          </div>
          <div className="juizi-callout__body">
            <EditHint isEditMode={isEditMode && isEmpty}>
              {intl.formatMessage(messages.empty)}
            </EditHint>
            {data.title && (
              <h2 className="juizi-callout__title">{data.title}</h2>
            )}
            {data.text && <p className="juizi-callout__text">{data.text}</p>}
            {link?.['@id'] && (
              <UniversalLink
                href={link['@id']}
                className="juizi-callout__link"
                style={linkStyle}
                onClick={isEditMode ? (e) => e.preventDefault() : undefined}
              >
                {data.linkTitle || intl.formatMessage(messages.more)}
                <ArrowRight size={18} aria-hidden />
              </UniversalLink>
            )}
            <EditHint
              isEditMode={isEditMode && clashes(background, data.iconColor)}
              tone="warning"
              live
            >
              {intl.formatMessage(messages.iconContrast)}
            </EditHint>
            <EditHint
              isEditMode={
                isEditMode &&
                !!link?.['@id'] &&
                clashes(background, data.linkColor)
              }
              tone="warning"
              live
            >
              {intl.formatMessage(messages.linkContrast)}
            </EditHint>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};

export default CalloutView;
