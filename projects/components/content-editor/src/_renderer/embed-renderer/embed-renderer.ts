import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeResourceUrlPipe } from '@ngstarter-ui/components/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorEmbedBlockSettings,
  ContentEditorEmbedContent,
  ContentEditorItemProperty,
} from '../../types';
import { getDimensionAttribute } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-embed-renderer',
  imports: [
    SafeResourceUrlPipe,
  ],
  templateUrl: './embed-renderer.html',
  styleUrl: './embed-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-embed-renderer',
  },
})
export class ContentEditorEmbedRenderer implements ContentEditorBlockRendererInputSignals<
  Partial<ContentEditorEmbedContent> | null,
  Partial<ContentEditorEmbedBlockSettings>
> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<Partial<ContentEditorEmbedContent> | null>(null);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Partial<ContentEditorEmbedBlockSettings>>({});
  index = input<number>(0);

  protected readonly url = computed(() => this.content()?.url || '');
  protected readonly embedType = computed(() => this.content()?.type || '');
  protected readonly width = computed(() => getDimensionAttribute(this.settings()?.width) || 700);
  protected readonly height = computed(() => getDimensionAttribute(this.settings()?.height) || 400);
}
