import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandBulletList]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleBulletList") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleBulletList")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleBulletList", $event)'
  }
})
export class CommentEditorCommandBulletListDirective extends CommentEditorCommandBase {}
