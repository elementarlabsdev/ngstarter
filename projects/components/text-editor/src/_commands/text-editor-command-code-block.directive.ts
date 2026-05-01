import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandCodeBlock]',
  exportAs: 'ngsTextEditorCommandCodeBlock',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleCodeBlock')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('codeBlock')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandCodeBlockDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleCodeBlock');
  }
}
