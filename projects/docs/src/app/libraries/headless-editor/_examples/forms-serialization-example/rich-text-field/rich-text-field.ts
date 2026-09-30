import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorDocument,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
  NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

/**
 * A reusable form control built on the headless editor. Each instance provides
 * its own NgsHeadlessEditor; the form value is the JSON document.
 */
@Component({
  selector: 'app-rich-text-field',
  imports: [NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [
    provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin())),
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextField), multi: true }
  ],
  templateUrl: './rich-text-field.html',
  styleUrl: './rich-text-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextField implements ControlValueAccessor {
  readonly editor = inject(NgsHeadlessEditor);
  readonly label = input('Rich text');
  readonly placeholder = input('Write something…');
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;
  readonly italic = NGS_HEADLESS_EDITOR_TOGGLE_ITALIC;

  private onChange: (value: NgsHeadlessEditorDocument) => void = () => {};
  private onTouched: () => void = () => {};
  private wasFocused = false;

  constructor() {
    // Propagate user edits. Documents written by the form arrive through
    // setDocument() with origin 'external' and are not echoed back.
    effect(() => {
      const document = this.editor.document();
      if (this.editor.origin() !== 'external') {
        untracked(() => this.onChange(document));
      }
    });

    effect(() => {
      const focused = this.editor.focused();
      if (this.wasFocused && !focused) {
        untracked(() => this.onTouched());
      }
      this.wasFocused = focused;
    });
  }

  writeValue(value: NgsHeadlessEditorDocument | null): void {
    this.editor.setDocument(value ?? createNgsHeadlessEditorDocument());
  }

  registerOnChange(fn: (value: NgsHeadlessEditorDocument) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.editor.setReadOnly(disabled);
  }
}
