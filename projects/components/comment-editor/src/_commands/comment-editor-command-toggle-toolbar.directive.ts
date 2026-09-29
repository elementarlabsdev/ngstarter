import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandToggleToolbar]',
  host: {
    '[class.active]': 'commentEditor.api.isToolbarActive()',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'toggle($event)'
  }
})
export class CommentEditorCommandToggleToolbarDirective {
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected toggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.commentEditor.api.toggleToolbar();
  }
}
