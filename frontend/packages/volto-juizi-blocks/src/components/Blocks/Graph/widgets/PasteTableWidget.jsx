/**
 * "Your figures": paste cells copied from a spreadsheet and press "Use
 * these figures". The cells are read by the backend (the same reader as
 * CSV files, juizi.blocks.graph) and saved in the block as
 * { columns, rows }; the pasted text itself isn't kept.
 */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Api from '@plone/volto/helpers/Api/Api';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { formatNumber } from '../../_shared/format';
import messages from '../messages';
import './picker.scss';

const PasteTableWidget = (props) => {
  const { id, value, onChange } = props;
  const intl = useIntl();
  const location = useLocation();
  const hasTable = !!value?.columns?.length;
  const [editing, setEditing] = useState(!hasTable);
  const [text, setText] = useState('');
  const [state, setState] = useState({});
  const t = (message, values) => intl.formatMessage(message, values);

  const read = () => {
    setState({ busy: true });
    new Api()
      .post(`${getBaseUrl(location.pathname)}/@juizi-graph-data`, {
        data: { text, delimiter: 'auto' },
      })
      .then((table) => {
        if (table.error === 'too-big')
          return setState({ error: t(messages.pasteTooBig) });
        if (table.error || !table.columns?.length) {
          return setState({ error: t(messages.pasteFailed) });
        }
        onChange(id, { columns: table.columns, rows: table.rows });
        setText('');
        setEditing(false);
        return setState(
          table.truncated
            ? {
                note: t(messages.pasteTooLong, {
                  shown: formatNumber(table.rows.length, intl.locale),
                  total: formatNumber(table.total, intl.locale),
                }),
              }
            : {},
        );
      })
      .catch(() => setState({ error: t(messages.pasteFailed) }));
  };

  return (
    <FormFieldWrapper
      {...props}
      columns={1}
      className="juizi-paste-table-field"
    >
      <div className="juizi-paste-table">
        {hasTable && (
          <p className="juizi-paste-table__summary">
            {t(messages.pasteSummary, {
              columns: value.columns.length,
              names: value.columns.join(', '),
              rows: (value.rows || []).length,
            })}
          </p>
        )}
        {state.note && <p className="juizi-paste-table__note">{state.note}</p>}
        {editing ? (
          <>
            <textarea
              className="juizi-paste-table__input"
              aria-label={t(messages.pasteBox)}
              placeholder={t(messages.pasteBox)}
              rows={8}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            {state.error && (
              <p className="juizi-paste-table__error" role="alert">
                {state.error}
              </p>
            )}
            <div className="juizi-paste-table__actions">
              <button
                type="button"
                className="ui button primary"
                disabled={!text.trim() || state.busy}
                onClick={read}
              >
                {state.busy ? t(messages.pasteReading) : t(messages.pasteUse)}
              </button>
              {hasTable && (
                <button
                  type="button"
                  className="ui button basic"
                  onClick={() => {
                    setEditing(false);
                    setState({});
                  }}
                >
                  {t(messages.pasteCancel)}
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            className="ui button basic"
            onClick={() => setEditing(true)}
          >
            {t(messages.pasteReplace)}
          </button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default PasteTableWidget;
