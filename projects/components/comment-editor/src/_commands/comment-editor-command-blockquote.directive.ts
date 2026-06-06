import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandBlockquote]',
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleBlockquote')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('blockquote')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandBlockquoteDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleBlockquote');
  }
}
