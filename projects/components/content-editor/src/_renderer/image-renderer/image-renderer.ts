import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ContentEditorBlock, ContentEditorImageBlockSettings, ContentEditorImageContent } from '../../types';
import { getDimensionAttribute } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-image-renderer',
  imports: [],
  templateUrl: './image-renderer.html',
  styleUrl: './image-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-image-renderer',
  },
})
export class ContentEditorImageRenderer {
  block = input<ContentEditorBlock | null>(null);
  content = input<Partial<ContentEditorImageContent> | null>(null);
  settings = input<Partial<ContentEditorImageBlockSettings>>({});

  protected readonly src = computed(() => this.content()?.src || '');
  protected readonly alt = computed(() => this.content()?.alt || '');
  protected readonly width = computed(() => getDimensionAttribute(this.settings()?.width));
  protected readonly height = computed(() => getDimensionAttribute(this.settings()?.height));
}
