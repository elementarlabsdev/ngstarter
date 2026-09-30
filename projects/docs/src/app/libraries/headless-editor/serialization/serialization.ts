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
  readonly cvaCode = "@Component({\n  selector: 'app-rich-text-field',\n  imports: [NgsHeadlessEditorSurface],\n  providers: [\n    provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin())),\n    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextField), multi: true }\n  ],\n  template: `<div ngsHeadlessEditorSurface></div>`\n})\nexport class RichTextField implements ControlValueAccessor {\n  readonly editor = inject(NgsHeadlessEditor);\n  private onChange: (value: NgsHeadlessEditorDocument) => void = () => {};\n  private onTouched: () => void = () => {};\n  private wasFocused = false;\n\n  constructor() {\n    effect(() => {\n      const document = this.editor.document();\n      if (this.editor.origin() !== 'external') {\n        untracked(() => this.onChange(document));\n      }\n    });\n    effect(() => {\n      const focused = this.editor.focused();\n      if (this.wasFocused && !focused) {\n        untracked(() => this.onTouched());\n      }\n      this.wasFocused = focused;\n    });\n  }\n\n  writeValue(value: NgsHeadlessEditorDocument | null): void {\n    this.editor.setDocument(value ?? createNgsHeadlessEditorDocument());\n  }\n  registerOnChange(fn: (value: NgsHeadlessEditorDocument) => void): void { this.onChange = fn; }\n  registerOnTouched(fn: () => void): void { this.onTouched = fn; }\n  setDisabledState(disabled: boolean): void { this.editor.setReadOnly(disabled); }\n}";
  readonly validatorCode = "export function richTextRequired(\n  control: AbstractControl<NgsHeadlessEditorDocument | null>\n): ValidationErrors | null {\n  const value = control.value;\n  return !value || isNgsHeadlessEditorDocumentEmpty(value) ? { required: true } : null;\n}\n\nreadonly form = new FormGroup({\n  body: new FormControl<NgsHeadlessEditorDocument | null>(null, richTextRequired)\n});";
  readonly signalCode = "// Two-way binding with a model() input\nreadonly value = model<NgsHeadlessEditorDocument>(createNgsHeadlessEditorDocument());\n\nconstructor() {\n  effect(() => {\n    const value = this.value();\n    untracked(() => this.editor.setDocument(value));   // no-op when equal\n  });\n  effect(() => {\n    const document = this.editor.document();\n    if (this.editor.origin() !== 'external') {\n      untracked(() => this.value.set(document));\n    }\n  });\n}";
  readonly htmlCode = "const MARK_TAGS: Record<string, string> = { bold: 'strong', italic: 'em', strike: 's', code: 'code' };\n\nexport function toHtml(document: NgsHeadlessEditorDocument): string {\n  return document.blocks.map(block => {\n    const inner = isNgsHeadlessEditorTextContent(block.content)\n      ? block.content.map(run => run.marks.reduce((html, mark) => {\n          const tag = MARK_TAGS[mark.type];\n          return tag ? `<${tag}>${html}</${tag}>` : html;\n        }, escapeHtml(run.text))).join('')\n      : '';\n    return `<p>${inner}</p>`;\n  }).join('');\n}";
}
