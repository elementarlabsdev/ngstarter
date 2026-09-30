import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandCodeBlock]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleCodeBlock") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleCodeBlock")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleCodeBlock", $event)'
  }
})
export class CommentEditorCommandCodeBlockDirective extends CommentEditorCommandBase {}
