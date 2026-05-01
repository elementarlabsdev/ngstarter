import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandBulletList]',
  standalone: true,
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleBulletList')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('bulletList')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandBulletListDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleBulletList');
  }
}
