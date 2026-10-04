import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { UploadArea, UploadTriggerDirective, UploadFileSelectedEvent } from '@ngstarter-ui/components/upload';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { Alert } from '@ngstarter-ui/components/alert';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { ContentEditorUploadBlockBase } from '../upload-block-base';
import { ContentEditorAttachmentContent, ContentEditorUploadFn } from '../../types';
import { contentEditorFileSize, contentEditorResourceUrl, readContentEditorFile } from '../../upload';

@Component({
  selector: 'ngs-content-editor-attachment-block',
  imports: [UploadArea, UploadTriggerDirective, ProgressBar, Alert, Button, Icon, FormField, Label, Input],
  templateUrl: './attachment-block.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorAttachmentBlock extends ContentEditorUploadBlockBase<ContentEditorAttachmentContent> {
  readonly sizeLabel = computed(() => contentEditorFileSize(this.content().size));
  readonly href = computed(() => contentEditorResourceUrl(this.content().url));
  changeName(event: Event): void { this.save({ ...this.latestContent(), name: (event.target as HTMLInputElement).value }); }
  async upload(event: UploadFileSelectedEvent): Promise<void> {
    const file = event.files[0];
    if (!file) return;
    const request = this.beginUpload();
    try {
      const dataUrl = await readContentEditorFile(file);
      if (!this.isCurrentUpload(request)) return;
      const uploadFn: ContentEditorUploadFn = this.builder.getBlockDefOption('attachment', 'uploadFn');
      const url = await uploadFn(file, dataUrl);
      if (!this.isCurrentUpload(request)) return;
      if (typeof url !== 'string' || !contentEditorResourceUrl(url)) throw new Error('Invalid file URL');
      this.save({ url, name: file.name, size: file.size, mimeType: file.type });
    } catch {
      if (this.isCurrentUpload(request)) this.error.set('Could not upload the file. Please try again.');
    } finally {
      if (this.isCurrentUpload(request)) this.uploading.set(false);
    }
  }
}
