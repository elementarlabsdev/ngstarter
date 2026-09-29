import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandBold]',
  exportAs: 'ngsCommentEditorCommandBold',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleBold") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleBold")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleBold", $event)'
  }
})
export class CommentEditorCommandBoldDirective extends CommentEditorCommandBase {}
