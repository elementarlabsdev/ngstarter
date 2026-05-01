import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandBold]',
  exportAs: 'ngsCommentEditorCommandBold',
  standalone: true,
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleBold')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('bold')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandBoldDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleBold');
  }
}
