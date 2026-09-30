/**
 * The block's outer container, from @kitconcept/volto-bm3-compat.
 *
 * Under block model 2 (today) it renders `<div class="block {@type}
 * {className}">` around the block; under block model 3 it renders nothing
 * and VLT draws the containers. Every Juizi block view is wrapped in it, so
 * switching the site to block model 3 later needs no block changes. Put the
 * block's modifiers (type-*, align-*, tone-*) in `className`.
 *
 * Imported from here so there's one place to change if the package moves.
 */
export { BlockWrapper as default } from '@kitconcept/volto-bm3-compat';
