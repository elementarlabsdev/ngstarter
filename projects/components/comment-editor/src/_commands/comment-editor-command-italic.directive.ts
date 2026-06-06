import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandItalic]',
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleItalic')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('italic')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandItalicDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleItalic');
  }
}
