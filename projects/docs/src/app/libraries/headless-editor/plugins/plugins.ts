import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { CustomPluginExample } from '../_examples/custom-plugin-example/custom-plugin-example';

@Component({
  imports: [
    NativeTable,
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    CustomPluginExample
  ],
  templateUrl: './plugins.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Plugins {
  readonly pluginCode = "export function linkEditorPlugin(): NgsHeadlessEditorPlugin {\n  return defineNgsHeadlessEditorPlugin({\n    id: 'link',\n    marks: [\n      {\n        type: 'link',\n        tagName: 'a',\n        parseTags: ['a'],\n        applyAttributes: (element, mark) => {\n          const href = toSafeHref(String(mark.attrs?.['href'] ?? ''));\n          if (href) {\n            element.setAttribute('href', href);\n            element.setAttribute('rel', 'noopener noreferrer');\n          }\n        },\n        readAttributes: element => {\n          const href = toSafeHref(element.getAttribute('href'));\n          return href ? { href } : undefined;\n        }\n      }\n    ],\n    commands: [SET_LINK, UNSET_LINK],\n    keymap: [\n      { key: 'Mod-Shift-h', command: NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, payload: '#fef08a' }\n    ],\n    providers: [EditorStats],\n    handlePaste: (event, editor) => { /* see below */ return false; }\n  });\n}";
  readonly installCode = "@Component({\n  providers: [\n    provideNgsHeadlessEditor(\n      withHeadlessEditorPlugin(basicTextEditorPlugin()),\n      withHeadlessEditorPlugin(colorEditorPlugin()),\n      withHeadlessEditorPlugin(linkEditorPlugin())\n    )\n  ]\n})\nexport class NotesEditor {\n  // Provided by linkEditorPlugin()\n  readonly stats = inject(EditorStats);\n}\n\n@Injectable()\nexport class EditorStats {\n  private readonly editor = inject(NgsHeadlessEditor);\n  readonly words = computed(() =>\n    getNgsHeadlessEditorDocumentText(this.editor.document()).split(/\\s+/).filter(Boolean).length\n  );\n}";
  readonly runtimeCode = "const draftPlugin = draftStoragePlugin('notes-draft');\n\n// Keep the current plugins and add one: its setup() runs.\neditor.setPlugins([...editor.plugins(), draftPlugin]);\n\n// Remove it again: its cleanup runs.\neditor.setPlugins(editor.plugins().filter(plugin => plugin !== draftPlugin));";
  readonly pasteCode = "handlePaste: (event, editor) => {\n  const href = toSafeHref(event.clipboardData?.getData('text/plain'));\n  if (!href) {\n    return false;                       // not a URL: next handler or plain text\n  }\n  const selection = editor.selection();\n  const collapsed = !selection ||\n    (selection.anchor.blockId === selection.focus.blockId &&\n     selection.anchor.offset === selection.focus.offset);\n\n  if (!collapsed) {\n    return editor.setMark('link', { href });  // link the selected text\n  }\n  editor.setMark('link', { href });     // arm the mark at the caret\n  editor.insertText(href, 'paste');     // insert the URL as linked text\n  editor.unsetMark('link');             // continue typing without the link\n  return true;\n}";
  readonly setupCode = "export function draftStoragePlugin(key: string): NgsHeadlessEditorPlugin {\n  return defineNgsHeadlessEditorPlugin({\n    id: 'draft-storage',\n    setup: editor => {\n      if (typeof localStorage === 'undefined' || typeof document === 'undefined') {\n        return;                               // server: nothing to do\n      }\n      const saved = localStorage.getItem(key);\n      if (saved) {\n        editor.setDocument(JSON.parse(saved));  // restore on install\n      }\n      const persist = () => localStorage.setItem(key, JSON.stringify(editor.document()));\n      document.defaultView?.addEventListener('pagehide', persist);\n\n      return () => {                          // on setPlugins() and on destroy\n        persist();\n        document.defaultView?.removeEventListener('pagehide', persist);\n      };\n    }\n  });\n}";
}
