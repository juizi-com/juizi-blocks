import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import SubscribeMenu, { absoluteUrl, webcalUrl } from './SubscribeMenu';

const FILE = '/++api++/events/@@juizi-calendar.ics?block=cal';

const renderMenu = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <SubscribeMenu href={FILE} fileName="events.ics" {...props} />
    </IntlProvider>,
  );

const button = () =>
  screen.getByRole('button', { name: 'Add to your calendar' });

describe('SubscribeMenu', () => {
  it('is a closed button at first', () => {
    renderMenu();
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a named panel and moves focus into it', () => {
    renderMenu();
    fireEvent.click(button());
    const dialog = screen.getByRole('dialog', { name: 'Add to your calendar' });
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(button().getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('offers the file with its full address', () => {
    renderMenu();
    fireEvent.click(button());
    const download = screen.getByRole('link', {
      name: 'Download the events (.ics)',
    });
    expect(download.getAttribute('href')).toBe(`http://localhost${FILE}`);
    expect(download.getAttribute('download')).toBe('events.ics');
    expect(screen.getByLabelText('Calendar link').value).toBe(
      `http://localhost${FILE}`,
    );
  });

  it('leaves out Subscribe where the site isn’t on HTTPS', () => {
    renderMenu();
    fireEvent.click(button());
    expect(
      screen.queryByRole('link', { name: 'Subscribe in your calendar app' }),
    ).toBeNull();
  });

  it('offers Subscribe as webcal: on HTTPS', () => {
    renderMenu({ href: `https://www.example.org${FILE}` });
    fireEvent.click(button());
    expect(
      screen
        .getByRole('link', { name: 'Subscribe in your calendar app' })
        .getAttribute('href'),
    ).toBe(`webcal://www.example.org${FILE}`);
  });

  it('closes on Escape and gives focus back to the button', () => {
    renderMenu();
    fireEvent.click(button());
    fireEvent.keyDown(document.activeElement, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('closes on a click outside', () => {
    renderMenu();
    fireEvent.click(button());
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('copies the link and says so', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText } });
    renderMenu();
    fireEvent.click(button());
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    });
    expect(writeText).toHaveBeenCalledWith(`http://localhost${FILE}`);
    expect(screen.getByRole('status').textContent).toBe('Link copied');
  });

  it('says when it couldn’t copy', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: () => Promise.reject(new Error('no')) },
    });
    document.execCommand = jest.fn(() => false);
    renderMenu();
    fireEvent.click(button());
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    });
    expect(screen.getByRole('status').textContent).toMatch(/Couldn’t copy/);
  });

  it('doesn’t leave the page from the editing canvas', () => {
    renderMenu({ isEdit: true });
    fireEvent.click(button());
    const download = screen.getByRole('link', {
      name: 'Download the events (.ics)',
    });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    download.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('addresses', () => {
  it('makes a path absolute', () => {
    expect(absoluteUrl('/a.ics')).toBe('http://localhost/a.ics');
  });
  it('only turns HTTPS into webcal:', () => {
    expect(webcalUrl('https://x.org/a.ics')).toBe('webcal://x.org/a.ics');
    expect(webcalUrl('http://x.org/a.ics')).toBe('');
  });
});
