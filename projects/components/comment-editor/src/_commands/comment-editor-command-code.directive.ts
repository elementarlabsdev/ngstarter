import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandCode]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleCode") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleCode")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleCode", $event)'
  }
})
export class CommentEditorCommandCodeDirective extends CommentEditorCommandBase {}
