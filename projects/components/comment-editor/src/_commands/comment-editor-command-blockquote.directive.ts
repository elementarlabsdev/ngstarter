import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandBlockquote]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleBlockquote") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleBlockquote")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleBlockquote", $event)'
  }
})
export class CommentEditorCommandBlockquoteDirective extends CommentEditorCommandBase {}
