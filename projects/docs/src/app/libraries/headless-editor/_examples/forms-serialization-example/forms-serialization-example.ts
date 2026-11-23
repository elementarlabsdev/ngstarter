import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required, validate } from '@angular/forms/signals';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import {
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorText,
  NgsHeadlessEditorDocument
} from '@ngstarter-ui/components/headless-editor';
import { Input } from '@ngstarter-ui/components/input';
import { toHtml, toPlainText } from './html-serializer';
import { RichTextField } from './rich-text-field/rich-text-field';
import { richTextRequired } from './rich-text-required';

/** A document as it could come back from an API: plain, versioned JSON. */
const SAVED_DOCUMENT: NgsHeadlessEditorDocument = {
  version: 1,
  blocks: [
    {
      id: createNgsHeadlessEditorId('paragraph'),
      type: 'paragraph',
      content: [
        createNgsHeadlessEditorText('Store the '),
        createNgsHeadlessEditorText('JSON document', [{ type: 'bold' }]),
        createNgsHeadlessEditorText(', derive HTML only where you need it.')
      ]
    }
  ]
};

@Component({
  selector: 'app-forms-serialization-example',
  imports: [JsonPipe, SignalFormField, Button, FormField, Label, Input, RichTextField],
  templateUrl: './forms-serialization-example.html',
  styleUrl: './forms-serialization-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsSerializationExample {
  private readonly bodyDisabled = signal(false);
  readonly model = signal<{ title: string; body: NgsHeadlessEditorDocument | null }>({
    title: 'Release announcement',
    body: null
  });
  readonly form = form(this.model, path => {
    required(path.title);
    validate(path.body, ({ value }) => richTextRequired(value()));
    disabled(path.body, () => this.bodyDisabled());
  });
  private readonly body = this.form.body().value;
  readonly html = computed(() => {
    const body = this.body();
    return body ? toHtml(body) : '';
  });
  readonly text = computed(() => {
    const body = this.body();
    return body ? toPlainText(body) : '';
  });
  readonly valid = this.form().valid;

  loadSaved(): void {
    this.form.body().value.set(SAVED_DOCUMENT);
  }

  toggleDisabled(): void {
    this.bodyDisabled.update(disabled => !disabled);
  }
}
