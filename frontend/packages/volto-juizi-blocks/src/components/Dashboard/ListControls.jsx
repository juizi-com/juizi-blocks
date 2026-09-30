import React from 'react';
import { useIntl } from 'react-intl';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import messages from './messages';

/** Move up / move down / remove buttons for a row of an editable list. */
const ListControls = ({ index, count, onMove, onRemove, canRemove = true }) => {
  const intl = useIntl();
  const button = (label, icon, onClick, disabled, variant = 'secondary') => (
    <button
      type="button"
      className={`juizi-dashboard__btn juizi-dashboard__btn--icon juizi-dashboard__btn--${variant}`}
      disabled={disabled}
      title={intl.formatMessage(label)}
      aria-label={intl.formatMessage(label)}
      onClick={onClick}
    >
      {icon}
    </button>
  );
  return (
    <div className="juizi-dashboard__row-actions">
      {button(
        messages.moveUp,
        <ArrowUp size={14} />,
        () => onMove(-1),
        index === 0,
      )}
      {button(
        messages.moveDown,
        <ArrowDown size={14} />,
        () => onMove(1),
        index === count - 1,
      )}
      {button(
        messages.remove,
        <Trash2 size={14} />,
        onRemove,
        !canRemove,
        'danger',
      )}
    </div>
  );
};

export const moveItem = (list, index, delta) => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(index + delta, 0, item);
  return next;
};

export default ListControls;
