import { Directive, inject } from '@angular/core';
import { TEXT_EDITOR, TextEditorInterface } from '../types';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';

@Directive({
  selector: '[ngsTextEditorCommandImage]',
  exportAs: 'ngsTextEditorCommandImage',
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
export class TextEditorCommandImageDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);

  protected onImageSelected(event: UploadFileSelectedEvent): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const src = reader.result as string;
      this.textEditor.api.editor().chain().focus().addImageUploadingPlaceholder({ src, file }).run();
    };
  }
}
