import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import config from '@plone/volto/registry';
import ReorderList, { ItemPosition, move, withPosition } from './ReorderList';

/** Stands in for Volto's list: each item's form shows the fields its
 * extended schema asks for, the position one by the real widget. */
const FakeObjectList = ({ value, schema, schemaExtender }) => (
  <div>
    {value.map((item, index) => {
      const extended = schemaExtender(schema, item);
      const fields = extended.fieldsets[0].fields;
      return (
        <div key={item['@id'] || index} data-testid={`item-${index}`}>
          <div className="accordion-title-wrapper">#{index + 1}</div>
          {fields.includes('juiziPosition') && (
            <ItemPosition {...extended.properties.juiziPosition} />
          )}
        </div>
      );
    })}
  </div>
);

const SCHEMA = {
  title: 'Slide',
  fieldsets: [{ id: 'default', title: 'Default', fields: ['heading'] }],
  properties: { heading: { title: 'Heading' } },
};

const Harness = ({ initial }) => {
  const [value, setValue] = useState(initial);
  return (
    <IntlProvider locale="en">
      <ReorderList
        id="slides"
        value={value}
        schema={SCHEMA}
        onChange={(id, next) => setValue(next)}
      />
      <ol data-testid="order">
        {value.map((item) => (
          <li key={item['@id'] || item.title}>{item.title}</li>
        ))}
      </ol>
    </IntlProvider>
  );
};

const order = () =>
  [...screen.getByTestId('order').querySelectorAll('li')].map(
    (li) => li.textContent,
  );

describe('ReorderList', () => {
  beforeAll(() => {
    config.widgets = config.widgets || {};
    config.widgets.widget = {
      ...config.widgets.widget,
      object_list: FakeObjectList,
    };
  });

  const items = [
    { '@id': 'a', title: 'First' },
    { '@id': 'b', title: 'Second' },
    { '@id': 'c', title: 'Third' },
  ];

  it('gives each item Move buttons named after it', () => {
    render(<Harness initial={items} />);
    expect(
      screen.getByRole('button', { name: 'Move down: First' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Move up: Third' })).toBeTruthy();
    expect(screen.getByText('Position 2 of 3')).toBeTruthy();
  });

  it('moves an item, keeps focus on the button and says where it went', () => {
    render(<Harness initial={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move down: First' }));
    expect(order()).toEqual(['Second', 'First', 'Third']);
    expect(document.activeElement.getAttribute('aria-label')).toBe(
      'Move down: First',
    );
    expect(screen.getByRole('status').textContent).toBe('First is now 2 of 3');
  });

  it('does nothing past either end, and keeps the button focusable', () => {
    render(<Harness initial={items} />);
    const up = screen.getByRole('button', { name: 'Move up: First' });
    expect(up.getAttribute('aria-disabled')).toBe('true');
    expect(up.disabled).toBe(false);
    fireEvent.click(up);
    expect(order()).toEqual(['First', 'Second', 'Third']);
  });

  it('works for items saved without an id', () => {
    render(<Harness initial={[{ title: 'Old one' }, { title: 'Old two' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move down: Old one' }));
    expect(order()).toEqual(['Old two', 'Old one']);
  });

  it('names untitled items by their kind and number', () => {
    render(<Harness initial={[{ '@id': 'a' }, { '@id': 'b' }]} />);
    expect(
      screen.getByRole('button', { name: 'Move down: Slide 1' }),
    ).toBeTruthy();
  });

  it('shows nothing to move with a single item', () => {
    render(<Harness initial={[{ '@id': 'a', title: 'Only' }]} />);
    expect(screen.queryByRole('button', { name: /Move/ })).toBeNull();
  });
});

describe('helpers', () => {
  it('moves within the list only', () => {
    expect(move(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    const same = ['a'];
    expect(move(same, 0, 1)).toBe(same);
  });

  it('adds the position field once, at the end of the first fieldset', () => {
    const once = withPosition(SCHEMA, {});
    const twice = withPosition(once, {});
    expect(twice.fieldsets[0].fields).toEqual(['heading', 'juiziPosition']);
  });
});
