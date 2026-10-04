import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { ContentEditorRendererBase } from '../renderer-base';
import { ContentEditorGridContent, ContentEditorGridSettings } from '../../types';
import { ContentEditorRenderer } from '../../content-editor-renderer/content-editor-renderer';
import { contentEditorGridSettings } from '../../grid-settings';

@Component({
  selector: 'ngs-content-editor-grid-renderer', imports: [forwardRef(() => ContentEditorRenderer)],
  templateUrl: './grid-renderer.html', styleUrls: ['../../grid-layout.scss', './grid-renderer.scss'], changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditorGridRenderer extends ContentEditorRendererBase<ContentEditorGridContent, ContentEditorGridSettings> {
  readonly layout = computed(() => contentEditorGridSettings(this.settings()));
}
