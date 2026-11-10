import { getButtonClasses } from '../../config/colors';

/**
 * The sign-up block's main button (Sign up, Claim my place) as a unified
 * button (config/buttons.scss), so it has the same shape, size and hover as
 * the other Juizi blocks' buttons and follows the site's button styles. The
 * colour is "Main button" under Form colours; left empty, the block's own
 * accent colour, as before.
 */
const buttonProps = (data = {}) => {
  const chosen = getButtonClasses(data.mainButtonStyle, 'membership-button');
  if (chosen.className.includes('btn-unified')) return chosen;
  return {
    className: 'btn-unified btn-solid',
    style: { '--btn-color': 'var(--m-accent)', '--btn-foreground': '#fff' },
  };
};

export default buttonProps;
