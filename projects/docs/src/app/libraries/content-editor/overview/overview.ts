import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import {Page} from "@meta/page/page";
import {PageContentDirective} from "@meta/page/page-content.directive";
import {PageTitleDirective} from "@meta/page/page-title.directive";

@Component({
    imports: [
        Page,
        PageContentDirective,
        PageTitleDirective,
        CodeHighlighter
    ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './overview.scss',
})
export class Overview {
  readonly documentExample = `import { signal } from '@angular/core';
import { ContentEditorDocument } from '@ngstarter-ui/components/content-editor';
import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';

readonly document = signal<ContentEditorDocument>({
  version: 1,
  blocks: [{
    id: 'intro',
    type: 'heading',
    content: [createNgsHeadlessEditorText('Hello', [{ type: 'bold' }])],
    attrs: { settings: { level: 2 }, props: [] }
  }]
});`;

  readonly templateExample = `<ngs-content-editor-builder
  [content]="document()"
  (contentChanged)="document.set($event)" />

<ngs-content-editor-renderer [content]="document()" />`;

  readonly htmlProviderExample = `import { ApplicationConfig } from '@angular/core';
import { provideContentEditorConfig } from '@ngstarter-ui/components/content-editor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideContentEditorConfig({
      blocks: {
        paragraph: {
          toHtml: (block, ctx) =>
            '<article>' + ctx.renderText(block.content) + '</article>'
        },
        image: {
          options: {
            uploadFn: (file: File, dataUrl: string) => uploadImage(file, dataUrl)
          }
        }
      }
    })
  ]
};

// Replace with your application's storage integration.
declare function uploadImage(file: File, dataUrl: string): Promise<string>;`;

  readonly htmlExportExample = `import { Injectable, inject } from '@angular/core';
import {
  ContentEditorConfig, ContentEditorDocument, ContentEditorHtmlSerializer,
  contentEditorToHtml, contentEditorBlockToHtml
} from '@ngstarter-ui/components/content-editor';

@Injectable({ providedIn: 'root' })
export class ArticleHtmlExport {
  private readonly serializer = inject(ContentEditorHtmlSerializer);
  toHtml(document: ContentEditorDocument): string {
    return this.serializer.toHtml(document); // Includes environment defaults.
  }
}

export const editorConfig: ContentEditorConfig = {
  blocks: {
    toggle: {
      toHtml: (block, ctx) =>
        '<section>' + ctx.defaultToHtml(block) + '</section>'
    },
    custom: {
      toHtml: (block, ctx) =>
        '<div>' + ctx.escape(block.content.title) + '</div>'
    }
  }
};

// Pure functions outside Angular DI, including server-side usage:
export function exportSavedDocument(document: ContentEditorDocument) {
  return {
    html: contentEditorToHtml(document, editorConfig),
    firstBlockHtml: document.blocks[0]
      ? contentEditorBlockToHtml(document.blocks[0], editorConfig) : ''
  };
}`;

  readonly htmlTemplateExample = `<ngs-content-editor-builder
  #builder="ngsContentEditorBuilder"
  [content]="document()"
  [config]="editorConfig"
  (contentChanged)="document.set($event)" />

<button ngsButton (click)="saveHtml(builder.toHtml())">Save HTML</button>`;
}
