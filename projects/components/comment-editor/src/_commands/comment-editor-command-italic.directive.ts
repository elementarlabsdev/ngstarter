import { Directive } from '@angular/core';
import { CommentEditorCommandBase } from './comment-editor-command-base';

@Directive({
  selector: '[ngsCommentEditorCommandItalic]',
  host: {
    '[attr.disabled]': 'commentEditor.api.isCommandDisabled("toggleItalic") ? "" : null',
    '[class.active]': 'commentEditor.api.isActive("toggleItalic")',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'run("toggleItalic", $event)'
  }
})
export class CommentEditorCommandItalicDirective extends CommentEditorCommandBase {}
