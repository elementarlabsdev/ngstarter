import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import { ContentEditorBlock, ContentEditorItemProperty } from '../../types';
import { getHtmlContent, getTextAlignment } from '../renderer-utils';

export interface ContentEditorQuoteRendererContentPart {
  content?: string;
  props?: ContentEditorItemProperty[];
}

export interface ContentEditorQuoteRendererContent {
  cite?: ContentEditorQuoteRendererContentPart;
  caption?: ContentEditorQuoteRendererContentPart;
}

@Component({
  selector: 'ngs-content-editor-quote-renderer',
  imports: [
    SafeHtmlPipe,
  ],
  templateUrl: './quote-renderer.html',
  styleUrl: './quote-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-quote-renderer',
  },
})
export class ContentEditorQuoteRenderer {
  block = input<ContentEditorBlock | null>(null);
  content = input<ContentEditorQuoteRendererContent | null>(null);

  protected readonly quoteHtml = computed(() => getHtmlContent(this.content()?.cite?.content));
  protected readonly captionHtml = computed(() => getHtmlContent(this.content()?.caption?.content));
  protected readonly quoteAlignment = computed(() => getTextAlignment(this.content()?.cite?.props));
  protected readonly captionAlignment = computed(() => getTextAlignment(this.content()?.caption?.props));
}
