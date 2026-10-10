import makeBackgroundFrame, { buttonVars } from '../_shared/BackgroundFrame';

/** The "Form colours" choices as the sign-up block's colour properties. */
export const formColorVars = (data = {}) => ({
  ...(data.highlightColor && { '--membership-highlight': data.highlightColor }),
  ...buttonVars('--membership-button-', data.mainButtonStyle),
});

/**
 * Background around the membership sign-up block, and its "Form colours".
 * With none of these set the block renders as before.
 */
const MembershipSignupFrame = makeBackgroundFrame(
  'juizi-membership-frame',
  formColorVars,
);

export default MembershipSignupFrame;
