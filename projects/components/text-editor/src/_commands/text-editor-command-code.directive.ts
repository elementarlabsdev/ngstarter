import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandCode]',
  exportAs: 'ngsTextEditorCommandCode',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleCode')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('code')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandCodeDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleCode');
  }
}
