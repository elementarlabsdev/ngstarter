import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import { ContentEditorBlock, ContentEditorBlockRendererInputSignals, ContentEditorItemProperty } from '../../types';
import { getHtmlContent, getTextAlignment } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-paragraph-renderer',
  imports: [
    SafeHtmlPipe,
  ],
  templateUrl: './paragraph-renderer.html',
  styleUrl: './paragraph-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-paragraph-renderer',
  },
})
export class ContentEditorParagraphRenderer implements ContentEditorBlockRendererInputSignals<unknown, Record<string, unknown>> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<unknown>('');
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Record<string, unknown>>({});
  index = input<number>(0);

  protected readonly html = computed(() => getHtmlContent(this.content()));
  protected readonly alignment = computed(() => getTextAlignment(this.props()));
}
