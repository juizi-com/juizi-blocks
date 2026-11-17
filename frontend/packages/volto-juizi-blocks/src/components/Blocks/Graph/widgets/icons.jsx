/**
 * Small pictures of each view for the sidebar picker (and, later, the
 * dashboard). Drawn in the text colour and an accent, so they follow the
 * sidebar's own colours. Decorative: every button also has its name.
 */
import React from 'react';

const Svg = ({ children }) => (
  <svg
    viewBox="0 0 48 32"
    width="48"
    height="32"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const A = 'var(--juizi-picker-accent, currentColor)';
const Base = () => (
  <path d="M4 28h40" stroke="currentColor" strokeWidth="1.5" />
);

export const icons = {
  bar: (
    <Svg>
      <Base />
      <rect x="8" y="16" width="6" height="12" fill={A} />
      <rect x="18" y="8" width="6" height="20" fill={A} />
      <rect x="28" y="12" width="6" height="16" fill={A} />
      <rect x="38" y="4" width="4" height="24" fill={A} opacity=".6" />
    </Svg>
  ),
  barHorizontal: (
    <Svg>
      <path d="M6 3v26" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="5" width="34" height="5" fill={A} />
      <rect x="6" y="13" width="24" height="5" fill={A} />
      <rect x="6" y="21" width="15" height="5" fill={A} />
    </Svg>
  ),
  line: (
    <Svg>
      <Base />
      <polyline
        points="5,22 13,16 20,19 28,9 36,12 44,5"
        fill="none"
        stroke={A}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  area: (
    <Svg>
      <Base />
      <path
        d="M5 22 13 16 20 19 28 9 36 12 44 5V28H5Z"
        fill={A}
        opacity=".35"
      />
      <polyline
        points="5,22 13,16 20,19 28,9 36,12 44,5"
        fill="none"
        stroke={A}
        strokeWidth="2"
      />
    </Svg>
  ),
  pie: (
    <Svg>
      <circle cx="24" cy="16" r="12" fill={A} opacity=".35" />
      <path d="M24 16V4a12 12 0 0 1 11.4 15.7Z" fill={A} />
    </Svg>
  ),
  doughnut: (
    <Svg>
      <circle
        cx="24"
        cy="16"
        r="10"
        fill="none"
        stroke={A}
        strokeWidth="5"
        opacity=".35"
      />
      <path
        d="M24 6a10 10 0 0 1 9.5 13.1"
        fill="none"
        stroke={A}
        strokeWidth="5"
      />
    </Svg>
  ),
  mixed: (
    <Svg>
      <Base />
      <rect x="8" y="16" width="6" height="12" fill={A} opacity=".5" />
      <rect x="20" y="12" width="6" height="16" fill={A} opacity=".5" />
      <rect x="32" y="18" width="6" height="10" fill={A} opacity=".5" />
      <polyline
        points="6,14 17,9 29,11 41,4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Svg>
  ),
  pyramid: (
    <Svg>
      <path d="M24 3v26" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="4" width="6" height="4" fill={A} />
      <rect x="24" y="4" width="5" height="4" fill={A} opacity=".5" />
      <rect x="12" y="10" width="12" height="4" fill={A} />
      <rect x="24" y="10" width="11" height="4" fill={A} opacity=".5" />
      <rect x="8" y="16" width="16" height="4" fill={A} />
      <rect x="24" y="16" width="15" height="4" fill={A} opacity=".5" />
      <rect x="5" y="22" width="19" height="4" fill={A} />
      <rect x="24" y="22" width="18" height="4" fill={A} opacity=".5" />
    </Svg>
  ),
  table: (
    <Svg>
      <rect
        x="5"
        y="4"
        width="38"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="5" y="4" width="38" height="6" fill={A} />
      <path
        d="M5 16h38M5 22h38M18 4v24M31 4v24"
        stroke="currentColor"
        strokeWidth="1"
      />
    </Svg>
  ),
  searchableTable: (
    <Svg>
      <rect
        x="5"
        y="2"
        width="22"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle
        cx="9"
        cy="5"
        r="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="5"
        y="11"
        width="38"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="5" y="11" width="38" height="5" fill={A} />
      <path
        d="M5 22h38M18 11v18M31 11v18"
        stroke="currentColor"
        strokeWidth="1"
      />
    </Svg>
  ),
  stats: (
    <Svg>
      <rect
        x="3"
        y="6"
        width="12"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="18"
        y="6"
        width="12"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="33"
        y="6"
        width="12"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="6" y="13" width="6" height="5" fill={A} />
      <rect x="21" y="13" width="6" height="5" fill={A} />
      <rect x="36" y="13" width="6" height="5" fill={A} />
    </Svg>
  ),
  rankedBars: (
    <Svg>
      <rect
        x="6"
        y="5"
        width="36"
        height="3"
        fill="currentColor"
        opacity=".2"
      />
      <rect x="6" y="5" width="34" height="3" fill={A} />
      <rect
        x="6"
        y="14"
        width="36"
        height="3"
        fill="currentColor"
        opacity=".2"
      />
      <rect x="6" y="14" width="24" height="3" fill={A} />
      <rect
        x="6"
        y="23"
        width="36"
        height="3"
        fill="currentColor"
        opacity=".2"
      />
      <rect x="6" y="23" width="14" height="3" fill={A} />
    </Svg>
  ),
  rankedCards: (
    <Svg>
      <rect
        x="3"
        y="3"
        width="19"
        height="26"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="26"
        y="3"
        width="19"
        height="26"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M6 10h12M6 16h10M6 22h8M29 10h12M29 16h10M29 22h8"
        stroke={A}
        strokeWidth="2.5"
      />
    </Svg>
  ),
};
