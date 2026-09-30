import {
  OWN_RESTRICTED,
  blockToggleState,
  groupBlocks,
  isRestricted,
  setBlockToggle,
  wrapBlocksRestricted,
} from './toggles';

const none = { disabled_blocks: [], enabled_blocks: [] };
const oncePerPage = ({ properties }) => properties.hasTitle;

describe('blockToggleState', () => {
  it('is on by default unless the block restricts itself', () => {
    expect(blockToggleState('teaser', {}, none)).toMatchObject({
      on: true,
      defaultOn: true,
      contextual: false,
      locked: false,
    });
    expect(blockToggleState('hero', { restricted: true }, none)).toMatchObject({
      on: false,
      defaultOn: false,
    });
    expect(
      blockToggleState('eventMetadata', { restricted: oncePerPage }, none),
    ).toMatchObject({ on: true, contextual: true });
  });

  it('follows the dashboard lists', () => {
    const lists = { disabled_blocks: ['teaser'], enabled_blocks: ['hero'] };
    expect(blockToggleState('teaser', {}, lists).on).toBe(false);
    expect(blockToggleState('hero', { restricted: true }, lists).on).toBe(true);
  });

  it('keeps locked blocks on', () => {
    const lists = { disabled_blocks: ['slate', 'title'], enabled_blocks: [] };
    ['slate', 'description', 'image', 'title'].forEach((id) => {
      expect(blockToggleState(id, {}, lists)).toMatchObject({
        on: true,
        locked: true,
      });
    });
  });

  it('reads the own value from a wrapped block', () => {
    expect(
      blockToggleState(
        'hero',
        { restricted: () => false, [OWN_RESTRICTED]: true },
        none,
      ).defaultOn,
    ).toBe(false);
  });
});

describe('setBlockToggle', () => {
  it('stores only departures from the default', () => {
    let lists = setBlockToggle(none, 'teaser', false, true);
    expect(lists).toEqual({ disabled_blocks: ['teaser'], enabled_blocks: [] });
    lists = setBlockToggle(lists, 'teaser', true, true);
    expect(lists).toEqual(none);
    lists = setBlockToggle(lists, 'hero', true, false);
    expect(lists).toEqual({ disabled_blocks: [], enabled_blocks: ['hero'] });
    lists = setBlockToggle(lists, 'hero', false, false);
    expect(lists).toEqual(none);
  });

  it('leaves other entries alone, including unregistered blocks', () => {
    const lists = { disabled_blocks: ['gone'], enabled_blocks: ['old'] };
    expect(setBlockToggle(lists, 'teaser', false, true)).toEqual({
      disabled_blocks: ['gone', 'teaser'],
      enabled_blocks: ['old'],
    });
  });
});

describe('isRestricted', () => {
  const args = { properties: { hasTitle: true } };

  it('switches blocks off and back on', () => {
    expect(isRestricted('teaser', false, none, args)).toBe(false);
    expect(
      isRestricted(
        'teaser',
        false,
        { ...none, disabled_blocks: ['teaser'] },
        args,
      ),
    ).toBe(true);
    expect(isRestricted('hero', true, none, args)).toBe(true);
    expect(
      isRestricted('hero', true, { ...none, enabled_blocks: ['hero'] }, args),
    ).toBe(false);
  });

  it('keeps a contextual constraint while switched on', () => {
    expect(isRestricted('title', oncePerPage, none, args)).toBe(true);
    expect(
      isRestricted('title', oncePerPage, none, {
        properties: { hasTitle: false },
      }),
    ).toBe(false);
    expect(
      isRestricted('x', oncePerPage, { ...none, enabled_blocks: ['x'] }, args),
    ).toBe(true);
  });

  it('never switches off a locked block', () => {
    expect(
      isRestricted(
        'slate',
        false,
        { ...none, disabled_blocks: ['slate'] },
        args,
      ),
    ).toBe(false);
  });
});

describe('wrapBlocksRestricted', () => {
  it('wraps every block once and picks up blocks added later', () => {
    const blocksConfig = {
      teaser: { restricted: false },
      hero: { restricted: true },
    };
    let lists = none;
    wrapBlocksRestricted(blocksConfig, () => lists);
    const wrapper = blocksConfig.teaser.restricted;
    wrapBlocksRestricted(blocksConfig, () => lists);
    expect(blocksConfig.teaser.restricted).toBe(wrapper);
    expect(blocksConfig.hero[OWN_RESTRICTED]).toBe(true);

    lists = { disabled_blocks: ['teaser'], enabled_blocks: ['hero'] };
    expect(blocksConfig.teaser.restricted({})).toBe(true);
    expect(blocksConfig.hero.restricted({})).toBe(false);

    blocksConfig.late = {};
    wrapBlocksRestricted(blocksConfig, () => lists);
    expect(typeof blocksConfig.late.restricted).toBe('function');
    expect(blocksConfig.late.restricted({})).toBe(false);
  });
});

describe('groupBlocks', () => {
  it('groups like the chooser with the Juizi group first', () => {
    const groups = groupBlocks(
      {
        slate: { title: 'Text', group: 'text' },
        teaser: { title: 'Teaser', group: 'common' },
        juiziHero: { title: 'Hero', group: 'juizi' },
        contentRow: { title: 'Content Row', group: 'juizi' },
        custom: { title: 'Custom', group: 'extras' },
        ungrouped: { title: 'Ungrouped' },
      },
      [
        { id: 'mostUsed', title: 'Most used' },
        { id: 'juizi', title: 'Juizi' },
        { id: 'text', title: 'Text' },
        { id: 'common', title: 'Common' },
      ],
    );
    expect(groups.map((g) => g.title)).toEqual([
      'Juizi',
      'Text',
      'Common',
      'Extras',
      'Other',
    ]);
    expect(groups[0].blocks.map((b) => b.id)).toEqual([
      'contentRow',
      'juiziHero',
    ]);
  });
});
