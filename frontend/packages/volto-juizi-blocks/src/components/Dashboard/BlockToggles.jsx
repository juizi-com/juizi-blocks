import React from 'react';
import { useIntl } from 'react-intl';
import { Lock } from 'lucide-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import {
  blockToggleState,
  setBlockGroups,
  setBlockToggle,
} from '../../settings';
import messages from './messages';

/**
 * Who may add a switched-on block: a collapsed summary ("Everybody" or the
 * chosen groups) that opens to a checkbox per site group. Stored groups that
 * no longer exist stay listed so they can be unticked.
 */
const GroupPicker = ({ blockTitle, selected, userGroups, onChange }) => {
  const intl = useIntl();
  const known = userGroups.map((group) => group.id);
  const options = [
    ...userGroups,
    ...selected
      .filter((id) => !known.includes(id))
      .map((id) => ({ id, title: id })),
  ];
  const titleOf = (id) => options.find((group) => group.id === id)?.title || id;
  const toggle = (id, checked) =>
    onChange(
      checked
        ? [...selected, id]
        : selected.filter((selectedId) => selectedId !== id),
    );

  return (
    <details className="juizi-dashboard__groups">
      <summary>
        {intl.formatMessage(messages.groupsSummary, {
          groups: selected.length
            ? selected.map(titleOf).join(', ')
            : intl.formatMessage(messages.everybody),
        })}
      </summary>
      <fieldset>
        <legend className="juizi-dashboard__muted">
          {intl.formatMessage(messages.groupsHelp, { title: blockTitle })}
        </legend>
        {options.length === 0 && (
          <div className="juizi-dashboard__muted">
            {intl.formatMessage(messages.noGroups)}
          </div>
        )}
        {options.map((group) => (
          <label key={group.id} className="juizi-dashboard__group-option">
            <input
              type="checkbox"
              checked={selected.includes(group.id)}
              onChange={(e) => toggle(group.id, e.target.checked)}
            />{' '}
            {group.title || group.id}
          </label>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
            onClick={() => onChange([])}
          >
            {intl.formatMessage(messages.allowEverybody)}
          </button>
        )}
      </fieldset>
    </details>
  );
};

/**
 * On/off switches for every registered block, one table per chooser group.
 * `lists` is { disabled_blocks, enabled_blocks, block_groups }; `userGroups`
 * are the site's user groups ({ id, title }).
 */
const BlockToggles = ({ groups, lists, userGroups = [], onChange }) => {
  const intl = useIntl();
  // Volto's block chooser looks titles up as message ids; so do we, for
  // titles, descriptions and group names.
  const translate = (text) =>
    text ? intl.formatMessage({ id: text, defaultMessage: text }) : text;
  const registered = groups.flatMap((group) => group.blocks);

  // Only clear entries for blocks that are registered now: entries for
  // blocks missing from this build are kept for when they come back.
  const reset = () => {
    const ids = registered.map((block) => block.id);
    onChange({
      disabled_blocks: lists.disabled_blocks.filter((id) => !ids.includes(id)),
      enabled_blocks: lists.enabled_blocks.filter((id) => !ids.includes(id)),
      block_groups: Object.fromEntries(
        Object.entries(lists.block_groups || {}).filter(
          ([id]) => !ids.includes(id),
        ),
      ),
    });
  };
  const hasChanges = registered.some(
    ({ id }) =>
      [...lists.disabled_blocks, ...lists.enabled_blocks].includes(id) ||
      lists.block_groups?.[id]?.length,
  );

  return (
    <div className="juizi-dashboard__toggles">
      {groups.map((group) => {
        const states = group.blocks.map((block) => ({
          block,
          state: blockToggleState(block.id, block.config, lists),
        }));
        const on = states.filter(({ state }) => state.on).length;
        return (
          <section key={group.id} className="juizi-dashboard__group">
            <h3>
              {translate(group.title)}{' '}
              <span className="juizi-dashboard__muted">
                {intl.formatMessage(messages.groupCount, {
                  on,
                  total: states.length,
                })}
              </span>
            </h3>
            <table className="juizi-dashboard__table">
              <tbody>
                {states.map(({ block, state }) => {
                  const stateLabel = intl.formatMessage(
                    state.on ? messages.enabled : messages.disabled,
                  );
                  const title = translate(block.title);
                  return (
                    // The row is only dimmed, never disabled: the toggle has
                    // to stay usable to switch the block back on.
                    <tr
                      key={block.id}
                      className={
                        state.on ? undefined : 'juizi-dashboard__row--off'
                      }
                    >
                      <td className="juizi-dashboard__cell--fit">
                        {block.config.icon ? (
                          <Icon name={block.config.icon} size="24px" />
                        ) : null}
                      </td>
                      <td>
                        <strong>{title}</strong>{' '}
                        <code className="juizi-dashboard__muted">
                          {block.id}
                        </code>
                        {block.config.description && (
                          <div className="juizi-dashboard__muted">
                            {translate(block.config.description)}
                          </div>
                        )}
                        {state.contextual && (
                          <div className="juizi-dashboard__hint">
                            {intl.formatMessage(messages.contextual)}
                          </div>
                        )}
                        {!state.defaultOn && (
                          <div className="juizi-dashboard__hint">
                            {intl.formatMessage(messages.offByDefault)}
                          </div>
                        )}
                        {state.on && !state.locked && (
                          <GroupPicker
                            blockTitle={title}
                            selected={lists.block_groups?.[block.id] || []}
                            userGroups={userGroups}
                            onChange={(selected) =>
                              onChange(
                                setBlockGroups(lists, block.id, selected),
                              )
                            }
                          />
                        )}
                      </td>
                      <td className="juizi-dashboard__cell--fit">
                        {state.locked ? (
                          <span className="juizi-dashboard__badge juizi-dashboard__badge--off">
                            <Lock size={11} aria-hidden />{' '}
                            {intl.formatMessage(messages.locked)}
                          </span>
                        ) : (
                          <label className="juizi-dashboard__toggle">
                            <input
                              type="checkbox"
                              checked={state.on}
                              aria-label={`${title}: ${stateLabel}`}
                              onChange={(e) =>
                                onChange(
                                  setBlockToggle(
                                    lists,
                                    block.id,
                                    e.target.checked,
                                    state.defaultOn,
                                  ),
                                )
                              }
                            />
                            <span
                              className={
                                state.on
                                  ? 'juizi-dashboard__badge juizi-dashboard__badge--on'
                                  : 'juizi-dashboard__badge juizi-dashboard__badge--off'
                              }
                            >
                              {stateLabel}
                            </span>
                          </label>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
      {hasChanges && (
        <div className="juizi-dashboard__actions">
          <button
            type="button"
            className="juizi-dashboard__btn juizi-dashboard__btn--secondary"
            onClick={reset}
          >
            {intl.formatMessage(messages.resetBlocks)}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockToggles;
