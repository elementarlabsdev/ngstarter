import { computed, Directive, inject, input } from '@angular/core';
import { NgsHeadlessEditor } from './headless-editor';
import { NgsHeadlessEditorCommand } from './plugin';

@Directive({
  selector: '[ngsHeadlessEditorCommand]',
  exportAs: 'ngsHeadlessEditorCommand',
  host: {
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'execute($event)',
    '[class.active]': 'active()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-pressed]': 'active().toString()'
  }
})
export class NgsHeadlessEditorCommandDirective<TPayload = void> {
  private readonly editor = inject(NgsHeadlessEditor);

  readonly command = input.required<NgsHeadlessEditorCommand<TPayload>>({
    alias: 'ngsHeadlessEditorCommand'
  });
  readonly commandData = input<TPayload>();

  readonly active = computed(() => this.editor.isCommandActive(
    this.command(),
    this.commandData()
  ));
  readonly disabled = computed(() => !this.editor.isCommandEnabled(
    this.command(),
    this.commandData()
  ));

  preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  execute(event: Event): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.editor.execute(this.command(), this.commandData());
    }
  }
}
