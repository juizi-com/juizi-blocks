import makeBlockEdit from '../../BlockEdit/BlockEdit';
import View from './View';
import { redirectSchema } from './schema';

// Like the other Juizi blocks: the canvas is the View in edit mode (which
// never redirects), the options are in the sidebar.
export const Edit = makeBlockEdit(View);
export { View, redirectSchema };
