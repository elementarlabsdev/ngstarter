import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ContentBuilderComponent, ContentEditorDocument, isContentEditorBlockEmpty } from '@ngstarter-ui/components/content-editor';
import { Button } from '@ngstarter-ui/components/button';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import { ContentBuilderPreviewDialog } from '../preview-dialog/content-builder-preview-dialog';

@Component({
  selector: 'app-content-builder',
  imports: [
    Button,
    ContentBuilderComponent,
    Icon
  ],
  templateUrl: './content-builder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './content-builder.scss',
})
export class ContentBuilder {
  readonly document = signal<ContentEditorDocument>({ version: 1, blocks: [
    { id: 'intro', type: 'heading', content: [createNgsHeadlessEditorText('Build a richer document')], attrs: { settings: { level: 2 } } },
    { id: 'note', type: 'callout', content: [createNgsHeadlessEditorText('Select text to add bold, links or colors.')], attrs: { settings: { variant: 'tip' } } },
    { id: 'details', type: 'toggle', content: { title: [createNgsHeadlessEditorText('More details')], blocks: [
      { id: 'details-text', type: 'paragraph', content: [createNgsHeadlessEditorText('Add any block here, or drag it into a column.')] }
    ] }, attrs: { settings: { expanded: true } } },
    { id: 'file', type: 'attachment', content: { url: 'data:text/plain;base64,TmdTdGFydGVyIENvbnRlbnQgRWRpdG9y', name: 'readme.txt', size: 27, mimeType: 'text/plain' } },
    { id: 'photos', type: 'gallery', content: { images: [
      { id: 'photo-1', src: '/assets/chairs.jpg', alt: 'Chairs', caption: [createNgsHeadlessEditorText('Image captions support rich text.')] },
      { id: 'photo-2', src: '/assets/chairs2.jpg', alt: 'More chairs', caption: [] }
    ] } },
    { id: 'layout', type: 'columns', content: { columns: [
      { id: 'left', blocks: [{ id: 'left-text', type: 'paragraph', content: [createNgsHeadlessEditorText('Left column')] }] },
      { id: 'right', blocks: [{ id: 'right-text', type: 'paragraph', content: [createNgsHeadlessEditorText('Right column')] }] }
    ] } }
  ] });
  private readonly dialog = inject(Dialog);

  options = {
    image: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 2000);
        });
      }
    },
    video: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 3000);
        });
      }
    }
  };

  openPreview(document: ContentEditorDocument) {
    this.dialog.open(ContentBuilderPreviewDialog, {
      width: '840px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      data: {
        document: { version: 1, blocks: document.blocks.filter(block => !(block.type === 'paragraph' && isContentEditorBlockEmpty(block))) }
      }
    });
  }

}
