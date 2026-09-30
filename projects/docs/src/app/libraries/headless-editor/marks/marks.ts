import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { PluginEditorExample } from '../_examples/plugin-editor-example/plugin-editor-example';

@Component({
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    PluginEditorExample
  ],
  templateUrl: './marks.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Marks {
  readonly everywhereCode = "const toggleUnderline: NgsHeadlessEditorCommand = {\n  id: 'toggle-underline',\n  execute: editor => editor.toggleMark('underline'),\n  enabled: editor => editor.canApplyMark('underline'),   // false in cells without underline\n  active: editor => editor.isMarkActive('underline')\n};\n\nconst toggleHeading: NgsHeadlessEditorCommand = {\n  id: 'toggle-heading',\n  execute: editor => editor.toggleBlock('heading'),\n  enabled: editor => editor.canEditBlocks(),             // false inside a table cell\n  active: editor => editor.isBlockActive('heading')\n};\n\neditor.inlineTarget();   // nested editor that receives formatting, or null";
  readonly definitionCode = "const underlinePlugin = defineNgsHeadlessEditorPlugin({\n  id: 'underline',\n  marks: [{ type: 'underline', tagName: 'u' }],\n  commands: [toggleUnderline],\n  keymap: [{ key: 'Mod-u', command: toggleUnderline }]\n});\n\nconst mentionMark: NgsHeadlessEditorMarkDefinition = {\n  type: 'mention',\n  tagName: 'span',\n  applyAttributes: (element, mark) => {\n    element.classList.add('mention');\n    element.dataset['userId'] = String(mark.attrs?.['userId'] ?? '');\n  },\n  readAttributes: element => ({ userId: element.dataset['userId'] ?? '' })\n};";
  readonly storedCode = "editor.toggleMark('bold');        // caret: arms bold\neditor.isMarkActive('bold');      // true, toolbar shows Bold pressed\neditor.storedMarks();             // [{ type: 'bold' }]\neditor.insertText('Bold text');   // inserted with bold, stored marks cleared";
  readonly colorCode = "provideNgsHeadlessEditor(\n  withHeadlessEditorPlugin(basicTextEditorPlugin()),\n  withHeadlessEditorPlugin(colorEditorPlugin())\n);\n\neditor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, 'var(--ngs-color-danger)');\neditor.execute(NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, '#fef08a');\neditor.getActiveMark(NGS_HEADLESS_EDITOR_TEXT_COLOR_MARK)?.attrs?.['color'];\n\nnormalizeNgsHeadlessEditorColor('red; display: none');  // null";
}
