/**
 * "Show as": the ways to show the data as a grid of small pictures with
 * their names, grouped into charts, tables and cards. The chosen one is
 * described underneath, so editors can explore what each does. Switching
 * keeps the data and the other settings.
 *
 * Stores the view id in `chartType` (views.js), like the older block's
 * select did.
 */
import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import { GROUPS, VIEWS, getView } from '../views';
import { icons } from './icons';
import './picker.scss';

const ChartTypeWidget = (props) => {
  const { id, value, onChange } = props;
  const intl = useIntl();
  const current = getView(value);
  return (
    <FormFieldWrapper
      {...props}
      columns={1}
      className="juizi-chart-picker-field"
    >
      <div className="juizi-chart-picker">
        {GROUPS.map((group) => (
          <fieldset key={group.id} className="juizi-chart-picker__group">
            <legend className="juizi-chart-picker__legend">
              {intl.formatMessage(group.label)}
            </legend>
            <div className="juizi-chart-picker__grid">
              {VIEWS.filter((view) => view.group === group.id).map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className={cx('juizi-chart-picker__option', {
                    'juizi-chart-picker__option--selected': view.id === value,
                  })}
                  aria-pressed={view.id === value}
                  onClick={() => onChange(id, view.id)}
                >
                  {icons[view.id]}
                  <span className="juizi-chart-picker__name">
                    {intl.formatMessage(view.label)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {current && (
          <p className="juizi-chart-picker__description" aria-live="polite">
            <strong>{intl.formatMessage(current.label)}:</strong>{' '}
            {intl.formatMessage(current.description)}
          </p>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default ChartTypeWidget;
