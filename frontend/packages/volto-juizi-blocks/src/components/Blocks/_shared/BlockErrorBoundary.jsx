/**
 * Error boundary for a block's view. When the block throws while
 * rendering:
 * - editors see a plain-language message in the block's place;
 * - visitors see nothing;
 * - the error is logged to the browser console for developers.
 *
 * Pass `resetKey` (e.g. a serialisation of the block data) so the next
 * change the editor makes gets a fresh try without reloading the page.
 */
import React from 'react';
import { injectIntl } from 'react-intl';
import BlockPlaceholder from './BlockPlaceholder';
import messages from './messages';

class BlockErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(
      `Juizi block "${this.props.blockClass || 'block'}" failed to render`,
      error,
      info,
    );
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.isEditMode ? (
        <BlockPlaceholder
          blockClass={this.props.blockClass}
          prompt={this.props.intl.formatMessage(messages.blockError)}
        />
      ) : null;
    }
    return this.props.children;
  }
}

export default injectIntl(BlockErrorBoundary);
