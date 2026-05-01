import { Component, forwardRef, inject } from '@angular/core';
import { TEXT_EDITOR, TEXT_EDITOR_BUBBLE_MENU, TextEditorInterface } from '../types';

@Component({
  selector: 'ngs-text-editor-bubble-menu',
  exportAs: 'emitTextEditorBubbleMenu',
  imports: [],
  providers: [
    {
      provide: TEXT_EDITOR_BUBBLE_MENU,
      useExisting: forwardRef(() => TextEditorBubbleMenu)
    }
  ],
  templateUrl: './text-editor-bubble-menu.html',
  styleUrl: './text-editor-bubble-menu.scss'
})
export class TextEditorBubbleMenu {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  getLinkUrl(): string | null {
    return (this.textEditor.api.editor()?.getAttributes('link') as HTMLLinkElement).href || null;
  }
}
