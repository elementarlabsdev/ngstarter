import { ContentEditorBlockRendererDef } from '../types';
import { ContentEditorCodeRenderer } from './code-renderer/code-renderer';
import { ContentEditorDividerRenderer } from './divider-renderer/divider-renderer';
import { ContentEditorEmbedRenderer } from './embed-renderer/embed-renderer';
import { ContentEditorHeadingRenderer } from './heading-renderer/heading-renderer';
import { ContentEditorImageRenderer } from './image-renderer/image-renderer';
import { ContentEditorListRenderer } from './list-renderer/list-renderer';
import { ContentEditorParagraphRenderer } from './paragraph-renderer/paragraph-renderer';
import { ContentEditorQuoteRenderer } from './quote-renderer/quote-renderer';
import { ContentEditorTableRenderer } from './table-renderer/table-renderer';
import { ContentEditorVideoRenderer } from './video-renderer/video-renderer';

export const CONTENT_EDITOR_DEFAULT_RENDERERS: ReadonlyArray<ContentEditorBlockRendererDef> = [
  {
    type: 'paragraph',
    component: ContentEditorParagraphRenderer,
  },
  {
    type: 'heading',
    component: ContentEditorHeadingRenderer,
  },
  {
    type: 'code',
    component: ContentEditorCodeRenderer,
  },
  {
    type: 'divider',
    component: ContentEditorDividerRenderer,
  },
  {
    type: 'image',
    component: ContentEditorImageRenderer,
  },
  {
    type: 'video',
    component: ContentEditorVideoRenderer,
  },
  {
    type: 'bulletList',
    component: ContentEditorListRenderer,
  },
  {
    type: 'orderedList',
    component: ContentEditorListRenderer,
  },
  {
    type: 'table',
    component: ContentEditorTableRenderer,
  },
  {
    type: 'quote',
    component: ContentEditorQuoteRenderer,
  },
  {
    type: 'embed',
    component: ContentEditorEmbedRenderer,
  },
];
