import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { UploadArea, UploadTriggerDirective, UploadFileSelectedEvent } from '@ngstarter-ui/components/upload';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { ContentEditorUploadBlockBase } from '../upload-block-base';
import { ContentEditorAttachmentContent } from '../../types';
import { ContentEditorUploadStatus } from '../upload-status/upload-status';
import { contentEditorFileSize, contentEditorResourceUrl } from '../../upload';

@Component({
  selector: 'ngs-content-editor-attachment-block',
  imports: [ContentEditorUploadStatus, UploadArea, UploadTriggerDirective, Button, Icon, FormField, Label, Input],
  templateUrl: './attachment-block.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorAttachmentBlock extends ContentEditorUploadBlockBase<ContentEditorAttachmentContent> {
  readonly sizeLabel = computed(() => contentEditorFileSize(this.content().size));
  readonly href = computed(() => contentEditorResourceUrl(this.content().url));
  changeName(event: Event): void { this.save({ ...this.latestContent(), name: (event.target as HTMLInputElement).value }); }
  async upload(event: UploadFileSelectedEvent): Promise<void> {
    const file = event.files[0];
    if (!file) return;
    await this.uploadFiles('attachment', { files: [file], apply: results => {
      const { url, file } = results[0];
      this.save({ url, name: file.name, size: file.size, mimeType: file.type });
    } });
  }
}
