import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandOrderedList]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleOrderedList") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleOrderedList")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleOrderedList", $event)'
  }
})
export class CommentEditorCommandOrderedListDirective extends CommentEditorCommandBase {}
