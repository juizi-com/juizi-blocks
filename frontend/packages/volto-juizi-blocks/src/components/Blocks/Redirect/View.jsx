import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import BlockPlaceholder from '../_shared/BlockPlaceholder';
import BlockWrapper from '../_shared/BlockWrapper';
import EditHint from '../_shared/EditHint';
import { isEditing } from '../_shared/editMode';
import { isExternalHref } from '../_shared/links';
import {
  getRedirectUrl,
  isRedirectLoop,
  isSamePage,
  rememberRedirect,
} from './redirectTarget';
import messages from './messages';

import './redirect-block.less';

// Outer layer: full width with the side gutter; inner layer: the message.
const Wrapper = ({ blockProps, children }) => (
  <BlockWrapper {...blockProps}>
    <div className="redirect-block-wrapper">{children}</div>
  </BlockWrapper>
);

// Who sees what (README.md has the full table):
// - Editors (canvas, isEditMode): what's set, or a start screen. Never
//   redirected, and no "go now" link, which would leave the edit form.
// - Logged-in users viewing the page: where visitors go, with a link to go
//   there themselves. Never redirected.
// - Visitors: a short countdown with a "Go now" link, then the redirect.
const View = (props) => {
  const { data } = props;
  const isEditMode = isEditing(props);
  const intl = useIntl();
  const history = useHistory();
  const [countdown, setCountdown] = useState(3);
  const [looped, setLooped] = useState(false);
  const url = getRedirectUrl(data);
  const contentId = useSelector((state) => state.content?.data?.['@id']);
  const samePage = isSamePage(url, contentId);
  // What the block calls the destination: the page name, else the address.
  const pageName = data.pageName?.trim() || '';

  const isLoggedIn = useSelector((state) => !!state.userSession?.token);
  const shouldRedirect =
    !isEditMode && !isLoggedIn && !!url && !samePage && !looped;

  const navigate = () => {
    if (isExternalHref(url)) {
      window.location.href = url;
    } else {
      history.push(url);
    }
  };

  const redirectNow = () => {
    if (contentId) rememberRedirect(contentId);
    navigate();
  };

  // Loop breaker: decided once, when the page opens.
  useEffect(() => {
    if (isEditMode || isLoggedIn || !url || samePage || !contentId) return;
    if (isRedirectLoop(contentId)) setLooped(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  useEffect(() => {
    if (!shouldRedirect) return undefined;
    if (countdown === 0) {
      redirectNow();
      return undefined;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, shouldRedirect, url, contentId]);

  if (!isEditMode && !isLoggedIn && !shouldRedirect) return null;

  if (!url) {
    return (
      <Wrapper blockProps={props}>
        {isEditMode ? (
          <BlockPlaceholder
            blockClass="redirect-block-placeholder"
            prompt={intl.formatMessage(messages.choosePrompt)}
          />
        ) : (
          <div className="redirect-block redirect-block--unconfigured">
            {intl.formatMessage(messages.noDestination)}
          </div>
        )}
      </Wrapper>
    );
  }

  if (samePage) {
    return (
      <Wrapper blockProps={props}>
        <div className="redirect-block redirect-block--unconfigured">
          {isEditMode ? (
            <EditHint isEditMode tone="warning" live>
              {intl.formatMessage(messages.samePageEdit)}
            </EditHint>
          ) : (
            intl.formatMessage(messages.samePageView)
          )}
        </div>
      </Wrapper>
    );
  }

  if (isEditMode || isLoggedIn) {
    return (
      <Wrapper blockProps={props}>
        <div className="redirect-block redirect-block--preview">
          <span className="redirect-block__arrow" aria-hidden="true">
            →
          </span>
          <div className="redirect-block__body">
            <p className="redirect-block__line">
              <FormattedMessage
                {...messages.willBeSent}
                values={{
                  destination: (
                    <strong className="redirect-block__name">
                      {pageName || url}
                    </strong>
                  ),
                }}
              />
              {pageName && (
                <span className="redirect-block__url"> ({url})</span>
              )}
            </p>
            {isEditMode ? (
              <EditHint isEditMode>
                {intl.formatMessage(messages.permanentHint)}
              </EditHint>
            ) : (
              // You aren't redirected while logged in: go there yourself.
              <a
                className="redirect-block__go"
                href={url}
                onClick={(e) => {
                  if (isExternalHref(url)) return;
                  e.preventDefault();
                  navigate();
                }}
              >
                {pageName
                  ? intl.formatMessage(messages.goTo, { name: pageName })
                  : intl.formatMessage(messages.goToPage)}
              </a>
            )}
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper blockProps={props}>
      <div className="redirect-block redirect-block--redirecting">
        <span className="redirect-block__spinner" aria-hidden="true" />
        <span role="status" aria-live="polite">
          {intl.formatMessage(
            pageName
              ? countdown > 0
                ? messages.taking
                : messages.takingNow
              : countdown > 0
                ? messages.redirecting
                : messages.redirectingNow,
            { name: pageName, seconds: countdown },
          )}
        </span>
        {/* Skip the countdown. A real link, so it also works before the
            page's scripts have loaded. */}
        <a
          className="redirect-block__go"
          href={url}
          onClick={(e) => {
            e.preventDefault();
            redirectNow();
          }}
        >
          {intl.formatMessage(messages.goNow)}
        </a>
      </div>
    </Wrapper>
  );
};

export default View;
