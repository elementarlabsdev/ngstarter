import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandBulletList]',
  exportAs: 'ngsTextEditorCommandBulletList',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleBulletList')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('bulletList')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandBulletListDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleBulletList');
  }
}
