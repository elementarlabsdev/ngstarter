import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [JsonPipe, ReactiveFormsModule, Button, FormField, Label, Input, RichTextField],
  templateUrl: './forms-serialization-example.html',
  styleUrl: './forms-serialization-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsSerializationExample {
  readonly form = new FormGroup({
    title: new FormControl('Release announcement', { nonNullable: true, validators: Validators.required }),
    body: new FormControl<NgsHeadlessEditorDocument | null>(null, richTextRequired)
  });

  private readonly body = toSignal(this.form.controls.body.valueChanges, { initialValue: null });
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  readonly html = computed(() => {
    const body = this.body();
    return body ? toHtml(body) : '';
  });
  readonly text = computed(() => {
    const body = this.body();
    return body ? toPlainText(body) : '';
  });
  readonly valid = computed(() => this.status() === 'VALID');

  loadSaved(): void {
    this.form.patchValue({ body: SAVED_DOCUMENT });
  }

  toggleDisabled(): void {
    const body = this.form.controls.body;
    if (body.disabled) {
      body.enable();
    } else {
      body.disable();
    }
  }
}
