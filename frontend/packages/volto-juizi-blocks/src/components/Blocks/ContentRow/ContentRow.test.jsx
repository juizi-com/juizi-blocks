import React from 'react';
import { render, screen } from '@testing-library/react';
import View from './View';
import schema from './schema';

jest.mock('../_shared/BlockWrapper');
jest.mock('../../BlockEdit/BlockEdit', () => ({
  __esModule: true,
  default: (View) => View,
  schemaData: (args = {}) =>
    args.formData || args.data || args.props?.data || {},
}));
jest.mock('@plone/volto/registry', () => ({
  settings: {
    publicURL: 'http://localhost:3000',
    apiPath: '',
    externalRoutes: [],
  },
  blocks: { blocksConfig: {} },
}));
jest.mock('embla-carousel-react', () => () => [() => {}, undefined]);

describe('Content Row', () => {
  it('lists the four real styles, in dropdown order (CR3)', () => {
    render(<View data={{ '@type': 'contentRow' }} isEditMode />);
    ['Numbered', 'Icon', 'Statistics', 'Image card'].forEach((name) =>
      expect(screen.getByText(name)).toBeTruthy(),
    );
    expect(screen.queryByText('Image above')).toBeNull();
    const choices = schema({ data: {} }).properties.displayMode.choices;
    expect(choices.map(([value]) => value)).toEqual([
      'numbered',
      'icon',
      'statistics',
      'card',
    ]);
  });

  it('uses displayMode, not variation (CR1: VLT hides option 4 of "variation")', () => {
    const { fieldsets } = schema({ data: {} });
    expect(fieldsets[0].fields).toEqual(['displayMode']);
  });

  it('prompts editors to add the first item, shows visitors nothing (CR2)', () => {
    const data = { '@type': 'contentRow', displayMode: 'icon', items: [] };
    const edit = render(<View data={data} isEditMode />);
    expect(edit.container.textContent).toContain('No items yet');
    const live = render(<View data={data} />);
    expect(live.container.innerHTML).toBe('');
  });

  it('shows the real number before counting (CR11)', () => {
    const { container } = render(
      <View
        data={{
          '@type': 'contentRow',
          displayMode: 'statistics',
          items: [{ '@id': 'a', value: 1000, label: 'People' }],
        }}
      />,
    );
    expect(container.textContent).toContain('1,000');
  });

  it('puts Items second, after the heading (CR4)', () => {
    const ids = schema({ data: { displayMode: 'card' } }).fieldsets.map(
      (f) => f.id,
    );
    expect(ids.slice(0, 3)).toEqual(['default', 'header', 'items-card']);
  });
});
