import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { FormsSerializationExample } from '../_examples/forms-serialization-example/forms-serialization-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    FormsSerializationExample
  ],
  templateUrl: './serialization.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Serialization {
  readonly storeCode = "// save\nconst json = JSON.stringify(editor.document());\nawait api.saveNote(noteId, json);\n\n// load\nconst saved = JSON.parse(await api.loadNote(noteId)) as NgsHeadlessEditorDocument;\neditor.setDocument(saved);";
  readonly formControlCode = `export class RichTextField implements FormValueControl<NgsHeadlessEditorDocument | null> {
  readonly value = model<NgsHeadlessEditorDocument | null>(null);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly touch = output<void>();
}`;
  readonly validatorCode = `readonly form = form(this.model, path => {
  validate(path.body, ({ value }) => {
    const body = value();
    return !body || isNgsHeadlessEditorDocumentEmpty(body) ? requiredError() : null;
  });
});`;
  readonly signalCode = "// Two-way binding with a model() input\nreadonly value = model<NgsHeadlessEditorDocument>(createNgsHeadlessEditorDocument());\n\nconstructor() {\n  effect(() => {\n    const value = this.value();\n    untracked(() => this.editor.setDocument(value));   // no-op when equal\n  });\n  effect(() => {\n    const document = this.editor.document();\n    if (this.editor.origin() !== 'external') {\n      untracked(() => this.value.set(document));\n    }\n  });\n}";
  readonly htmlCode = "const MARK_TAGS: Record<string, string> = { bold: 'strong', italic: 'em', strike: 's', code: 'code' };\n\nexport function toHtml(document: NgsHeadlessEditorDocument): string {\n  return document.blocks.map(block => {\n    const inner = isNgsHeadlessEditorTextContent(block.content)\n      ? block.content.map(run => run.marks.reduce((html, mark) => {\n          const tag = MARK_TAGS[mark.type];\n          return tag ? `<${tag}>${html}</${tag}>` : html;\n        }, escapeHtml(run.text))).join('')\n      : '';\n    return `<p>${inner}</p>`;\n  }).join('');\n}";
}
