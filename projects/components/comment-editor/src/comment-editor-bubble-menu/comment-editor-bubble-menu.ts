import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import { COMMENT_EDITOR, COMMENT_EDITOR_BUBBLE_MENU, CommentEditorInterface } from '../types';

@Component({
  selector: 'ngs-comment-editor-bubble-menu',
  exportAs: 'ngsCommentEditorBubbleMenu',
  providers: [
    {
      provide: COMMENT_EDITOR_BUBBLE_MENU,
      useExisting: forwardRef(() => CommentEditorBubbleMenu)
    }
  ],
  templateUrl: './comment-editor-bubble-menu.html',
  styleUrl: './comment-editor-bubble-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'ngs-comment-editor-bubble-menu' }
})
export class CommentEditorBubbleMenu {
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  getLinkUrl(): string | null {
    return String(this.commentEditor.api.getMarkAttributes('link')?.['href'] ?? '') || null;
  }
}
