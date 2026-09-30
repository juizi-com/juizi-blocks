import React from 'react';
import { useIntl } from 'react-intl';
import { Lock } from 'lucide-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { blockToggleState, setBlockToggle } from '../../settings';
import messages from './messages';

/**
 * On/off switches for every registered block, one table per chooser group.
 * `lists` is { disabled_blocks, enabled_blocks }.
 */
const BlockToggles = ({ groups, lists, onChange }) => {
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
    });
  };
  const hasChanges = registered.some(({ id }) =>
    [...lists.disabled_blocks, ...lists.enabled_blocks].includes(id),
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
