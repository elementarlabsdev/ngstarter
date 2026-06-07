import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorItemProperty,
  ContentEditorVideoBlockSettings,
  ContentEditorVideoContent,
} from '../../types';
import { getDimensionAttribute } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-video-renderer',
  imports: [],
  templateUrl: './video-renderer.html',
  styleUrl: './video-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-video-renderer',
  },
})
export class ContentEditorVideoRenderer implements ContentEditorBlockRendererInputSignals<
  Partial<ContentEditorVideoContent> | null,
  Partial<ContentEditorVideoBlockSettings>
> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<Partial<ContentEditorVideoContent> | null>(null);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Partial<ContentEditorVideoBlockSettings>>({});
  index = input<number>(0);

  protected readonly src = computed(() => this.content()?.src || '');
  protected readonly caption = computed(() => this.content()?.caption || '');
  protected readonly width = computed(() => getDimensionAttribute(this.settings()?.width));
  protected readonly height = computed(() => getDimensionAttribute(this.settings()?.height));
}
