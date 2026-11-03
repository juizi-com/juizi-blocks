import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { LoaderCircle, Printer } from 'lucide-react';
import { getButtonClasses, getDefaultButton } from '../../../config/colors';
import { DEFAULT_PRINT_CONFIG, useJuiziBlocksSettings } from '../../../settings';
import BlockErrorBoundary from '../_shared/BlockErrorBoundary';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import {
  findContent,
  footerHtml,
  headerHtml,
  loadImages,
  pageCss,
  preparePrint,
  printLogo,
  printValues,
} from './print';
import messages from './messages';

import './print-button.css';

// If the browser never says printing has finished, put the page back anyway.
const GIVE_UP_MS = 60000;

const PrintButton = (props) => {
  const { data, isEditMode } = props;
  const intl = useIntl();
  const settings = useJuiziBlocksSettings();
  const printConfig = { ...DEFAULT_PRINT_CONFIG, ...settings?.print_config };
  const content = useSelector((state) => state.content?.data);
  const breadcrumbs = useSelector((state) => state.breadcrumbs?.items);
  const site = useSelector((state) => state.site?.data);
  const [preparing, setPreparing] = useState(false);
  const cleanupRef = useRef(null);

  const finish = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setPreparing(false);
  }, []);
  // Leaving the page while printing: put it back.
  useEffect(() => finish, [finish]);

  const print = async () => {
    // In the editor the button only shows what visitors get.
    if (isEditMode || preparing) return;
    setPreparing(true);
    const values = printValues({
      content,
      breadcrumbs,
      site,
      language: intl.locale,
      pageUrl: window.location.href,
    });
    const logo = printLogo(printConfig, site);
    const pageContent = findContent(document);
    cleanupRef.current = preparePrint({
      content: pageContent,
      header: headerHtml(printConfig, values, logo, document),
      footer: footerHtml(printConfig, values, logo, document),
      css: pageCss(printConfig),
    });
    await loadImages(pageContent);
    const timer = setTimeout(finish, GIVE_UP_MS);
    window.addEventListener(
      'afterprint',
      () => {
        clearTimeout(timer);
        finish();
      },
      { once: true },
    );
    window.print();
  };

  const align = data.align || 'right';
  const { className, style } = getButtonClasses(
    data.buttonStyle || printConfig.button_style || getDefaultButton(),
    'print-button',
  );
  const label = (data.label || '').trim() || intl.formatMessage(messages.print);

  return (
    <BlockWrapper {...props} className={`align-${align}`}>
      <div
        className={cx('juizi-print', `juizi-print--${align}`, {
          'juizi-print--editing': isEditMode,
        })}
      >
        <button
          type="button"
          className={className}
          style={style}
          onClick={print}
          disabled={preparing}
          aria-busy={preparing || undefined}
        >
          {preparing ? (
            <LoaderCircle className="juizi-print__spinner" aria-hidden="true" />
          ) : (
            <Printer aria-hidden="true" />
          )}
          <span>
            {preparing ? intl.formatMessage(messages.preparing) : label}
          </span>
        </button>
        <EditHint isEditMode={isEditMode}>
          {intl.formatMessage(messages.editHint)}
        </EditHint>
      </div>
    </BlockWrapper>
  );
};

const PrintButtonView = (props) => {
  const isEditMode = isEditing(props);
  return (
    <BlockErrorBoundary
      blockClass="juizi-print"
      isEditMode={isEditMode}
      resetKey={JSON.stringify(props.data)}
    >
      <PrintButton {...props} isEditMode={isEditMode} />
    </BlockErrorBoundary>
  );
};

export default PrintButtonView;
