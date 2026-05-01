import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandUnsetLink]',
  exportAs: 'ngsTextEditorCommandUnsetLink',
  host: {
    '[class.button]': 'true',
    '(click)': `onClick()`
  }
})
export class TextEditorCommandUnsetLinkDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.editor().commands.unsetLink();
  }
}
