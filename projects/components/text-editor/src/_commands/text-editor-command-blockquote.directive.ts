import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandBlockquote]',
  exportAs: 'ngsTextEditorCommandBlockquote',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleBlockquote')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('blockquote')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandBlockquoteDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleBlockquote');
  }
}
