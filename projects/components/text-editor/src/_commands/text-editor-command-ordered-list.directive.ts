import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandOrderedList]',
  exportAs: 'ngsTextEditorCommandOrderedList',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleOrderedList')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('orderedList')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandOrderedListDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.runCommand('toggleOrderedList');
  }
}
