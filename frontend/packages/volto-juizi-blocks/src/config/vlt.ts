/**
 * Volto Light Theme support, without depending on it.
 *
 * juizi-blocks works on any Volto site. On a site that also switches on Volto
 * Light Theme, it adds the theme's hooks: the block theme picker (below), and
 * whatever else checks `hasVLT()`. Nothing here imports from Volto Light
 * Theme, so a site without it builds and runs as usual.
 */
import config from '@plone/volto/registry';
import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';
import { defineMessages } from 'react-intl';

export const VLT_PACKAGE = '@kitconcept/volto-light-theme';

/** Whether the site switches on Volto Light Theme (one of its add-ons). */
export function hasVLT(): boolean {
  const addons = (config.settings as any)?.addonsInfo;
  return (
    Array.isArray(addons) &&
    addons.some(
      (addon: any) =>
        addon?.name === VLT_PACKAGE && addon.isRegisteredAddon !== false,
    )
  );
}

const messages = defineMessages({
  backgroundColor: {
    id: 'juizi-theme-background-color',
    defaultMessage: 'Background color',
  },
});

/**
 * The block theme picker, stored as Volto Light Theme stores it (`theme`,
 * with its `color_picker` widget), so the theme's own code applies the chosen
 * theme. Leaves the schema alone on a site without Volto Light Theme.
 */
export const themeStylingSchema = ({ schema, formData, intl }: any) => {
  if (!hasVLT()) return schema;
  const blocks = config.blocks as any;
  const blockConfig = blocks?.blocksConfig?.[formData?.['@type']];
  const themes = blockConfig?.themes || blocks?.themes;
  // The default is the first theme in the list.
  const defaultTheme = blockConfig?.defaultTheme || blocks?.themes?.[0]?.name;

  addStyling({ schema, intl });
  const styling = schema.fieldsets.find((item: any) => item.id === 'styling');
  styling.fields = [...styling.fields, 'theme'];
  schema.properties.theme = {
    widget: 'color_picker',
    title: intl.formatMessage(messages.backgroundColor),
    themes,
    default: defaultTheme,
  };
  return schema;
};
