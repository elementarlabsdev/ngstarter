import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { ContentEditorBlock, ContentEditorBlockRendererInputSignals, ContentEditorItemProperty } from '../../types';
import { getHtmlContent } from '../renderer-utils';

export interface ContentEditorCodeRendererSettings {
  language?: string;
}

@Component({
  selector: 'ngs-content-editor-code-renderer',
  imports: [
    CodeHighlighter,
  ],
  templateUrl: './code-renderer.html',
  styleUrl: './code-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-code-renderer',
  },
})
export class ContentEditorCodeRenderer implements ContentEditorBlockRendererInputSignals<unknown, ContentEditorCodeRendererSettings> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<unknown>('');
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<ContentEditorCodeRendererSettings>({});
  index = input<number>(0);

  protected readonly code = computed(() => getHtmlContent(this.content()));
  protected readonly language = computed(() => this.settings()?.language || 'none');
}
