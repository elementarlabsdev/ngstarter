import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandToggleToolbar]',
  host: {
    '[class.active]': `commentEditor && commentEditor.api.isToolbarActive()`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandToggleToolbarDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick(): void {
    this.commentEditor.api.toggleToolbar();
  }
}
