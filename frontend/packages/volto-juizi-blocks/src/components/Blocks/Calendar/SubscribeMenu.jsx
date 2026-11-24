/**
 * The calendar button beside the title: a small panel to subscribe in a
 * calendar app, download the file, or copy its link for Google Calendar and
 * the like.
 *
 * A non-modal dialog: focus moves into it on opening, Escape or a click
 * outside closes it and focus goes back to the button, and leaving it with
 * Tab closes it too.
 */
import React, { useEffect, useId, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';

/** The file's full address: copied links must work anywhere. */
export const absoluteUrl = (href) => {
  if (typeof window === 'undefined') return href;
  try {
    return new URL(href, window.location.origin).href;
  } catch {
    return href;
  }
};

/** webcal: opens the visitor's calendar app; it needs HTTPS behind it. */
export const webcalUrl = (url) =>
  url.startsWith('https://') ? url.replace(/^https:\/\//, 'webcal://') : '';

const copyText = async (text, input) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or no permission: copy the selected field.
    if (!input) return false;
    input.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  }
};

const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 11V6.5A1.5 1.5 0 0 0 18.5 5h-14A1.5 1.5 0 0 0 3 6.5v12A1.5 1.5 0 0 0 4.5 20H12M8 3v4M15 3v4M3 10h17M18 14.5v7M14.5 18h7" />
  </svg>
);

const SubscribeMenu = ({ href, fileName = 'calendar.ics', isEdit }) => {
  const intl = useIntl();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const wrapper = useRef(null);
  const button = useRef(null);
  const panel = useRef(null);
  const input = useRef(null);

  const label = intl.formatMessage(messages.subscribe);
  const url = open ? absoluteUrl(href) : href;
  const webcal = webcalUrl(url);

  const close = (refocus = true) => {
    setOpen(false);
    setCopied('');
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    panel.current?.querySelector('a, button, input')?.focus();
    const outside = (event) => {
      if (!wrapper.current?.contains(event.target)) close(false);
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('touchstart', outside);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      close();
    }
  };

  // Tabbing out of the panel closes it, without pulling focus back.
  const onBlur = (event) => {
    if (open && !wrapper.current?.contains(event.relatedTarget)) close(false);
  };

  // The canvas is for editing: don't leave the page or start a download.
  const editGuard = isEdit ? (event) => event.preventDefault() : undefined;

  const copy = async () => {
    const done = await copyText(url, input.current);
    setCopied(
      intl.formatMessage(done ? messages.linkCopied : messages.copyFailed),
    );
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="juizi-calendar__subscribe-wrap"
      ref={wrapper}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <button
        type="button"
        ref={button}
        className="juizi-calendar__subscribe"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <CalendarIcon />
        {!open && (
          // For sighted mouse and keyboard users: the button is named above.
          <span className="juizi-calendar__subscribe-tip" aria-hidden="true">
            {label}
          </span>
        )}
      </button>
      {open && (
        <div
          id={`${id}-panel`}
          ref={panel}
          className="juizi-calendar__subscribe-panel"
          role="dialog"
          aria-labelledby={`${id}-heading`}
          // A click on its text keeps focus inside, so it stays open.
          tabIndex={-1}
        >
          <p id={`${id}-heading`} className="juizi-calendar__subscribe-heading">
            {label}
          </p>
          <ul className="juizi-calendar__subscribe-options">
            {webcal && (
              <li>
                <a
                  href={webcal}
                  className="juizi-calendar__subscribe-option"
                  onClick={editGuard}
                >
                  {intl.formatMessage(messages.subscribeApp)}
                </a>
                <span className="juizi-calendar__subscribe-help">
                  {intl.formatMessage(messages.subscribeAppHelp)}
                </span>
              </li>
            )}
            <li>
              <a
                href={url}
                download={fileName}
                className="juizi-calendar__subscribe-option"
                onClick={editGuard}
              >
                {intl.formatMessage(messages.download)}
              </a>
              <span className="juizi-calendar__subscribe-help">
                {intl.formatMessage(messages.downloadHelp)}
              </span>
            </li>
            <li>
              <label
                htmlFor={`${id}-link`}
                className="juizi-calendar__subscribe-label"
              >
                {intl.formatMessage(messages.calendarLink)}
              </label>
              <span className="juizi-calendar__subscribe-copy">
                <input
                  id={`${id}-link`}
                  ref={input}
                  type="text"
                  readOnly
                  value={url}
                  aria-describedby={`${id}-link-help`}
                  onFocus={(event) => event.target.select()}
                />
                <button
                  type="button"
                  className="juizi-calendar__subscribe-option"
                  onClick={copy}
                >
                  {intl.formatMessage(messages.copyLink)}
                </button>
              </span>
              <span
                id={`${id}-link-help`}
                className="juizi-calendar__subscribe-help"
              >
                {intl.formatMessage(messages.calendarLinkHelp)}
              </span>
            </li>
          </ul>
          <p role="status" className="juizi-calendar__subscribe-status">
            {copied}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscribeMenu;
