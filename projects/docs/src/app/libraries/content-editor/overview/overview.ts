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
}
