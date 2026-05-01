import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandStrike]',
  exportAs: 'ngsTextEditorCommandStrike',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleStrike')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('strike')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandStrikeDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleStrike');
  }
}
