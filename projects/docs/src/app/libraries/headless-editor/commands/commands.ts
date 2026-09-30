import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { ToolbarEditorExample } from '../_examples/toolbar-editor-example/toolbar-editor-example';

@Component({
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    ToolbarEditorExample
  ],
  templateUrl: './commands.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Commands {
  readonly contractCode = "export interface NgsHeadlessEditorCommand<TPayload = void> {\n  readonly id: string;\n  execute(editor: NgsHeadlessEditor, payload: TPayload): boolean;\n  enabled?(editor: NgsHeadlessEditor, payload: TPayload): boolean;\n  active?(editor: NgsHeadlessEditor, payload: TPayload): boolean;\n}\n\nconst toggleHeading: NgsHeadlessEditorCommand = {\n  id: 'toggle-heading',\n  execute: editor => editor.toggleBlock('heading'),\n  active: editor => editor.isBlockActive('heading')\n};\n\nconst undo: NgsHeadlessEditorCommand = {\n  id: 'undo',\n  execute: editor => editor.undo(),\n  enabled: editor => editor.canUndo()\n};";
  readonly payloadCode = "const setBlockType: NgsHeadlessEditorCommand<string> = {\n  id: 'set-block-type',\n  execute: (editor, type) => !editor.isBlockActive(type) && editor.toggleBlock(type),\n  active: (editor, type) => editor.isBlockActive(type)\n};";
  readonly toolbarCode = "<div role=\"toolbar\" aria-label=\"Formatting\">\n  <button ngsIconButton aria-label=\"Bold\" [ngsHeadlessEditorCommand]=\"bold\">\n    <ngs-icon name=\"fluent:text-bold-24-regular\"/>\n  </button>\n  <button ngsButton=\"outlined\" [ngsHeadlessEditorCommand]=\"setBlockType\" commandData=\"heading\">\n    Heading\n  </button>\n  <button ngsButton=\"outlined\" [ngsHeadlessEditorCommand]=\"setTextColor\" commandData=\"#dc2626\">\n    Red\n  </button>\n\n  <!-- the directive is exported as ngsHeadlessEditorCommand -->\n  <button #italicControl=\"ngsHeadlessEditorCommand\" [ngsHeadlessEditorCommand]=\"italic\">\n    Italic {{ italicControl.active() ? '(on)' : '' }}\n  </button>\n</div>\n\n<!-- .active { background: var(--ngs-state-selected-bg); } -->";
  readonly executeCode = "editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);           // by object\neditor.execute('toggle-bold');                             // by registered id\neditor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, '#dc2626');\n\neditor.isCommandEnabled(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, 'red; x'); // false\neditor.isCommandActive(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);";
  readonly keymapCode = "defineNgsHeadlessEditorPlugin({\n  id: 'shortcuts',\n  commands: [toggleHeading],\n  keymap: [\n    { key: 'Mod-Alt-2', command: toggleHeading },\n    { key: 'Mod-Shift-9', command: 'toggle-quote' },          // by id\n    { key: 'Mod-Shift-h', command: NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, payload: '#fef08a' }\n  ]\n});";
}
