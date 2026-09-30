import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isNgsHeadlessEditorDocumentEmpty, NgsHeadlessEditorDocument } from '@ngstarter-ui/components/headless-editor';

/** Validator for editor documents: whitespace-only content counts as empty. */
export function richTextRequired(
  control: AbstractControl<NgsHeadlessEditorDocument | null>
): ValidationErrors | null {
  const value = control.value;
  return !value || isNgsHeadlessEditorDocumentEmpty(value) ? { required: true } : null;
}
