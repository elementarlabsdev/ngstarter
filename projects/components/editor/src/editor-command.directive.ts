import { computed, Directive, inject, input } from '@angular/core';
import { NgsEditor } from './editor';
import { NgsEditorCommand } from './plugin';

@Directive({
  selector: '[ngsEditorCommand]',
  exportAs: 'ngsEditorCommand',
  host: {
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'execute($event)',
    '[class.active]': 'active()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-pressed]': 'active().toString()'
  }
})
export class NgsEditorCommandDirective<TPayload = void> {
  private readonly editor = inject(NgsEditor);

  readonly command = input.required<NgsEditorCommand<TPayload>>({
    alias: 'ngsEditorCommand'
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
