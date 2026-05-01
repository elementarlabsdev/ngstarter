import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandItalic]',
  exportAs: 'ngsTextEditorCommandItalic',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleItalic')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('italic')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandItalicDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleItalic');
  }
}
