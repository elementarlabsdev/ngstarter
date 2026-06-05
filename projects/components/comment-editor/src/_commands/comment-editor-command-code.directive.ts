import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandCode]',
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleCode')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('code')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandCodeDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleCode');
  }
}
