import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { CONTENT_EDITOR_CONFIG, ContentEditorConfig, mergeContentEditorConfig } from '../config';
import { contentEditorFromJson } from './from-json';
import { contentEditorFromHtml } from './from-html';
import { ContentEditorHtmlImportOptions, ContentEditorImportOptions } from './types';

/** Parsing only: applications decide when to replace their current document. */
@Injectable({ providedIn: 'root' })
export class ContentEditorImporter {
  private readonly config = inject(CONTENT_EDITOR_CONFIG);
  private readonly document = inject(DOCUMENT);

  fromJson(source: unknown, config: ContentEditorConfig = {}, options: ContentEditorImportOptions = {}) {
    return contentEditorFromJson(source, mergeContentEditorConfig(this.config, config), options);
  }

  fromHtml(html: string, config: ContentEditorConfig = {}, options: ContentEditorHtmlImportOptions = {}) {
    return contentEditorFromHtml(html, mergeContentEditorConfig(this.config, config), { document: this.document, ...options });
  }
}
