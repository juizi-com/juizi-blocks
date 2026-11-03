import React from 'react';
import { renderWithIntl } from '../../components/Blocks/_shared/testUtils';
import installFormBlockExtension from './index';
import sideTextSchema from './schema';
import withSideText from './withSideText';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));

const baseSchema = () => ({
  fieldsets: [
    { id: 'default', fields: ['title', 'description', 'default_to'] },
    { id: 'manage_data', fields: ['store'] },
  ],
  properties: { title: {} },
});

const FormView = ({ data }) => <p className="the-form">{data.title}</p>;
const SideTextView = withSideText(FormView);
const fieldsetIds = (schema) => schema.fieldsets.map((f) => f.id);

describe('form block extension', () => {
  it('does nothing on a site without the form block', () => {
    const config = { blocks: { blocksConfig: {} } };
    expect(installFormBlockExtension(config)).toBe(config);
  });

  it("wraps the form's view, edit and schema, once", () => {
    const view = () => null;
    const edit = () => null;
    const formSchema = jest.fn();
    const config = {
      blocks: { blocksConfig: { form: { view, edit, formSchema } } },
    };
    installFormBlockExtension(config);
    const { form } = config.blocks.blocksConfig;
    expect(form.view).not.toBe(view);
    expect(form.edit).not.toBe(edit);
    expect(form.formSchema).not.toBe(formSchema);
    const wrappedView = form.view;
    installFormBlockExtension(config);
    expect(form.view).toBe(wrappedView);
  });

  it('adds Layout under the description, and Background', () => {
    const schema = sideTextSchema({ schema: baseSchema() });
    expect(schema.fieldsets[0].fields).toEqual([
      'title',
      'description',
      'layout',
      'default_to',
    ]);
    expect(fieldsetIds(schema)).toEqual([
      'default',
      'juizi_appearance',
      'juizi_background',
      'manage_data',
    ]);
    expect(schema.properties.title).toEqual({});
  });

  it('adds the text panel and form position once text is chosen', () => {
    const schema = sideTextSchema({
      schema: baseSchema(),
      formData: { layout: 'text' },
    });
    expect(schema.fieldsets[0].fields).toContain('form_position');
    expect(schema.fieldsets[0].fields).toContain('side_align');
    expect(fieldsetIds(schema)).toEqual([
      'default',
      'side_text',
      'juizi_appearance',
      'juizi_background',
      'manage_data',
    ]);
    expect(schema.fieldsets[1].fields).toEqual([
      'side_kicker',
      'isPrimaryHeading',
      'side_heading',
      'side_intro',
      'side_more',
    ]);
  });

  it('leaves a saved form exactly as it was', () => {
    const { container } = renderWithIntl(
      <SideTextView data={{ title: 'Contact' }} />,
    );
    expect(container.innerHTML).toBe('<p class="the-form">Contact</p>');
  });

  it('shows the text beside the form, left or right', () => {
    const { container } = renderWithIntl(
      <SideTextView
        data={{
          title: 'Contact',
          layout: 'text',
          form_position: 'left',
          side_kicker: 'Get in touch',
          side_heading: 'Talk to us',
          side_more: { data: '<p>Open weekdays</p>' },
        }}
      />,
    );
    const wrapper = container.querySelector('.juizi-form-wrapper');
    expect(wrapper).toHaveClass(
      'juizi-form-wrapper--with-text',
      'juizi-form-wrapper--form-left',
      // Unset alignment: centred, as before the option
      'juizi-form-wrapper--text-center',
    );
    expect(container.querySelector('.juizi-form-frame')).not.toHaveClass(
      'juizi-form-frame--has-bg',
    );
    expect(container.querySelector('h2')).toHaveTextContent('Talk to us');
    expect(container.querySelector('.juizi-preheader')).toHaveTextContent(
      'Get in touch',
    );
    expect(container.querySelector('.juizi-form-side__more')).toHaveTextContent(
      'Open weekdays',
    );
    expect(container.querySelector('.the-form')).toBeInTheDocument();
  });

  it.each([
    ['top', 'top'],
    ['sticky', 'sticky'],
    ['bottom', 'bottom'],
    ['middle', 'center'],
  ])('aligns the text: %s', (side_align, expected) => {
    const { container } = renderWithIntl(
      <SideTextView
        data={{ layout: 'text', side_heading: 'Talk to us', side_align }}
      />,
    );
    expect(container.querySelector('.juizi-form-wrapper')).toHaveClass(
      `juizi-form-wrapper--text-${expected}`,
    );
  });

  it('gives visitors no empty text column', () => {
    const { container } = renderWithIntl(
      <SideTextView
        data={{ layout: 'text', side_more: { data: '<p></p>' } }}
      />,
    );
    expect(container.querySelector('.juizi-form-side')).toBeNull();
  });

  it('asks the editor for the text', () => {
    const { container } = renderWithIntl(
      <SideTextView data={{ layout: 'text' }} onChangeBlock={() => {}} />,
    );
    expect(container.querySelector('.block__edit-hint')).toHaveTextContent(
      'Text beside the form',
    );
  });

  it('makes the heading the page heading, and warns about a second one', () => {
    const data = {
      layout: 'text',
      side_heading: 'Contact us',
      isPrimaryHeading: true,
    };
    const { container } = renderWithIntl(
      <SideTextView
        data={data}
        block="a"
        onChangeBlock={() => {}}
        properties={{ blocks: { a: data, b: { isPrimaryHeading: true } } }}
      />,
    );
    expect(container.querySelector('h1')).toHaveClass(
      'juizi-form-side__heading--primary',
    );
    expect(
      container.querySelector('.block__edit-hint--warning'),
    ).toBeInTheDocument();
  });

  it('draws a background around a form without text', () => {
    const { container } = renderWithIntl(
      <SideTextView data={{ title: 'Contact', backgroundColor: '#023e8a' }} />,
    );
    expect(container.firstChild).toHaveClass(
      'juizi-form-frame',
      'juizi-form-frame--has-bg',
      'tone-light',
    );
    expect(container.querySelector('.juizi-form-side')).toBeNull();
  });

  it('puts the padding with the background', () => {
    const schema = sideTextSchema({ schema: baseSchema() });
    const background = schema.fieldsets.find(
      (f) => f.id === 'juizi_background',
    );
    expect(background.fields.slice(-2)).toEqual([
      'paddingTop',
      'paddingBottom',
    ]);
  });

  it('styles the buttons and pads a form without text', () => {
    const { container } = renderWithIntl(
      <SideTextView
        data={{
          title: 'Contact',
          submitButtonStyle: 'outline__c8102e',
          paddingTop: 'spacious',
        }}
      />,
    );
    const frame = container.querySelector('.juizi-form-frame');
    expect(frame.style.getPropertyValue('--juizi-form-submit-border')).toBe(
      '#c8102e',
    );
    expect(frame.style.getPropertyValue('--juizi-form-submit-background')).toBe(
      'transparent',
    );
    expect(container.querySelector('.juizi-form-wrapper')).toHaveClass(
      'juizi-form-wrapper--submit-styled',
      'juizi-form-wrapper--pad-top-spacious',
      'juizi-form-wrapper--auto-pad-bottom',
    );
    expect(container.querySelector('.juizi-form-side')).toBeNull();
  });

  it('places and colours the help text, and warns about a light colour', () => {
    const { container } = renderWithIntl(
      <SideTextView
        data={{
          title: 'Contact',
          helpTextPosition: 'label',
          helpTextColor: '#ffffff',
        }}
        onChangeBlock={() => {}}
      />,
    );
    expect(container.querySelector('.juizi-form-wrapper')).toHaveClass(
      'juizi-form-wrapper--help-label',
    );
    expect(
      container
        .querySelector('.juizi-form-frame')
        .style.getPropertyValue('--juizi-form-help-color'),
    ).toBe('#ffffff');
    expect(
      container.querySelector('.block__edit-hint--warning'),
    ).toHaveTextContent('hard to read');
  });
});
