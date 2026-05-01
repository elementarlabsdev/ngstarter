import { Directive, inject } from '@angular/core';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';

@Directive({
  selector: '[ngsCommentEditorCommandImage]',
  standalone: true,
  hostDirectives: [
    {
      directive: UploadTriggerDirective,
      outputs: ['fileSelected']
    }
  ],
  host: {
    '[attr.accept]': '"image/*"',
    '(fileSelected)': `onImageSelected($event)`
  }
})
export class CommentEditorCommandImageDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected onImageSelected(event: UploadFileSelectedEvent): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const src = reader.result as string;
      this.commentEditor.api.editor().chain().focus().addImageUploadingPlaceholder({ src, file }).run();
    };
  }
}
