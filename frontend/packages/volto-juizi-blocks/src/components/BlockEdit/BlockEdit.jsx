/**
 * Generic edit component for Juizi blocks: renders the block's view in the
 * editor (so edit mode looks like the published page) and its schema in the
 * sidebar. Blocks with a non-visual canvas (Redirect) provide their own
 * `edit` component instead.
 *
 * The schema comes from the block's `juiziSchema` in blocks/index.ts, not
 * Volto's `blockSchema`: Volto merges `blockSchema` defaults into every
 * saved block when it renders, which would change how older content looks.
 * `juiziSchema` is called as `({ intl, props, data, formData })`.
 */
import React from 'react';
import { useIntl } from 'react-intl';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import { BlockDataForm } from '@plone/volto/components/manage/Form';

/**
 * Volto's select widget finds a stored value's label with
 * `Object.keys(choiceMap).includes(value)`: object keys are strings, so a
 * number (8000, or a default like `default: 48`) is never found and the
 * sidebar shows the bare number instead of its label ("8000" for
 * "8 seconds"). For fields with choices, give the form numbers as strings.
 * Only what the sidebar shows: nothing is saved until the editor changes a
 * field, and views read these values with parseInt, so either form works.
 */
const withStringChoiceValues = (schema, data) => {
  const properties = { ...schema.properties };
  const formData = { ...data };
  Object.entries(properties).forEach(([id, field]) => {
    if (!field?.choices) return;
    if (typeof field.default === 'number') {
      properties[id] = { ...field, default: String(field.default) };
    }
    if (typeof formData[id] === 'number') formData[id] = String(formData[id]);
  });
  return [{ ...schema, properties }, formData];
};

/**
 * @param View  the block's view component. It receives all the edit props
 *   plus `isEditMode`.
 * @param options.getChangedData  (id, value, data) => new data, for one
 *   field change: seed defaults on the first choice of a mode, keep related
 *   fields consistent, etc.
 * @param options.normalizeData  (data) => data, applied to every change
 *   (field changes and whole-block changes from the form).
 * @param options.getFormData  (data) => the data the form edits (e.g. give
 *   list items the ids the list widget needs). Not saved on its own.
 * @param options.formKey  (data) => a key for the form. The form remounts
 *   when it changes; use it only when a choice rebuilds the whole sidebar.
 */
const makeBlockEdit = (
  View,
  { getChangedData, normalizeData, getFormData, formKey } = {},
) => {
  const BlockEdit = (props) => {
    const {
      block,
      blocksConfig,
      contentType,
      data,
      navRoot,
      onChangeBlock,
      selected,
    } = props;
    const intl = useIntl();
    const blockFormData = getFormData ? getFormData(data) : data;
    const [schema, formData] = withStringChoiceValues(
      blocksConfig[data['@type']].juiziSchema({
        intl,
        props,
        data: blockFormData,
        formData: blockFormData,
      }),
      blockFormData,
    );
    const normalize = (next) => (normalizeData ? normalizeData(next) : next);

    return (
      <>
        <View {...props} isEditMode />
        <SidebarPortal selected={selected}>
          <BlockDataForm
            {...(formKey ? { key: formKey(data) } : {})}
            schema={schema}
            title={schema.title}
            onChangeField={(id, value) =>
              onChangeBlock(
                block,
                normalize(
                  getChangedData
                    ? getChangedData(id, value, data)
                    : { ...data, [id]: value },
                ),
              )
            }
            onChangeBlock={(id, newData) =>
              onChangeBlock(id, normalize(newData))
            }
            formData={formData}
            block={block}
            blocksConfig={blocksConfig}
            navRoot={navRoot}
            contentType={contentType}
          />
        </SidebarPortal>
      </>
    );
  };
  BlockEdit.displayName = `BlockEdit(${View.displayName || View.name})`;
  return BlockEdit;
};

/** Reads the block data from either call shape a schema function gets:
 * `({ props })` from makeBlockEdit or `({ data | formData })`. */
export const schemaData = (args = {}) =>
  args.formData || args.data || args.props?.data || {};

export default makeBlockEdit;
