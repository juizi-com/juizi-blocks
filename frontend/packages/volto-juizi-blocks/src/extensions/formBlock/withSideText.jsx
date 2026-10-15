import React from 'react';
import { useIntl } from 'react-intl';
import EditHint from '../../components/Blocks/_shared/EditHint';
import { isEditing } from '../../components/Blocks/_shared/editMode';
import { cssString } from '../../components/Blocks/_shared/i18n';
import { isColorDark } from '../../config/colors';
import makeBackgroundFrame, { buttonVars } from '../_shared/BackgroundFrame';
import messages from './messages';

/**
 * Background around the form block. Drawn even without a background while
 * the text is beside the form: the layout needs its full-width outer layer
 * ($juizi-layers).
 */
/** The "Appearance" colours as the properties form.css and style.css read. */
export const buttonColorVars = (data = {}) => ({
  ...(data.helpTextColor && { '--juizi-form-help-color': data.helpTextColor }),
  ...buttonVars('--juizi-form-submit-', data.submitButtonStyle),
  ...buttonVars('--juizi-form-cancel-', data.cancelButtonStyle),
});

export const FormFrame = makeBackgroundFrame(
  'juizi-form-frame',
  buttonColorVars,
  { always: true },
);

// Rich text from the sidebar, or '' when it holds no visible text
const richTextHtml = (value) => {
  const html = value?.data || '';
  return html.replace(/<[^>]*>|&nbsp;/g, '').trim() ? html : '';
};

export const hasSideText = (data = {}) =>
  !!(
    data.side_kicker?.trim() ||
    data.side_heading?.trim() ||
    data.side_intro?.trim() ||
    richTextHtml(data.side_more)
  );

const hasBackground = (data = {}) =>
  (data.backgroundColor && data.backgroundColor !== 'transparent') ||
  !!data.backgroundImage?.[0];

// The words of the note the stylesheet shows above the page's Title block
// in the editor, in the editor's language (as the Hero does).
const TitleHiddenNote = () => {
  const intl = useIntl();
  return (
    <style
      // Our own message, escaped for CSS.
      dangerouslySetInnerHTML={{
        __html: `:root{--juizi-form-title-note:${cssString(
          intl.formatMessage(messages.titleHiddenNote),
        )}}`,
      }}
    />
  );
};

/** The text beside the form. Empty text only reaches here in edit mode. */
const SideText = ({ data, primary, otherPrimary, isEditMode }) => {
  const intl = useIntl();
  const kicker = data.side_kicker?.trim();
  const heading = data.side_heading?.trim();
  const intro = data.side_intro?.trim();
  const more = richTextHtml(data.side_more);
  const Heading = primary ? 'h1' : 'h2';
  return (
    <div className="juizi-form-side">
      <EditHint isEditMode={isEditMode && !hasSideText(data)}>
        {intl.formatMessage(messages.addText)}
      </EditHint>
      {/* The class Juizi blocks share for this kind of line */}
      {kicker && (
        <p className="juizi-form-side__kicker juizi-preheader">{kicker}</p>
      )}
      <EditHint isEditMode={isEditMode && otherPrimary} tone="warning" live>
        {intl.formatMessage(messages.otherPrimary)}
      </EditHint>
      {heading && (
        <Heading
          className={`juizi-form-side__heading${
            primary ? ' juizi-form-side__heading--primary' : ''
          }`}
        >
          {heading}
        </Heading>
      )}
      {intro && <p className="juizi-form-side__intro">{intro}</p>}
      {more && (
        <div
          className="juizi-form-side__more"
          // Rich text from the editor's own sidebar field
          dangerouslySetInnerHTML={{ __html: more }}
        />
      )}
    </div>
  );
};

/**
 * Wraps the form block's view (or edit) with the layout and background
 * chosen in the sidebar. With "Form only" and no background the block
 * renders exactly as before, so saved forms don't change.
 */
const withSideText = (Base) => {
  const WithSideText = (props) => {
    const intl = useIntl();
    const data = props.data || {};
    const isEditMode = isEditing(props);
    // Visitors only get the text column when it has something in it
    const withText =
      data.layout === 'text' && (isEditMode || hasSideText(data));
    const hasExtras =
      hasBackground(data) ||
      !!data.submitButtonStyle ||
      !!data.cancelButtonStyle ||
      data.labelPosition === 'above' ||
      data.helpTextPosition === 'label' ||
      !!data.helpTextColor ||
      !!data.paddingTop ||
      !!data.paddingBottom;
    if (!withText && !hasExtras) return <Base {...props} />;

    const formPosition = data.form_position === 'left' ? 'left' : 'right';
    const primary =
      withText && !!data.isPrimaryHeading && !!data.side_heading?.trim();
    // `block` in the editor, `id` on the published page
    const selfId = props.block ?? props.id;
    const otherPrimary =
      isEditMode &&
      primary &&
      Object.entries(props.properties?.blocks || {}).some(
        ([id, block]) => id !== selfId && block?.isPrimaryHeading,
      );
    const wrapperClass = [
      'juizi-form-wrapper',
      withText && 'juizi-form-wrapper--with-text',
      withText && `juizi-form-wrapper--form-${formPosition}`,
      // Chosen padding (juizi-common.scss), else the layout's own space
      data.paddingTop
        ? `juizi-form-wrapper--pad-top-${data.paddingTop}`
        : 'juizi-form-wrapper--auto-pad-top',
      data.paddingBottom
        ? `juizi-form-wrapper--pad-bottom-${data.paddingBottom}`
        : 'juizi-form-wrapper--auto-pad-bottom',
      data.labelPosition === 'above' && 'juizi-form-wrapper--labels-above',
      data.helpTextPosition === 'label' && 'juizi-form-wrapper--help-label',
      data.submitButtonStyle && 'juizi-form-wrapper--submit-styled',
      data.cancelButtonStyle && 'juizi-form-wrapper--cancel-styled',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <FormFrame data={data} isEditMode={isEditMode}>
        {primary && isEditMode && <TitleHiddenNote />}
        <div className={wrapperClass}>
          {withText && (
            <SideText
              data={data}
              primary={primary}
              otherPrimary={otherPrimary}
              isEditMode={isEditMode}
            />
          )}
          <div className="juizi-form-wrapper__form">
            <EditHint
              isEditMode={
                isEditMode &&
                !!data.helpTextColor &&
                !isColorDark(data.helpTextColor)
              }
              tone="warning"
              live
            >
              {intl.formatMessage(messages.helpTextColorLight)}
            </EditHint>
            <Base {...props} />
          </div>
        </div>
      </FormFrame>
    );
  };
  WithSideText.displayName = `withSideText(${
    Base.displayName || Base.name || 'Component'
  })`;
  WithSideText.juiziSideText = true;
  return WithSideText;
};

export default withSideText;
