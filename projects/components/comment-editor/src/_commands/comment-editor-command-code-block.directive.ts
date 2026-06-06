import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandCodeBlock]',
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleCodeBlock')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('codeBlock')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandCodeBlockDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onClick() {
    this.commentEditor.api.runCommand('toggleCodeBlock');
  }
}
