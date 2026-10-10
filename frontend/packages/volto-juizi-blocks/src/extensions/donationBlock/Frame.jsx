import makeBackgroundFrame, {
  buttonVars,
  textOn,
} from '../_shared/BackgroundFrame';

/** The "Form colours" choices as the donation block's colour properties. */
export const formColorVars = (data = {}) => ({
  ...(data.stepColor && {
    '--donation-step-active': data.stepColor,
    '--donation-step-active-foreground': textOn(data.stepColor),
  }),
  ...(data.highlightColor && { '--donation-highlight': data.highlightColor }),
  ...buttonVars('--donation-next-', data.nextButtonStyle),
  ...buttonVars('--donation-back-', data.backButtonStyle),
});

/**
 * Background around the donation block, and its "Form colours" (see
 * formColorVars). With none of these set the block renders as before.
 */
const DonationFrame = makeBackgroundFrame(
  'juizi-donation-frame',
  formColorVars,
);

export default DonationFrame;
