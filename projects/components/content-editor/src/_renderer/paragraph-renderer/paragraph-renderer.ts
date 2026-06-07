import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import { ContentEditorBlock, ContentEditorItemProperty } from '../../types';
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
export class ContentEditorParagraphRenderer {
  block = input<ContentEditorBlock | null>(null);
  content = input<unknown>('');
  props = input<ContentEditorItemProperty[]>([]);

  protected readonly html = computed(() => getHtmlContent(this.content()));
  protected readonly alignment = computed(() => getTextAlignment(this.props()));
}
