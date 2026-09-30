import { computed, inject, Injectable } from '@angular/core';
import {
  defineNgsHeadlessEditorPlugin,
  getNgsHeadlessEditorDocumentText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorPlugin,
  NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR
} from '@ngstarter-ui/components/headless-editor';

/** Only http(s) links are accepted; everything else is rejected before it reaches the DOM. */
export function toSafeHref(value: string | null | undefined): string | null {
  const href = value?.trim() ?? '';
  return /^https?:\/\/[^\s"'<>]+$/i.test(href) ? href : null;
}

export const SET_LINK: NgsHeadlessEditorCommand<string> = {
  id: 'set-link',
  execute: (editor, href) => {
    const safe = toSafeHref(href);
    return !!safe && editor.setMark('link', { href: safe });
  },
  enabled: (editor, href) => {
    const selection = editor.selection();
    const collapsed = !selection || (
      selection.anchor.blockId === selection.focus.blockId &&
      selection.anchor.offset === selection.focus.offset
    );
    return !collapsed && toSafeHref(href) !== null && editor.canApplyMark('link');
  },
  active: editor => editor.isMarkActive('link')
};

export const UNSET_LINK: NgsHeadlessEditorCommand = {
  id: 'unset-link',
  execute: editor => editor.unsetMark('link'),
  enabled: editor => editor.isMarkActive('link')
};

/** Plugin-scoped service installed through `providers` (requires withHeadlessEditorPlugin). */
@Injectable()
export class EditorStats {
  private readonly editor = inject(NgsHeadlessEditor);
  private readonly text = computed(() => getNgsHeadlessEditorDocumentText(this.editor.document()));
  readonly words = computed(() => this.text().split(/\s+/).filter(Boolean).length);
  readonly characters = computed(() => this.text().replace(/\n/g, '').length);
  readonly links = computed(() => this.editor.document().blocks
    .flatMap(block => isNgsHeadlessEditorTextContent(block.content) ? block.content : [])
    .filter(run => run.marks.some(mark => mark.type === 'link')).length);
}

export function linkEditorPlugin(): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'link',
    marks: [
      {
        type: 'link',
        tagName: 'a',
        // Tags accepted when browser-owned DOM (IME, drag and drop) is read back.
        parseTags: ['a'],
        applyAttributes: (element, mark) => {
          const href = toSafeHref(String(mark.attrs?.['href'] ?? ''));
          if (href) {
            element.setAttribute('href', href);
            element.setAttribute('rel', 'noopener noreferrer');
            element.setAttribute('target', '_blank');
          }
        },
        readAttributes: element => {
          const href = toSafeHref(element.getAttribute('href'));
          return href ? { href } : undefined;
        }
      }
    ],
    commands: [SET_LINK, UNSET_LINK],
    keymap: [
      // Bindings can target commands from other plugins and pass a payload.
      { key: 'Mod-Shift-h', command: NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, payload: '#fef08a' }
    ],
    providers: [EditorStats],
    handlePaste: (event, editor) => {
      const href = toSafeHref(event.clipboardData?.getData('text/plain'));
      if (!href) {
        return false; // let the next plugin or the plain-text fallback handle it
      }
      const selection = editor.selection();
      const collapsed = !selection || (
        selection.anchor.blockId === selection.focus.blockId &&
        selection.anchor.offset === selection.focus.offset
      );
      if (!collapsed) {
        // Pasting a URL over selected text turns the selection into a link.
        return editor.setMark('link', { href });
      }
      // At a caret: arm the link as a stored mark, insert the URL, then disarm it
      // so the text typed afterwards is not linked.
      editor.setMark('link', { href });
      editor.insertText(href, 'paste');
      editor.unsetMark('link');
      return true;
    }
  });
}

/**
 * A plugin with a setup() lifecycle: when installed it restores a draft saved by a
 * previous visit, and it saves the draft when the page is hidden. The cleanup it
 * returns saves once more and removes its listeners; it runs when the plugin set
 * changes and when the editor is destroyed.
 */
export function draftStoragePlugin(
  key: string,
  onRestore?: (document: NgsHeadlessEditorDocument) => void
): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'draft-storage',
    setup: editor => {
      // setup() also runs on the server: guard browser APIs.
      const storage = typeof localStorage === 'undefined' ? null : localStorage;
      const target = typeof document === 'undefined' ? null : document;
      if (!storage || !target) {
        return;
      }

      const saved = storage.getItem(key);
      if (saved) {
        try {
          editor.setDocument(JSON.parse(saved) as NgsHeadlessEditorDocument);
          onRestore?.(editor.document());
        } catch {
          storage.removeItem(key);
        }
      }

      const persist = () => storage.setItem(key, JSON.stringify(editor.document()));
      const onVisibilityChange = () => {
        if (target.visibilityState === 'hidden') {
          persist();
        }
      };
      target.addEventListener('visibilitychange', onVisibilityChange);
      target.defaultView?.addEventListener('pagehide', persist);

      return () => {
        persist();
        target.removeEventListener('visibilitychange', onVisibilityChange);
        target.defaultView?.removeEventListener('pagehide', persist);
      };
    }
  });
}
