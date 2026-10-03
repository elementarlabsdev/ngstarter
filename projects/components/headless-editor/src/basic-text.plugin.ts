import { createNgsHeadlessEditorParagraph } from './model';
import {
  defineNgsHeadlessEditorPlugin,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorPlugin
} from './plugin';

export const NGS_HEADLESS_EDITOR_TOGGLE_BOLD: NgsHeadlessEditorCommand<void> = toggleMarkCommand('bold');
export const NGS_HEADLESS_EDITOR_TOGGLE_ITALIC: NgsHeadlessEditorCommand<void> = toggleMarkCommand('italic');
export const NGS_HEADLESS_EDITOR_TOGGLE_STRIKE: NgsHeadlessEditorCommand<void> = toggleMarkCommand('strike');
export const NGS_HEADLESS_EDITOR_TOGGLE_CODE: NgsHeadlessEditorCommand<void> = toggleMarkCommand('code');

export const NGS_HEADLESS_EDITOR_TOGGLE_UNDERLINE = toggleMarkCommand('underline');
export const NGS_HEADLESS_EDITOR_TOGGLE_SUPERSCRIPT = toggleMarkCommand('superscript');
export const NGS_HEADLESS_EDITOR_TOGGLE_SUBSCRIPT = toggleMarkCommand('subscript');

export function basicTextEditorPlugin(): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'basic-text',
    blocks: [
      {
        type: 'paragraph',
        tagName: 'p',
        create: () => createNgsHeadlessEditorParagraph()
      }
    ],
    marks: [
      { type: 'bold', tagName: 'strong', parseTags: ['strong', 'b'] },
      { type: 'italic', tagName: 'em', parseTags: ['em', 'i'] },
      { type: 'strike', tagName: 's', parseTags: ['s', 'strike'] },
      { type: 'code', tagName: 'code', parseTags: ['code'] },
      { type: 'underline', tagName: 'u' },
      { type: 'superscript', tagName: 'sup' },
      { type: 'subscript', tagName: 'sub' }
    ],
    commands: [
      NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
      NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
      NGS_HEADLESS_EDITOR_TOGGLE_STRIKE,
      NGS_HEADLESS_EDITOR_TOGGLE_CODE,
      NGS_HEADLESS_EDITOR_TOGGLE_UNDERLINE,
      NGS_HEADLESS_EDITOR_TOGGLE_SUPERSCRIPT,
      NGS_HEADLESS_EDITOR_TOGGLE_SUBSCRIPT
    ],
    keymap: [
      { key: 'Mod-b', command: NGS_HEADLESS_EDITOR_TOGGLE_BOLD },
      { key: 'Mod-i', command: NGS_HEADLESS_EDITOR_TOGGLE_ITALIC },
      { key: 'Mod-Shift-x', command: NGS_HEADLESS_EDITOR_TOGGLE_STRIKE },
      { key: 'Mod-e', command: NGS_HEADLESS_EDITOR_TOGGLE_CODE }
    ]
  });
}

function toggleMarkCommand(type: string): NgsHeadlessEditorCommand<void> {
  return {
    id: `toggle-${type}`,
    execute: editor => editor.toggleMark(type),
    enabled: editor => editor.canApplyMark(type),
    active: editor => editor.isMarkActive(type)
  };
}
