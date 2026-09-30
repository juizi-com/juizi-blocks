import React from 'react';
import { render } from '@testing-library/react';
import { EmblaCarouselEdit } from './index';

// Keep the test on the view/edit wiring, not the sidebar or carousel.
jest.mock(
  '@plone/volto/components/manage/Sidebar/SidebarPortal',
  () =>
    ({ children }) =>
      children,
);
// Records the form's props, so a test can make a change the way the
// sidebar does.
const mockForm = { props: null };
jest.mock('@plone/volto/components/manage/Form', () => ({
  BlockDataForm: (props) => {
    mockForm.props = props;
    return null;
  },
}));
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({ formatMessage: (message) => message.defaultMessage }),
}));
jest.mock('./View', () => (props) => (
  <div
    data-edit-mode={props.isEditMode === true}
    data-has-onchange={typeof props.onChangeBlock === 'function'}
  />
));

describe('EmblaCarousel Edit', () => {
  it('lets the view know it is in the editor, so it shows the placeholder', () => {
    const { container } = render(
      <EmblaCarouselEdit
        data={{ '@type': 'emblaCarousel' }}
        block="abc"
        blocksConfig={{
          emblaCarousel: {
            juiziSchema: () => ({ title: 'Carousel', fieldsets: [] }),
          },
        }}
        onChangeBlock={() => {}}
        selected
      />,
    );
    const view = container.querySelector('[data-edit-mode]');
    expect(view.getAttribute('data-edit-mode')).toBe('true');
    expect(view.getAttribute('data-has-onchange')).toBe('true');
  });

  const firstChoice = (displayMode) => {
    const onChangeBlock = jest.fn();
    render(
      <EmblaCarouselEdit
        data={{ '@type': 'emblaCarousel' }}
        block="abc"
        blocksConfig={{
          emblaCarousel: {
            juiziSchema: () => ({ title: 'Carousel', fieldsets: [] }),
          },
        }}
        onChangeBlock={onChangeBlock}
        selected
      />,
    );
    mockForm.props.onChangeField('displayMode', displayMode);
    return onChangeBlock.mock.calls[0][1];
  };

  it('starts Reviews with the arrows below, clear of the text', () => {
    expect(firstChoice('reviews')).toMatchObject({
      displayMode: 'reviews',
      arrowPosition: 'below',
    });
  });

  it('starts the picture styles with the arrows on the sides, as before', () => {
    expect(firstChoice('image-top')).toMatchObject({
      displayMode: 'image-top',
      arrowPosition: 'bottom',
    });
  });
});
