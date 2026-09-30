import { Directive, inject } from '@angular/core';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandImage]',
  hostDirectives: [
    {
      directive: UploadTriggerDirective,
      outputs: ['fileSelected']
    }
  ],
  host: {
    '[attr.accept]': '"image/*"',
    '(fileSelected)': 'selectImage($event)'
  }
})
export class CommentEditorCommandImageDirective {
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected selectImage(event: UploadFileSelectedEvent): void {
    const file = event.files[0];
    if (file) {
      this.commentEditor.api.insertImage(file);
    }
  }
}
