import React from 'react';
import { render } from '@testing-library/react';
import { EmblaCarouselEdit } from './index';

// Keep the test on the view/edit wiring, not the sidebar or carousel.
jest.mock(
  '@plone/volto/components/manage/Sidebar/SidebarPortal',
  () => () => null,
);
jest.mock('@plone/volto/components/manage/Form', () => ({
  BlockDataForm: () => null,
}));
jest.mock('react-intl', () => ({ useIntl: () => ({}) }));
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
});
