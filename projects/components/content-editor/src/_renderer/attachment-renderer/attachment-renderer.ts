import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { ContentEditorRendererBase } from '../renderer-base';
import { ContentEditorAttachmentContent } from '../../types';
import { contentEditorFileSize, contentEditorResourceUrl } from '../../upload';

@Component({
  selector: 'ngs-content-editor-attachment-renderer', imports: [Button, Icon],
  templateUrl: './attachment-renderer.html', changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorAttachmentRenderer extends ContentEditorRendererBase<ContentEditorAttachmentContent> {
  readonly sizeLabel = computed(() => contentEditorFileSize(this.content()?.size ?? 0));
  readonly href = computed(() => contentEditorResourceUrl(this.content()?.url ?? ''));
}
