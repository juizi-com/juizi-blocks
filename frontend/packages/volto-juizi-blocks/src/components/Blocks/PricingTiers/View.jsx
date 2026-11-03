import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import {
  colorValueToKey,
  getBlockColorList,
  getButtonClasses,
  getColorTextStyle,
  getDefaultButton,
  isColorDark,
} from '../../../config/colors';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import MobileCarousel from '../_shared/MobileCarousel';
import RichText, { hasRichText } from '../_shared/RichText';
import { blockAnchorId } from '../_shared/anchors';
import { isEditing } from '../_shared/editMode';
import { externalLinkProps, getHref } from '../_shared/links';
import shared from '../_shared/messages';
import messages from './messages';
import { BLOCK_TYPE, COLUMN_CHOICES, DEFAULT_COLUMNS } from './schema';
import './style.css';

const hasColor = (value) => !!value && value !== 'transparent';
const text = (value) => (typeof value === 'string' ? value.trim() : '');

/** Classes and inline style for something with a background colour from
 * the colour list; its text colour follows the background. */
const colorProps = (value) =>
  hasColor(value)
    ? {
        className: [
          `bg-${colorValueToKey(value)}`,
          isColorDark(value) ? 'bg-dark' : 'bg-light',
        ],
        style: { backgroundColor: value, ...getColorTextStyle(value) },
      }
    : { className: [], style: undefined };

/**
 * The tier's button style: its own, else (on a tier with its own card
 * colour) one that stands out against that colour, else the style for all
 * tiers, else one that stands out against the block's card colour.
 */
export const tierButtonStyle = (tier, data, colors) => {
  if (tier.buttonStyle) return tier.buttonStyle;
  if (hasColor(tier.cardColor)) return getDefaultButton(tier.cardColor, colors);
  return data.buttonStyle || getDefaultButton(data.cardColor, colors);
};

const TierButton = ({ tier, data, colors, isEditMode, intl }) => {
  const label = text(tier.buttonText);
  const href = getHref(tier.buttonLink);
  if (!label && !href) return null;
  const { className, style } = getButtonClasses(
    tierButtonStyle(tier, data, colors),
    'pricing-button',
  );
  if (label && href) {
    return (
      <div className="juizi-pricing__action">
        <a
          href={href}
          className={className}
          style={style}
          {...externalLinkProps(href)}
        >
          {label}
        </a>
      </div>
    );
  }
  // Half a button: left out for visitors, flagged for editors.
  if (!isEditMode) return null;
  return (
    <div className="juizi-pricing__action">
      <span className={cx(className, 'block__unfinished')} style={style}>
        {label || href}
      </span>
      <EditHint isEditMode>
        {intl.formatMessage(label ? shared.addLink : messages.addButtonText)}
      </EditHint>
    </div>
  );
};

const Tier = ({
  tier,
  data,
  colors,
  highlighted,
  headingLevel,
  isEditMode,
  intl,
}) => {
  const name = text(tier.name);
  const label = text(tier.label);
  const price = text(tier.price);
  const priceNote = text(tier.priceNote);
  const card = colorProps(
    hasColor(tier.cardColor) ? tier.cardColor : data.cardColor,
  );
  const tag = colorProps(
    hasColor(tier.labelColor) ? tier.labelColor : data.labelColor,
  );
  const Heading = headingLevel;

  return (
    <article
      className={cx(
        'juizi-pricing__tier',
        card.className,
        !card.style && 'juizi-pricing__tier--plain',
        highlighted && 'juizi-pricing__tier--highlighted',
        !name && 'block__unfinished',
      )}
      style={card.style}
    >
      <div className="juizi-pricing__tier-head">
        {label && (
          <span
            className={cx('juizi-pricing__label', tag.className)}
            style={tag.style}
          >
            {label}
          </span>
        )}
        {name && <Heading className="juizi-pricing__name">{name}</Heading>}
      </div>
      <EditHint isEditMode={isEditMode && !name}>
        {intl.formatMessage(messages.addName)}
      </EditHint>
      {(price || priceNote) && (
        <div className="juizi-pricing__price-wrap">
          {/* Not paragraphs: themes style every <p> as body text. */}
          {price && (
            <div
              className={cx(
                'juizi-pricing__price',
                // "Let's scope it" rather than an amount: a size smaller
                !/\d/.test(price) && 'juizi-pricing__price--words',
              )}
            >
              {price}
            </div>
          )}
          {priceNote && (
            <div className="juizi-pricing__price-note">{priceNote}</div>
          )}
        </div>
      )}
      <RichText
        data={tier.description}
        className="juizi-pricing__tier-description"
      />
      <RichText data={tier.features} className="juizi-pricing__features" />
      <TierButton
        tier={tier}
        data={data}
        colors={colors}
        isEditMode={isEditMode}
        intl={intl}
      />
    </article>
  );
};

const PricingTiers = (props) => {
  const { data } = props;
  const isEditMode = isEditing(props);
  const intl = useIntl();
  const colors = getBlockColorList(BLOCK_TYPE);

  const allTiers = Array.isArray(data.tiers) ? data.tiers.filter(Boolean) : [];
  // Tiers without a name are unfinished: editors see them flagged.
  const tiers = isEditMode
    ? allTiers
    : allTiers.filter((tier) => text(tier.name));
  const title = text(data.title);
  const hasDescription = hasRichText(data.description);

  if (!tiers.length && !isEditMode) return null;

  const blockId = props.id || props.block;
  const titleId = title ? blockAnchorId(title, blockId, 'pricing') : undefined;
  const columns = COLUMN_CHOICES.includes(Number(data.columns))
    ? Number(data.columns)
    : DEFAULT_COLUMNS;
  const mobileCarousel = data.mobileCarousel !== false;
  // "Start on the highlighted tier": the carousel opens there and stays
  // still (no autoplay), so visitors focus on it.
  const highlightedIndex = tiers.findIndex(
    (tier) => tier['@id'] && tier['@id'] === data.highlightedTier,
  );
  const startHighlighted =
    !!data.mobileStartHighlighted && highlightedIndex > -1;
  const background = colorProps(data.backgroundColor);
  // Also as variables, so a theme can paint the band somewhere else (e.g.
  // only behind the header and the top of the cards).
  const sectionStyle = background.style && {
    ...background.style,
    '--juizi-pricing-background': background.style.backgroundColor,
    ...(background.style.color && {
      '--juizi-pricing-foreground': background.style.color,
    }),
  };
  // With a title, tier names are its subheadings; without, they're the
  // section's headings.
  const headingLevel = title ? 'h3' : 'h2';

  const renderTier = (tier, index) => (
    <Tier
      key={tier['@id'] || index}
      tier={tier}
      data={data}
      colors={colors}
      highlighted={!!tier['@id'] && tier['@id'] === data.highlightedTier}
      headingLevel={headingLevel}
      isEditMode={isEditMode}
      intl={intl}
    />
  );

  return (
    <BlockWrapper
      {...props}
      className={cx(
        props.className,
        background.style &&
          `tone-${isColorDark(data.backgroundColor) ? 'light' : 'dark'}`,
      )}
    >
      <section
        className={cx(
          'juizi-block',
          'juizi-pricing',
          background.className,
          mobileCarousel && 'juizi-pricing--mobile-carousel',
          `juizi-pricing--pad-top-${data.paddingTop || 'default'}`,
          `juizi-pricing--pad-bottom-${data.paddingBottom || 'default'}`,
          data.customClass,
        )}
        style={sectionStyle}
        {...(titleId ? { 'aria-labelledby': titleId } : {})}
      >
        <div className="juizi-pricing__inner">
          {(title || hasDescription) && (
            <div className="juizi-pricing__header">
              {title && (
                <h2 className="juizi-pricing__title" id={titleId}>
                  {title}
                </h2>
              )}
              <RichText
                data={data.description}
                className="juizi-pricing__description"
              />
            </div>
          )}
          {tiers.length ? (
            <div className="juizi-pricing__tiers">
              <div
                className={`juizi-pricing__grid juizi-pricing__grid--columns-${columns}`}
              >
                {tiers.map(renderTier)}
              </div>
              {mobileCarousel && (
                <MobileCarousel
                  blockClass="juizi-pricing"
                  label={title || intl.formatMessage(messages.carouselLabel)}
                  autoplay={data.mobileAutoplay && !startHighlighted}
                  startIndex={startHighlighted ? highlightedIndex : 0}
                  arrows={data.mobileArrows}
                  arrowStyle={data.mobileArrowStyle}
                  showDots={data.mobileDots !== false}
                >
                  {tiers.map(renderTier)}
                </MobileCarousel>
              )}
            </div>
          ) : (
            <BlockPlaceholder
              blockClass="juizi-pricing"
              prompt={intl.formatMessage(messages.start)}
            />
          )}
          <RichText
            data={data.disclaimer}
            className="juizi-pricing__disclaimer"
          />
        </div>
      </section>
    </BlockWrapper>
  );
};

const PricingTiersView = (props) => {
  const isEditMode = isEditing(props);
  return (
    <BlockErrorBoundary
      blockClass="juizi-pricing"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(props.data)}
    >
      <PricingTiers {...props} isEditMode={isEditMode} />
    </BlockErrorBoundary>
  );
};

export default PricingTiersView;
