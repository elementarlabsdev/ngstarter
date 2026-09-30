import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { BareEditorExample } from '../_examples/bare-editor-example/bare-editor-example';

@Component({
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    BareEditorExample
  ],
  templateUrl: './getting-started.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GettingStarted {
  readonly provideCode = "import { Component, inject } from '@angular/core';\nimport {\n  basicTextEditorPlugin,\n  NgsHeadlessEditor,\n  NgsHeadlessEditorSurface,\n  provideNgsHeadlessEditor,\n  withHeadlessEditorPlugin\n} from '@ngstarter-ui/components/headless-editor';\n\n@Component({\n  selector: 'app-note-editor',\n  imports: [NgsHeadlessEditorSurface],\n  providers: [\n    provideNgsHeadlessEditor(\n      withHeadlessEditorPlugin(basicTextEditorPlugin())\n    )\n  ],\n  templateUrl: './note-editor.html'\n})\nexport class NoteEditor {\n  readonly editor = inject(NgsHeadlessEditor);\n}";
  readonly surfaceCode = "<div\n  class=\"editor\"\n  ngsHeadlessEditorSurface\n  ariaLabel=\"Note\"\n  placeholder=\"Write a note\u2026\">\n</div>";
  readonly valueCode = "import { effect } from '@angular/core';\nimport { createNgsHeadlessEditorDocument } from '@ngstarter-ui/components/headless-editor';\n\nexport class NoteEditor {\n  readonly editor = inject(NgsHeadlessEditor);\n\n  constructor() {\n    // Load initial content. History is reset by default.\n    this.editor.setDocument(createNgsHeadlessEditorDocument('Hello!'));\n\n    effect(() => {\n      const document = this.editor.document();\n      // 'external' means the document was loaded with setDocument().\n      if (this.editor.origin() !== 'external') {\n        this.save(document);\n      }\n    });\n  }\n\n  private save(document: NgsHeadlessEditorDocument): void {\n    // send JSON to your API\n  }\n}";
  readonly styleCode = ".editor {\n  display: block;\n  min-height: 8rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid var(--ngs-color-border);\n  border-radius: var(--ngs-radius-md);\n  outline: none;\n\n  &:focus {\n    border-color: var(--ngs-color-primary);\n  }\n\n  ::ng-deep {\n    p {\n      margin: 0 0 0.5rem;\n    }\n\n    [data-ngs-headless-editor-placeholder] {\n      position: relative;\n\n      &::before {\n        content: attr(data-ngs-headless-editor-placeholder);\n        position: absolute;\n        inset: 0 auto auto 0;\n        color: var(--ngs-color-neutral-500);\n        pointer-events: none;\n      }\n    }\n  }\n}";
  readonly toolbarCode = "<button ngsButton=\"outlined\" [ngsHeadlessEditorCommand]=\"bold\">Bold</button>\n<button ngsButton=\"outlined\" [ngsHeadlessEditorCommand]=\"italic\">Italic</button>\n\n<!-- in the component: readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD; -->";
}
