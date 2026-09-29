import { createNgsEditorParagraph } from './model';
import {
  defineNgsEditorPlugin,
  NgsEditorCommand,
  NgsEditorPlugin
} from './plugin';

export const NGS_EDITOR_TOGGLE_BOLD: NgsEditorCommand<void> = toggleMarkCommand('bold');
export const NGS_EDITOR_TOGGLE_ITALIC: NgsEditorCommand<void> = toggleMarkCommand('italic');
export const NGS_EDITOR_TOGGLE_STRIKE: NgsEditorCommand<void> = toggleMarkCommand('strike');
export const NGS_EDITOR_TOGGLE_CODE: NgsEditorCommand<void> = toggleMarkCommand('code');

export function basicTextEditorPlugin(): NgsEditorPlugin {
  return defineNgsEditorPlugin({
    id: 'basic-text',
    blocks: [
      {
        type: 'paragraph',
        tagName: 'p',
        create: () => createNgsEditorParagraph()
      }
    ],
    marks: [
      { type: 'bold', tagName: 'strong', parseTags: ['strong', 'b'] },
      { type: 'italic', tagName: 'em', parseTags: ['em', 'i'] },
      { type: 'strike', tagName: 's', parseTags: ['s', 'strike'] },
      { type: 'code', tagName: 'code', parseTags: ['code'] }
    ],
    commands: [
      NGS_EDITOR_TOGGLE_BOLD,
      NGS_EDITOR_TOGGLE_ITALIC,
      NGS_EDITOR_TOGGLE_STRIKE,
      NGS_EDITOR_TOGGLE_CODE
    ],
    keymap: [
      { key: 'Mod-b', command: NGS_EDITOR_TOGGLE_BOLD },
      { key: 'Mod-i', command: NGS_EDITOR_TOGGLE_ITALIC },
      { key: 'Mod-Shift-x', command: NGS_EDITOR_TOGGLE_STRIKE },
      { key: 'Mod-e', command: NGS_EDITOR_TOGGLE_CODE }
    ]
  });
}

function toggleMarkCommand(type: string): NgsEditorCommand<void> {
  return {
    id: `toggle-${type}`,
    execute: editor => editor.toggleMark(type),
    active: editor => editor.isMarkActive(type)
  };
}
