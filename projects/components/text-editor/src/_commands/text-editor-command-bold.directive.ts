import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandBold]',
  exportAs: 'ngsTextEditorCommandBold',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleBold')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('bold')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandBoldDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleBold');
  }
}
