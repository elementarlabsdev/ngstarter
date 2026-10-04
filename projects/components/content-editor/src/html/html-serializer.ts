import { Injectable, inject } from '@angular/core';
import { CONTENT_EDITOR_CONFIG, ContentEditorConfig, mergeContentEditorConfig } from '../config';
import { ContentEditorBlock, ContentEditorDocument } from '../types';
import { contentEditorBlockToHtml, contentEditorToHtml } from './to-html';

/** Export saved documents with the current environment's shared configuration. */
@Injectable({ providedIn: 'root' })
export class ContentEditorHtmlSerializer {
  private readonly config = inject(CONTENT_EDITOR_CONFIG);
  toHtml(document: ContentEditorDocument, config: ContentEditorConfig = {}): string {
    return contentEditorToHtml(document, mergeContentEditorConfig(this.config, config));
  }
  blockToHtml(block: ContentEditorBlock, config: ContentEditorConfig = {}): string {
    return contentEditorBlockToHtml(block, mergeContentEditorConfig(this.config, config));
  }
}
