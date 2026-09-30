import type { ConfigType } from '@plone/registry';
import { composeSchema } from '@plone/volto/helpers/Extensions';
import { defaultStylingSchema } from './vlt';
import { juiziBlocks } from '../blocks';
import { registerThemedBlocks } from '../settings/runtime';

/** First-Time Editor Test: no Styling tab until the first choice is made. */
const hideStylingUntilConfigured =
  (isConfigured: (data: any) => boolean) =>
  ({ schema, formData }: any) =>
    isConfigured(formData)
      ? schema
      : {
          ...schema,
          fieldsets: schema.fieldsets.filter(
            (fieldset: any) => fieldset.id !== 'styling',
          ),
        };

/** Block chooser group holding every Juizi block. */
export const JUIZI_GROUP = 'juizi';

export default function install(config: ConfigType) {
  const blocksConfig = config.blocks.blocksConfig as Record<string, any>;

  // Placed right after "Most used" so the Juizi blocks come first.
  const groups = config.blocks.groupBlocksOrder || [];
  if (!groups.some((group) => group.id === JUIZI_GROUP)) {
    const mostUsed = groups.findIndex((group) => group.id === 'mostUsed');
    groups.splice(mostUsed + 1, 0, { id: JUIZI_GROUP, title: 'Juizi' });
    config.blocks.groupBlocksOrder = groups;
  }

  juiziBlocks.forEach((definition) => {
    const { schemaEnhancer, usesColors, usesThemes, isConfigured, ...block } =
      definition;
    // The block's own enhancer runs last so it has the final say.
    const enhancers = [
      usesThemes ? defaultStylingSchema : undefined,
      schemaEnhancer,
      isConfigured ? hideStylingUntilConfigured(isConfigured) : undefined,
    ].filter(Boolean);
    blocksConfig[block.id] = {
      security: { addPermission: [], view: [] },
      group: JUIZI_GROUP,
      // Juizi blocks live in their own group, not in "Most used" (a fixed
      // list in Volto, not based on what editors actually use).
      mostUsed: false,
      ...block,
      schemaEnhancer: enhancers.length
        ? composeSchema(...enhancers)
        : undefined,
    };
  });

  registerThemedBlocks(
    juiziBlocks.filter((block) => block.usesThemes).map((block) => block.id),
  );

  return config;
}
