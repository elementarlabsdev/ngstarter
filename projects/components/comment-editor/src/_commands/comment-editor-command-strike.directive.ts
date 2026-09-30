import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandStrike]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleStrike") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleStrike")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleStrike", $event)'
  }
})
export class CommentEditorCommandStrikeDirective extends CommentEditorCommandBase {}
