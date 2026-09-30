/**
 * Dashboard on/off switches for every registered block.
 *
 * A block's own `restricted` setting decides its default:
 * - `true`              off by default (e.g. VLT's legacy `hero`);
 * - a function          on, but only where the function allows it (e.g.
 *                       Title once per page) — that constraint is kept;
 * - `false`/missing     on.
 * The dashboard stores only departures from that default: `disabled_blocks`
 * (switched off) and `enabled_blocks` (switched on although off by default).
 * LOCKED_BLOCKS can't be switched off.
 */
import { LOCKED_BLOCKS } from './constants';

/** Where the wrapper keeps the block's own `restricted` value. */
export const OWN_RESTRICTED = '__juiziOwnRestricted';
const WRAPPER_FLAG = '__juiziToggle';

type Restricted = boolean | undefined | ((args: any) => boolean);

export type BlockLists = {
  disabled_blocks: string[];
  enabled_blocks: string[];
};

export const getOwnRestricted = (blockConfig: any): Restricted =>
  blockConfig && OWN_RESTRICTED in blockConfig
    ? blockConfig[OWN_RESTRICTED]
    : blockConfig?.restricted;

export function blockToggleState(
  blockType: string,
  blockConfig: any,
  lists: BlockLists,
) {
  const own = getOwnRestricted(blockConfig);
  const locked = LOCKED_BLOCKS.includes(blockType);
  const defaultOn = own !== true;
  const contextual = typeof own === 'function';
  let on = defaultOn;
  if (!locked) {
    if (lists.disabled_blocks?.includes(blockType)) on = false;
    else if (lists.enabled_blocks?.includes(blockType)) on = true;
  }
  return { locked, defaultOn, contextual, on: locked || on };
}

/** Records a switch change, storing only departures from the default and
 * leaving every other block's entry (including unregistered ones) alone. */
export function setBlockToggle(
  lists: BlockLists,
  blockType: string,
  on: boolean,
  defaultOn: boolean,
): BlockLists {
  const without = (list: string[] = []) =>
    list.filter((id) => id !== blockType);
  return {
    disabled_blocks:
      !on && defaultOn
        ? [...without(lists.disabled_blocks), blockType]
        : without(lists.disabled_blocks),
    enabled_blocks:
      on && !defaultOn
        ? [...without(lists.enabled_blocks), blockType]
        : without(lists.enabled_blocks),
  };
}

/** The `restricted` value Volto sees for a block. */
export function isRestricted(
  blockType: string,
  own: Restricted,
  lists: BlockLists,
  args: any,
) {
  const locked = LOCKED_BLOCKS.includes(blockType);
  if (!locked && lists.disabled_blocks?.includes(blockType)) return true;
  if (typeof own === 'function') return own(args);
  if (own === true && !locked && lists.enabled_blocks?.includes(blockType)) {
    return false;
  }
  return !!own;
}

/**
 * Wraps every block's `restricted` so the dashboard switches apply. Safe to
 * call repeatedly: blocks registered later (or whose `restricted` was
 * reassigned) are wrapped on the next call, already wrapped ones are left.
 */
export function wrapBlocksRestricted(
  blocksConfig: Record<string, any>,
  getLists: () => BlockLists,
) {
  Object.entries(blocksConfig || {}).forEach(([blockType, blockConfig]) => {
    if (!blockConfig || blockConfig.restricted?.[WRAPPER_FLAG]) return;
    const own = blockConfig.restricted;
    blockConfig[OWN_RESTRICTED] = own;
    const wrapper = (args: any) =>
      isRestricted(blockType, own, getLists(), args);
    (wrapper as any)[WRAPPER_FLAG] = true;
    blockConfig.restricted = wrapper;
  });
}

export type BlockGroup = {
  id: string;
  title: string;
  blocks: Array<{ id: string; title: string; config: any }>;
};

/** Registered blocks grouped like the block chooser, Juizi group first,
 * then Volto's group order, then any other groups. */
export function groupBlocks(
  blocksConfig: Record<string, any>,
  groupOrder: Array<{ id: string; title: string }> = [],
  firstGroup = 'juizi',
): BlockGroup[] {
  const order = groupOrder.filter((g) => g.id !== 'mostUsed');
  const groups = new Map<string, BlockGroup>();
  const ensure = (id: string) => {
    if (!groups.has(id)) {
      const known = order.find((g) => g.id === id);
      groups.set(id, {
        id,
        title: known?.title || id.charAt(0).toUpperCase() + id.slice(1),
        blocks: [],
      });
    }
    return groups.get(id)!;
  };
  Object.entries(blocksConfig || {}).forEach(([id, config]) => {
    if (!config) return;
    ensure(config.group || 'other').blocks.push({
      id,
      title: config.title || id,
      config,
    });
  });
  const rank = (id: string) => {
    if (id === firstGroup) return -1;
    const index = order.findIndex((g) => g.id === id);
    return index === -1 ? order.length : index;
  };
  return [...groups.values()]
    .sort((a, b) => rank(a.id) - rank(b.id) || a.title.localeCompare(b.title))
    .map((group) => ({
      ...group,
      blocks: group.blocks.sort((a, b) => a.title.localeCompare(b.title)),
    }));
}
