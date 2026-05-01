import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandStrike]',
  standalone: true,
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleStrike')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('strike')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandStrikeDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleStrike');
  }
}
