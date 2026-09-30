/**
 * Edit-mode placeholder shown by blocks that need a mode/variation chosen
 * (or have no content yet) before they can render anything.
 *
 * Props:
 *   blockClass — the block's root class, so block CSS can still scope it
 *   prompt     — the instruction to show
 *   modes      — optional [{ name, description }] listing the choices
 */
import React from 'react';
import './block-placeholder.css';

const BlockPlaceholder = ({ blockClass = '', prompt, modes = [] }) => (
  <div
    className={`block-placeholder ${blockClass} ${blockClass}--placeholder`.trim()}
  >
    <div className="block-placeholder__inner">
      {prompt && <p className="block-placeholder__prompt">{prompt}</p>}
      {modes.length > 0 && (
        <ul className="block-placeholder__modes">
          {modes.map((mode) => (
            <li key={mode.name}>
              <strong>{mode.name}</strong>
              {mode.description ? ` — ${mode.description}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default BlockPlaceholder;
