import {
  DEFAULT_OVERLAYS,
  getOverlayChoices,
  overlayBackground,
  overlayById,
} from './gradients';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const config = jest.requireMock('@plone/volto/registry');

afterEach(() => {
  delete config.settings.juiziBlocks;
});

describe('image overlays', () => {
  it('offers the built-in list until the site sets its own', () => {
    const ids = getOverlayChoices().map(([id]) => id);
    expect(ids).toEqual(DEFAULT_OVERLAYS.map(({ id }) => id));
    expect(ids.slice(0, 2)).toEqual(['gradient', 'none']);
    expect(getOverlayChoices()[2][1]).toBe('Black — Light (30%)');
  });

  it("replaces the whole list with the site's", () => {
    config.settings.juiziBlocks = {
      overlays: [
        overlayById('none'),
        { id: 'brand-side', label: 'Brand, from the left', background: 'red' },
      ],
    };
    expect(getOverlayChoices()).toEqual([
      ['none', 'None'],
      ['brand-side', 'Brand, from the left'],
    ]);
  });

  it('keeps a saved value the list no longer has as a choice', () => {
    config.settings.juiziBlocks = { overlays: [overlayById('none')] };
    expect(getOverlayChoices(undefined, 'black-50').pop()).toEqual([
      'black-50',
      'Black — Medium (50%)',
    ]);
    expect(getOverlayChoices(undefined, 'removed').pop()).toEqual([
      'removed',
      'removed',
    ]);
    expect(getOverlayChoices(undefined, 'none')).toHaveLength(1);
  });

  it('draws every overlay from the list, the built-in one when unset', () => {
    config.settings.juiziBlocks = {
      overlays: [{ id: 'brand-side', label: 'Brand', background: 'red' }],
    };
    expect(overlayBackground('brand-side')).toEqual({ background: 'red' });
    // Saved blocks keep their built-in overlay, even one the site left out.
    expect(overlayBackground(undefined).background).toContain(
      'linear-gradient',
    );
    expect(overlayBackground('black-50')).toEqual({
      background: 'rgba(0,0,0,0.5)',
    });
    expect(overlayBackground('none')).toBeNull();
    expect(overlayBackground('removed')).toBeNull();
  });
});
