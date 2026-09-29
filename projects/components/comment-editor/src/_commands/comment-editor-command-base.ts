import { inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

export abstract class CommentEditorCommandBase {
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected run(command: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.commentEditor.api.runCommand(command);
  }
}
