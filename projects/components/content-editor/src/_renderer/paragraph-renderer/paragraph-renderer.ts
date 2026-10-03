import { NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorText } from '../../types';
import { ContentEditorBlockRendererInputSignals, ContentEditorItemProperty } from '../../types';
import { getTextAlignment } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-paragraph-renderer',
  imports: [
    NgsHeadlessEditorRuns,
  ],
  templateUrl: './paragraph-renderer.html',
  styleUrl: './paragraph-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-paragraph-renderer',
  },
})
export class ContentEditorParagraphRenderer implements ContentEditorBlockRendererInputSignals<ContentEditorText, Record<string, unknown>> {
  block = input<NgsHeadlessEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<ContentEditorText>([]);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Record<string, unknown>>({});
  index = input<number>(0);

  protected readonly runs = computed(() => this.content());
  protected readonly alignment = computed(() => getTextAlignment(this.props()));
}
