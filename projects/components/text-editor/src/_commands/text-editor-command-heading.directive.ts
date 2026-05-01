import { Directive, inject, input, numberAttribute } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandHeading]',
  exportAs: 'ngsTextEditorCommandHeading',
  host: {
    '[attr.disabled]': `isDisabled ? '' : null`,
    '[class.active]': `isActive`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandHeadingDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  level = input.required({
    transform: numberAttribute
  });

  protected get isActive(): boolean {
    return !!(this.textEditor && this.textEditor.api.isActive('heading', { level: this.level() }));
  }

  protected get isDisabled(): boolean {
    return !!(this.textEditor && this.textEditor.api.isCommandDisabled('toggleHeading', { level: this.level() }));
  }

  protected onClick() {
    this.textEditor.api.runCommand('toggleHeading', { level: this.level() });
  }
}
