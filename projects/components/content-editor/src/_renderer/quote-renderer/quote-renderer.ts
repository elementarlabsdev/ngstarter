import { contentEditorText } from '../../document';
import { NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorText } from '../../types';
import { ContentEditorBlockRendererInputSignals, ContentEditorItemProperty } from '../../types';
import { getTextAlignment } from '../renderer-utils';

export interface ContentEditorQuoteRendererContentPart {
  content?: ContentEditorText;
  props?: ContentEditorItemProperty[];
}

export interface ContentEditorQuoteRendererContent {
  cite?: ContentEditorQuoteRendererContentPart;
  caption?: ContentEditorQuoteRendererContentPart;
}

@Component({
  selector: 'ngs-content-editor-quote-renderer',
  imports: [
    NgsHeadlessEditorRuns,
  ],
  templateUrl: './quote-renderer.html',
  styleUrl: './quote-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-quote-renderer',
  },
})
export class ContentEditorQuoteRenderer implements ContentEditorBlockRendererInputSignals<
  ContentEditorQuoteRendererContent | null,
  Record<string, unknown>
> {
  block = input<NgsHeadlessEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<ContentEditorQuoteRendererContent | null>(null);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Record<string, unknown>>({});
  index = input<number>(0);

  protected readonly quoteRuns = computed(() => this.content()?.cite?.content ?? []);
  protected readonly captionRuns = computed(() => this.content()?.caption?.content ?? []);
  protected readonly hasCaption = computed(() => !!contentEditorText(this.captionRuns()).trim());
  protected readonly quoteAlignment = computed(() => getTextAlignment(this.content()?.cite?.props));
  protected readonly captionAlignment = computed(() => getTextAlignment(this.content()?.caption?.props));
}
