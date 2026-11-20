import {
  blockLastHeading,
  headingLevels,
  levelAttrs,
  previousHeadingLevel,
} from './headingLevel';

const page = (blocks) => ({
  blocks: Object.fromEntries(blocks.map((b, i) => [`b${i}`, b])),
  blocks_layout: { items: blocks.map((_, i) => `b${i}`) },
});
const slate = (type) => ({
  '@type': 'slate',
  value: [{ type, children: [{ text: 'x' }] }],
});

describe('heading levels', () => {
  it('starts after the page title', () => {
    const p = page([{ '@type': 'title' }, { '@type': 'contentRow' }]);
    expect(previousHeadingLevel(p, 'b1')).toBe(1);
  });

  it('follows text headings', () => {
    const p = page([slate('h2'), slate('h3'), { '@type': 'contentRow' }]);
    expect(previousHeadingLevel(p, 'b2')).toBe(3);
  });

  it('counts a block title as a section heading', () => {
    expect(
      blockLastHeading({ '@type': 'contentRow', headerText: 'A' }, 1),
    ).toBe(2);
    expect(blockLastHeading({ '@type': 'contentRow' }, 3)).toBe(3);
    expect(
      blockLastHeading({ '@type': 'juiziHero', isPrimaryHeading: true }, 2),
    ).toBe(1);
  });

  it('lifts untitled item headings straight under the page title', () => {
    const p = page([{ '@type': 'title' }, { '@type': 'emblaCarousel' }]);
    expect(headingLevels(p, 'b1', { hasTitle: false })).toEqual({
      title: 2,
      item: 2,
    });
  });

  it('leaves the designed levels where nothing skips', () => {
    const p = page([slate('h2'), { '@type': 'emblaCarousel' }]);
    expect(headingLevels(p, 'b1', { hasTitle: false })).toEqual({
      title: 2,
      item: 3,
    });
    expect(headingLevels(p, 'b1', { hasTitle: true })).toEqual({
      title: 2,
      item: 3,
    });
  });

  it('never goes deeper than the tag', () => {
    const p = page([slate('h4'), { '@type': 'emblaCarousel' }]);
    expect(headingLevels(p, 'b1', { hasTitle: true })).toEqual({
      title: 2,
      item: 3,
    });
  });

  it('changes nothing for blocks it cannot find (inside a grid)', () => {
    const p = page([{ '@type': 'title' }]);
    expect(headingLevels(p, 'nested', { hasTitle: false })).toEqual({
      title: 2,
      item: 3,
    });
    expect(headingLevels(undefined, 'b0')).toEqual({ title: 2, item: 3 });
  });

  it('only adds aria-level when it differs from the tag', () => {
    expect(levelAttrs(3, 3)).toEqual({});
    expect(levelAttrs(2, 3)).toEqual({ 'aria-level': 2 });
  });
});
