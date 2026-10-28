/**
 * The left / right arrow on carousel buttons (Carousel, mobile carousel).
 * One line high, in the text colour, hidden from screen readers (the button
 * carries the label).
 */
import React from 'react';

const NavArrowIcon = ({ direction, className = 'embla__nav-arrow-icon' }) => (
  <svg
    className={className}
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={direction === 'left' ? 'M13 8H3M7 4L3 8l4 4' : 'M3 8h10M9 4l4 4-4 4'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NavArrowIcon;
