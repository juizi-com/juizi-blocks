/**
 * A short edit-only message shown inside a block's own frame: "Add a
 * heading in the sidebar.", "The icon colour is hard to see…". Visitors
 * never see it.
 *
 * Use BlockPlaceholder instead when the whole block has nothing to show
 * (no display style chosen, no items at all).
 *
 * Props:
 *   isEditMode — render only when true
 *   tone       — 'hint' (default) or 'warning'
 *   as         — element to render, 'p' by default ('span' inside inline
 *                content such as a button)
 *   live       — announce the message when it appears (for warnings that
 *                follow an editor's change)
 */
import React from 'react';
import './edit-hint.css';

const EditHint = ({
  isEditMode,
  tone = 'hint',
  as: Tag = 'p',
  live = false,
  className = '',
  children,
}) => {
  if (!isEditMode || !children) return null;
  return (
    <Tag
      className={`block__edit-hint block__edit-hint--${tone} ${className}`.trim()}
      {...(live ? { role: 'status', 'aria-live': 'polite' } : {})}
    >
      {children}
    </Tag>
  );
};

export default EditHint;
