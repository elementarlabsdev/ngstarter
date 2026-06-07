import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeResourceUrlPipe } from '@ngstarter-ui/components/core';
import {
  ContentEditorBlock,
  ContentEditorEmbedBlockSettings,
  ContentEditorEmbedContent,
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
export class ContentEditorEmbedRenderer {
  block = input<ContentEditorBlock | null>(null);
  content = input<Partial<ContentEditorEmbedContent> | null>(null);
  settings = input<Partial<ContentEditorEmbedBlockSettings>>({});

  protected readonly url = computed(() => this.content()?.url || '');
  protected readonly type = computed(() => this.content()?.type || '');
  protected readonly width = computed(() => getDimensionAttribute(this.settings()?.width) || 700);
  protected readonly height = computed(() => getDimensionAttribute(this.settings()?.height) || 400);
}
