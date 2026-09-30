import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandUnsetLink]',
  host: {
    '[class.button]': 'true',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'unset($event)'
  }
})
export class CommentEditorCommandUnsetLinkDirective {
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected unset(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.commentEditor.api.unsetLink();
    this.commentEditor.api.focus();
  }
}
