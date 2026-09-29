import {
  defineNgsEditorPlugin,
  NgsEditorCommand,
  NgsEditorMarkDefinition,
  NgsEditorPlugin
} from './plugin';

export const NGS_EDITOR_TEXT_COLOR_MARK = 'textColor';
export const NGS_EDITOR_BACKGROUND_COLOR_MARK = 'backgroundColor';

export const NGS_EDITOR_SET_TEXT_COLOR: NgsEditorCommand<string> = setColorCommand(
  'set-text-color',
  NGS_EDITOR_TEXT_COLOR_MARK
);
export const NGS_EDITOR_UNSET_TEXT_COLOR: NgsEditorCommand<void> = unsetColorCommand(
  'unset-text-color',
  NGS_EDITOR_TEXT_COLOR_MARK
);
export const NGS_EDITOR_SET_BACKGROUND_COLOR: NgsEditorCommand<string> = setColorCommand(
  'set-background-color',
  NGS_EDITOR_BACKGROUND_COLOR_MARK
);
export const NGS_EDITOR_UNSET_BACKGROUND_COLOR: NgsEditorCommand<void> = unsetColorCommand(
  'unset-background-color',
  NGS_EDITOR_BACKGROUND_COLOR_MARK
);

export function colorEditorPlugin(): NgsEditorPlugin {
  return defineNgsEditorPlugin({
    id: 'color',
    marks: [
      colorMark(NGS_EDITOR_TEXT_COLOR_MARK, 'color'),
      colorMark(NGS_EDITOR_BACKGROUND_COLOR_MARK, 'backgroundColor')
    ],
    commands: [
      NGS_EDITOR_SET_TEXT_COLOR,
      NGS_EDITOR_UNSET_TEXT_COLOR,
      NGS_EDITOR_SET_BACKGROUND_COLOR,
      NGS_EDITOR_UNSET_BACKGROUND_COLOR
    ]
  });
}

/**
 * Keeps color values serializable and safe to write to an inline style attribute.
 * The editor accepts common CSS colors and design-token variables, but rejects
 * declarations, URLs, and other values that could escape the color property.
 */
export function normalizeNgsEditorColor(value: string | null | undefined): string | null {
  const color = value?.trim() ?? '';
  if (
    !color ||
    color.length > 128 ||
    /[;{}<>"'\\\u0000-\u001f\u007f]/.test(color) ||
    /(?:url|expression)\s*\(/i.test(color)
  ) {
    return null;
  }

  if (
    /^#[\da-f]{3,8}$/i.test(color) ||
    /^[a-z]+$/i.test(color) ||
    /^var\(--[\w-]+(?:\s*,\s*(?:#[\da-f]{3,8}|[a-z]+))?\)$/i.test(color) ||
    /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([\w\s.,%+\-/]+\)$/i.test(color) ||
    /^color\([\w\s.,%+\-/]+\)$/i.test(color)
  ) {
    return color;
  }

  return null;
}

function colorMark(
  type: string,
  styleProperty: 'color' | 'backgroundColor'
): NgsEditorMarkDefinition {
  return {
    type,
    tagName: 'span',
    applyAttributes: (element, mark) => {
      const color = normalizeNgsEditorColor(String(mark.attrs?.['color'] ?? ''));
      if (color) {
        element.style[styleProperty] = color;
      }
    },
    readAttributes: element => {
      const color = normalizeNgsEditorColor(element.style[styleProperty]);
      return color ? { color } : undefined;
    }
  };
}

function setColorCommand(id: string, type: string): NgsEditorCommand<string> {
  return {
    id,
    execute: (editor, value) => {
      const color = normalizeNgsEditorColor(value);
      return color ? editor.setMark(type, { color }) : false;
    },
    enabled: (_editor, value) => normalizeNgsEditorColor(value) !== null,
    active: (editor, value) => {
      const color = normalizeNgsEditorColor(value);
      return !!color &&
        editor.isMarkActive(type) &&
        editor.getActiveMark(type)?.attrs?.['color'] === color;
    }
  };
}

function unsetColorCommand(id: string, type: string): NgsEditorCommand<void> {
  return {
    id,
    execute: editor => editor.unsetMark(type),
    active: editor => editor.isMarkActive(type)
  };
}
