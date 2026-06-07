import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorImageBlockSettings,
  ContentEditorImageContent,
  ContentEditorItemProperty,
} from '../../types';
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
export class ContentEditorImageRenderer implements ContentEditorBlockRendererInputSignals<
  Partial<ContentEditorImageContent> | null,
  Partial<ContentEditorImageBlockSettings>
> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<Partial<ContentEditorImageContent> | null>(null);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Partial<ContentEditorImageBlockSettings>>({});
  index = input<number>(0);

  protected readonly src = computed(() => this.content()?.src || '');
  protected readonly alt = computed(() => this.content()?.alt || '');
  protected readonly width = computed(() => getDimensionAttribute(this.settings()?.width));
  protected readonly height = computed(() => getDimensionAttribute(this.settings()?.height));
}
