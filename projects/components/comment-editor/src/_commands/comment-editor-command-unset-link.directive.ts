import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandUnsetLink]',
  host: {
    '[class.button]': 'true',
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandUnsetLinkDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.editor().commands.unsetLink();
  }
}
