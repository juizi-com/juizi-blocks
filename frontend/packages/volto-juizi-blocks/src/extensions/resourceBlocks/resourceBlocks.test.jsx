import React from 'react';
import { render } from '@testing-library/react';
import installResourceBlocksExtension from './index';
import Frames, { actionsVars, factsVars, typeVars } from './Frame';
import { RESOURCE_BLOCK_IDS, makeSchemaEnhancer } from './schema';
import { isInstalled } from '../../settings/runtime';
import { getBlockColorList } from '../../config/colors';

jest.mock('@plone/volto/registry', () => ({ settings: {} }));
jest.mock('../../settings/runtime', () => ({
  ...jest.requireActual('../../settings/runtime'),
  isInstalled: jest.fn(() => true),
}));

const baseSchema = () => ({
  fieldsets: [{ id: 'default', fields: [] }],
  properties: {},
});
const panels = (id, formData) =>
  makeSchemaEnhancer(id)({ schema: baseSchema(), formData }).fieldsets.map(
    (fieldset) => fieldset.id,
  );

describe('resource blocks extension', () => {
  const install = () => {
    const config = { registerUtility: jest.fn(), blocks: { blocksConfig: {} } };
    installResourceBlocksExtension(config);
    return config;
  };

  it('registers a utility for each block, with no chooser group', () => {
    const calls = install().registerUtility.mock.calls.map(([call]) => call);
    expect(calls.map(({ name }) => name)).toEqual(RESOURCE_BLOCK_IDS);
    calls.forEach(({ type, method }) => {
      expect(type).toBe('blockExtension');
      expect(Object.keys(method())).toEqual(['schemaEnhancer', 'Frame']);
    });
  });

  it('offers nothing until juizi.blocks is installed on the site', () => {
    isInstalled.mockReturnValueOnce(false);
    const [[{ method }]] = install().registerUtility.mock.calls;
    expect(method()).toEqual({});
  });

  it("leaves a block's group alone", () => {
    const resourceFacts = { id: 'resourceFacts', group: 'resource' };
    const config = {
      registerUtility: jest.fn(),
      blocks: { blocksConfig: { resourceFacts } },
    };
    installResourceBlocksExtension(config);
    expect(resourceFacts.group).toBe('resource');
  });

  it('gives each block its panels, before Background & spacing', () => {
    expect(panels('resourceType')).toEqual([
      'default',
      'juizi_resource_label',
      'juizi_background',
    ]);
    expect(panels('resourceFacts')).toEqual([
      'default',
      'juizi_resource_layout',
      'juizi_background',
    ]);
    expect(panels('resourceActions')).toEqual([
      'default',
      'juizi_resource_buttons',
      'juizi_background',
    ]);
    expect(panels('resourceAbstract')).toEqual(['default', 'juizi_background']);
    expect(panels('resourceKeyFindings')).toEqual([
      'default',
      'juizi_background',
    ]);
  });

  it('puts the alignment with the block, and colours in their own panel', () => {
    const { fieldsets } = makeSchemaEnhancer('resourceActions')({
      schema: baseSchema(),
    });
    expect(fieldsets[0].fields).toEqual(['alignment']);
    expect(fieldsets[1].fields).toEqual([
      'mainButtonStyle',
      'secondButtonStyle',
    ]);
  });

  it('asks about the text only while there is a background image', () => {
    const fields = (formData) =>
      makeSchemaEnhancer('resourceAbstract')({
        schema: baseSchema(),
        formData,
      }).fieldsets[1].fields;
    expect(fields({})).not.toContain('imageText');
    expect(fields({ backgroundImage: [{ '@id': '/a' }] })).toContain(
      'imageText',
    );
  });

  it("keeps the block's own fields", () => {
    const schema = {
      fieldsets: [{ id: 'default', fields: ['show_title'] }],
      properties: { show_title: {} },
    };
    const result = makeSchemaEnhancer('resourceAbstract')({ schema });
    expect(result.fieldsets[0].fields).toEqual(['show_title']);
    expect(result.properties.show_title).toBeDefined();
  });

  it('sets a tag only when a label colour is chosen', () => {
    expect(typeVars({})).toEqual({});
    expect(typeVars({ labelColor: 'var(--green)' })).toMatchObject({
      '--resource-tag-background': 'var(--green)',
    });
    expect(typeVars({ alignment: 'center' })).toEqual({ textAlign: 'center' });
  });

  it('moves the facts headings above only when asked', () => {
    expect(factsVars({})).toEqual({});
    expect(factsVars({ factsLabels: 'beside' })).toEqual({});
    expect(factsVars({ factsLabels: 'above' })).toMatchObject({
      '--resource-facts-columns': '1fr',
    });
  });

  it("uses the site's button unless one is chosen", () => {
    const [first] = getBlockColorList('resourceActions');
    expect(first).toBeDefined();
    expect(actionsVars({})['--resource-main-border']).toBeDefined();
    const vars = actionsVars({ mainButtonStyle: 'outline__green' });
    expect(vars['--resource-main-background']).toBe('transparent');
  });

  it('frames the content in every block, styled or not', () => {
    const { container } = render(
      <Frames.resourceAbstract data={{}}>
        <div className="resource-block-inner" />
      </Frames.resourceAbstract>,
    );
    expect(
      container.querySelector('.juizi-resource-frame > .resource-block-inner'),
    ).not.toBeNull();
  });

  it('sets the text over a background image, light by default', () => {
    const text = (data) =>
      render(
        <Frames.resourceAbstract data={data}>
          <div />
        </Frames.resourceAbstract>,
      )
        .container.querySelector('.juizi-resource-frame')
        .style.getPropertyValue('--resource-text');
    const image = { backgroundImage: [{ '@id': '/a', url: '/a' }] };
    expect(text({})).toBe('');
    expect(text(image)).toBe('#fff');
    expect(text({ ...image, imageText: 'dark' })).toBe('#111');
  });
});
