import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { ComponentBlockExample } from '../_examples/component-block-example/component-block-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    ComponentBlockExample
  ],
  templateUrl: './component-blocks.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentBlocks {
  readonly regionCode = "@Component({\n  selector: 'app-caption-block',\n  imports: [NgsHeadlessEditorSurface, NgsHeadlessEditorRuns],\n  providers: [provideNgsHeadlessEditorInlineRegion()],\n  templateUrl: './caption-block.html'\n})\nexport class CaptionBlock {\n  private readonly region = inject(NgsHeadlessEditorInlineRegion);\n  readonly block = input.required<NgsHeadlessEditorBlock<null>>();\n  readonly caption = computed(() => normalizeNgsHeadlessEditorTableCell(this.block().attrs?.['caption']));\n  readonly editing = signal(false);\n\n  constructor() {\n    this.region.configure({ marks: ['bold', 'italic', 'link'] });  // or true / false\n\n    effect(() => {\n      const content = this.region.content();          // nested editor -> block\n      if (this.editing() && untracked(() => this.region.editor.origin()) !== 'external') {\n        untracked(() => this.region.parent.updateBlock(this.block().id, {\n          attrs: { ...this.block().attrs, caption: content }\n        }));\n      }\n    });\n  }\n\n  edit(): void {\n    this.region.load(this.caption());\n    this.region.activate();                           // toolbar now formats the caption\n    this.editing.set(true);\n  }\n\n  done(): void {\n    this.region.deactivate();\n    this.editing.set(false);\n  }\n}\n\n<!-- caption-block.html -->\n@if (editing()) {\n  <figcaption ngsHeadlessEditorSurface ariaLabel=\"Caption\"></figcaption>\n} @else {\n  <figcaption tabindex=\"0\" [ngsHeadlessEditorRuns]=\"caption()\" (focus)=\"edit()\"></figcaption>\n}";
  readonly pluginCode = "const calloutPlugin = defineNgsHeadlessEditorPlugin({\n  id: 'callout',\n  blocks: [\n    {\n      type: 'callout',\n      tagName: 'aside',\n      create: () => createCalloutBlock({ tone: 'info', text: '' }),\n      isEmpty: () => false,\n      editorComponent: CalloutBlock,\n      rendererComponent: CalloutPreview\n    }\n  ]\n});";
  readonly componentCode = "@Component({\n  selector: 'app-callout-block',\n  template: `\n    <textarea [value]=\"text()\" (input)=\"setText($event)\"></textarea>\n    <button (click)=\"remove()\">Remove</button>\n  `\n})\nexport class CalloutBlock implements NgsHeadlessEditorBlockComponent<null> {\n  private readonly editor = inject(NgsHeadlessEditor);\n  readonly block = input.required<NgsHeadlessEditorBlock<null>>();\n  readonly text = computed(() => String(this.block().attrs?.['text'] ?? ''));\n\n  setText(event: Event): void {\n    const text = (event.target as HTMLTextAreaElement).value;\n    this.editor.updateBlock(this.block().id, { attrs: { ...this.block().attrs, text } });\n  }\n\n  remove(): void {\n    this.editor.removeBlock(this.block().id);\n  }\n}";
}
