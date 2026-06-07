import { ContentEditorItemProperty } from '../types';

export type ContentEditorTextAlignment = 'left' | 'center' | 'right' | 'justify';

export function getTextAlignment(
  props: ReadonlyArray<ContentEditorItemProperty> | null | undefined,
): ContentEditorTextAlignment {
  const value = props?.find(prop => prop.name === 'text-alignment')?.value;

  if (value === 'center' || value === 'right' || value === 'justify') {
    return value;
  }

  return 'left';
}

export function getDimensionAttribute(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed || trimmed === 'auto') {
      return null;
    }

    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getHtmlContent(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
