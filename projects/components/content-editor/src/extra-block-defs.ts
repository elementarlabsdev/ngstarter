import { createNgsHeadlessEditorId, createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlockDef } from './types';
import { CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS } from './html/default-converters';

export const CONTENT_EDITOR_EXTRA_BLOCK_DEFS: ContentEditorBlockDef[] = [
  {
    type: 'callout', component: () => import('./_builder/callout-block/callout-block').then(m => m.ContentEditorCalloutBlock),
    empty: () => ({ content: [createNgsHeadlessEditorText()], settings: { variant: 'note' } }), options: {}
  },
  {
    type: 'toggle', component: () => import('./_builder/toggle-block/toggle-block').then(m => m.ContentEditorToggleBlock),
    empty: () => ({ content: { title: [], blocks: [emptyParagraph()] }, settings: { expanded: true } }), options: {}
  },
  {
    type: 'attachment', component: () => import('./_builder/attachment-block/attachment-block').then(m => m.ContentEditorAttachmentBlock),
    empty: () => ({ content: { url: '', name: '', size: 0, mimeType: '' }, settings: {} }),
    options: { uploadFn: (_file: File, dataUrl: string) => Promise.resolve(dataUrl) }
  },
  {
    type: 'gallery', component: () => import('./_builder/gallery-block/gallery-block').then(m => m.ContentEditorGalleryBlock),
    empty: () => ({ content: { images: [] }, settings: {} }),
    options: { uploadFn: (_file: File, dataUrl: string) => Promise.resolve(dataUrl) }
  },
  {
    type: 'grid', component: () => import('./_builder/grid-block/grid-block').then(m => m.ContentEditorGridBlock),
    empty: () => ({ content: { cells: Array.from({ length: 4 }, emptyGridCell) }, settings: { columns: 2, gap: 'medium', stackOnMobile: true } }), options: {}
  }
].map(def => ({ ...def, toHtml: CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS[def.type] }));

export function emptyParagraph() {
  return { id: createNgsHeadlessEditorId('paragraph'), type: 'paragraph', content: [createNgsHeadlessEditorText()] };
}
export function emptyGridCell() { return { id: createNgsHeadlessEditorId('cell'), blocks: [emptyParagraph()] }; }

export const CONTENT_EDITOR_EXTRA_SUGGESTIONS = [
  { type: 'heading', title: 'Content & layout' },
  ...[
    ['callout', 'Callout', 'Notes, tips and warnings', 'fluent:info-24-regular'],
    ['toggle', 'Toggle', 'Collapsible content with nested blocks', 'fluent:chevron-down-24-regular'],
    ['attachment', 'Attachment', 'Upload a file for download', 'fluent:attach-24-regular'],
    ['gallery', 'Gallery', 'Image carousel with captions', 'fluent:image-multiple-24-regular'],
    ['grid', 'Grid', 'Responsive grid with nested blocks', 'fluent:grid-24-regular']
  ].map(([blockType, title, description, iconName]) => ({ type: 'item', blockType, title, description, iconName, blockSettings: {} }))
];
