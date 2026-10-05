import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import BlockToggles from './BlockToggles';
import { readTranslations } from '../Blocks/_shared/testUtils';

const groups = [
  {
    id: 'juizi',
    title: 'Juizi',
    blocks: [{ id: 'juiziHero', title: 'Hero', config: { icon: {} } }],
  },
  {
    id: 'common',
    title: 'Common',
    blocks: [
      { id: 'hero', title: 'Legacy hero', config: { restricted: true } },
      { id: 'image', title: 'Image', config: {} },
      {
        id: 'eventMetadata',
        title: 'Event metadata',
        config: { restricted: () => true },
      },
    ],
  },
];

const userGroups = [
  { id: 'Site Administrators', title: 'Site Administrators' },
  { id: 'editors', title: 'Editors' },
];

const renderToggles = (lists, onChange = jest.fn()) =>
  render(
    <IntlProvider locale="en">
      <BlockToggles
        groups={groups}
        lists={lists}
        userGroups={userGroups}
        onChange={onChange}
      />
    </IntlProvider>,
  );

const none = { disabled_blocks: [], enabled_blocks: [] };

describe('BlockToggles', () => {
  it('lists every group with its on count', () => {
    renderToggles(none);
    expect(screen.getByText('Juizi')).toBeTruthy();
    expect(screen.getByText('1 of 1 on')).toBeTruthy();
    // Legacy hero is off by its own settings.
    expect(screen.getByText('2 of 3 on')).toBeTruthy();
  });

  it('can switch a disabled block back on', () => {
    const onChange = jest.fn();
    const { container } = renderToggles(
      { disabled_blocks: ['juiziHero'], enabled_blocks: [] },
      onChange,
    );
    // Semantic's `disabled` row blocks all clicks (pointer-events: none).
    expect(container.querySelector('tr.disabled')).toBeNull();
    fireEvent.click(screen.getByLabelText('Hero: Disabled'));
    expect(onChange).toHaveBeenCalledWith(none);
  });

  it('switches on a block that is off by default', () => {
    const onChange = jest.fn();
    renderToggles(none, onChange);
    fireEvent.click(screen.getByLabelText('Legacy hero: Disabled'));
    expect(onChange).toHaveBeenCalledWith({
      disabled_blocks: [],
      enabled_blocks: ['hero'],
    });
  });

  it('shows locked and contextual blocks', () => {
    renderToggles(none);
    expect(screen.getByText('Always on')).toBeTruthy();
    expect(screen.queryByLabelText(/^Image:/)).toBeNull();
    expect(
      screen.getByText(/Only offered where the block allows it/),
    ).toBeTruthy();
  });

  it('is translated, block names and descriptions included', () => {
    render(
      <IntlProvider locale="fr" messages={readTranslations('fr')}>
        <BlockToggles
          groups={[
            {
              id: 'juizi',
              title: 'Juizi',
              blocks: [
                {
                  id: 'emblaCarousel',
                  title: 'Carousel',
                  config: {
                    description:
                      'Slides you add or pages found automatically, shown as a carousel, card row, reviews or scrolling logo strip.',
                  },
                },
                { id: 'image', title: 'Image', config: {} },
              ],
            },
          ]}
          lists={{ disabled_blocks: ['emblaCarousel'], enabled_blocks: [] }}
          onChange={jest.fn()}
        />
      </IntlProvider>,
    );
    expect(screen.getByText('Carrousel')).toBeTruthy();
    expect(screen.getByText(/^Diapositives que vous ajoutez/)).toBeTruthy();
    expect(screen.getByText('1 sur 2 activés')).toBeTruthy();
    expect(screen.getByLabelText('Carrousel: Désactivé')).toBeTruthy();
    expect(screen.getByText('Toujours activé')).toBeTruthy();
    expect(
      screen.getByText('Rétablir tous les réglages par défaut'),
    ).toBeTruthy();
  });

  it('resets only registered blocks', () => {
    const onChange = jest.fn();
    renderToggles(
      {
        disabled_blocks: ['juiziHero', 'gone'],
        enabled_blocks: ['hero'],
        block_groups: { eventMetadata: ['editors'], gone: ['editors'] },
      },
      onChange,
    );
    fireEvent.click(screen.getByText('Reset all to their defaults'));
    expect(onChange).toHaveBeenCalledWith({
      disabled_blocks: ['gone'],
      enabled_blocks: [],
      block_groups: { gone: ['editors'] },
    });
  });

  it('offers switched-on blocks to everybody until groups are picked', () => {
    const onChange = jest.fn();
    renderToggles(none, onChange);
    // Juizi Hero and Event metadata; not the locked Image or the off hero.
    expect(screen.getAllByText('Who can add it: Everybody')).toHaveLength(2);
    fireEvent.click(screen.getAllByLabelText('Editors')[0]);
    expect(onChange).toHaveBeenCalledWith({
      ...none,
      block_groups: { juiziHero: ['editors'] },
    });
  });

  it('shows the chosen groups when collapsed and can reset to everybody', () => {
    const onChange = jest.fn();
    renderToggles(
      { ...none, block_groups: { juiziHero: ['editors', 'removed'] } },
      onChange,
    );
    expect(screen.getByText('Who can add it: Editors, removed')).toBeTruthy();
    // A group that no longer exists stays listed so it can be unticked.
    fireEvent.click(screen.getByLabelText('removed'));
    expect(onChange).toHaveBeenLastCalledWith({
      ...none,
      block_groups: { juiziHero: ['editors'] },
    });
    fireEvent.click(screen.getByText('Offer to everybody'));
    expect(onChange).toHaveBeenLastCalledWith({ ...none, block_groups: {} });
  });
});
