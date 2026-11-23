import {
  ChangeDetectionStrategy,
  Component,
  effect,
  model,
  booleanAttribute,
  output,
  inject,
  input,
  untracked
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
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
    provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin()))
  ],
  templateUrl: './rich-text-field.html',
  styleUrl: './rich-text-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextField implements FormValueControl<NgsHeadlessEditorDocument | null> {
  readonly editor = inject(NgsHeadlessEditor);
  readonly label = input('Rich text');
  readonly placeholder = input('Write something…');
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;
  readonly italic = NGS_HEADLESS_EDITOR_TOGGLE_ITALIC;

  readonly value = model<NgsHeadlessEditorDocument | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  private wasFocused = false;

  constructor() {
    effect(() => {
      const value = this.value();
      untracked(() => this.editor.setDocument(value ?? createNgsHeadlessEditorDocument()));
    });
    effect(() => this.editor.setReadOnly(this.disabled() || this.readonly()));

    // Propagate user edits. Documents written by the form arrive through
    // setDocument() with origin 'external' and are not echoed back.
    effect(() => {
      const document = this.editor.document();
      if (this.editor.origin() !== 'external') {
        untracked(() => this.value.set(document));
      }
    });

    effect(() => {
      const focused = this.editor.focused();
      if (this.wasFocused && !focused) {
        untracked(() => this.touch.emit());
      }
      this.wasFocused = focused;
    });
  }
}
