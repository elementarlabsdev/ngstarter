import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';

@Directive({
  selector: '[ngsTextEditorCommandHorizontalRule]',
  host: {
    '[class.button]': 'true',
    '(click)': `onClick()`
  }
})
export class TextEditorCommandHorizontalRuleDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onClick() {
    this.textEditor.api.editor().chain().focus().setHorizontalRule().run();
  }
}
