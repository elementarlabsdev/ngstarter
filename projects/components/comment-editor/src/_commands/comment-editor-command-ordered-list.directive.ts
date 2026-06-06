import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandOrderedList]',
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleOrderedList')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('orderedList')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandOrderedListDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleOrderedList');
  }
}
