/**
 * Juizi additions to volto-form-block's Form block (`form`): text beside the
 * form and a background. volto-form-block has no extension hook, so this
 * wraps its view, edit and sidebar schema in the block config instead of
 * shadowing its files (collective.formsupport add-ons shadow those, and
 * only one shadow of a file wins). See README.md.
 *
 * volto-juizi-blocks must come after volto-form-block, and after any add-on
 * that replaces the form's `formSchema`, in the site's add-on list. On a
 * site without the form block this does nothing.
 */
import { useIntl } from 'react-intl';
import sideTextSchema from './schema';
import withSideText from './withSideText';
import './form.css';
import './style.css';

export default function installFormBlockExtension(config) {
  const form = config.blocks?.blocksConfig?.form;
  if (!form || form.view?.juiziSideText) return config;

  const baseSchema = form.formSchema;
  // Called by the form's sidebar while it renders, with the block's data
  // (the base schema uses react-intl's hook the same way).
  const SideTextFormSchema = (data = {}) => {
    const intl = useIntl();
    return sideTextSchema({ schema: baseSchema(data), formData: data, intl });
  };
  form.formSchema = SideTextFormSchema;
  form.view = withSideText(form.view);
  form.edit = withSideText(form.edit);
  return config;
}
