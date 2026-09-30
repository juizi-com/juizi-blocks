/**
 * Whether a block view is being rendered in the editor.
 * makeBlockEdit passes `isEditMode`; otherwise the edit context is the one
 * that passes `onChangeBlock`. Never use `props.mode` (not reliably set).
 */
export const isEditing = (props = {}) =>
  props.isEditMode ?? typeof props.onChangeBlock === 'function';
