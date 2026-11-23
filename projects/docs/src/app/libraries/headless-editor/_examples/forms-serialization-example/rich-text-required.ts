import { requiredError, ValidationError } from '@angular/forms/signals';
import { isNgsHeadlessEditorDocumentEmpty, NgsHeadlessEditorDocument } from '@ngstarter-ui/components/headless-editor';

export function richTextRequired(value: NgsHeadlessEditorDocument | null): ValidationError | null {
  return !value || isNgsHeadlessEditorDocumentEmpty(value) ? requiredError() : null;
}
