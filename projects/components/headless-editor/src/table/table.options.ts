import { InjectionToken } from '@angular/core';
import { NgsHeadlessEditorMarkDefinition } from '../plugin';
import { NgsHeadlessEditorMarkRegistry } from '../render';

export interface NgsHeadlessEditorTablePluginOptions {
  /** Turn pasted spreadsheet ranges and HTML tables into table blocks. Default: true. */
  readonly paste?: boolean;
  /**
   * Formatting inside cells. true (default) allows every mark of the editor that
   * is not marked `nested: false`; false keeps cells plain text; a list allows
   * only those mark types.
   */
  readonly formatting?: boolean | readonly string[];
}

/** Options of the table plugin, provided by withHeadlessEditorPlugin(tableEditorPlugin(...)). */
export const NGS_HEADLESS_EDITOR_TABLE_OPTIONS = new InjectionToken<NgsHeadlessEditorTablePluginOptions>(
  'NGS_HEADLESS_EDITOR_TABLE_OPTIONS',
  { factory: () => ({}) }
);

/** Marks allowed in cells for the given formatting option. */
export function ngsHeadlessEditorTableCellMarks(
  registry: NgsHeadlessEditorMarkRegistry,
  formatting: boolean | readonly string[] = true
): NgsHeadlessEditorMarkRegistry {
  const allowed = (mark: NgsHeadlessEditorMarkDefinition | undefined) => !!mark &&
    formatting !== false &&
    mark.nested !== false &&
    (Array.isArray(formatting) ? formatting.includes(mark.type) : true);
  return {
    getMarkDefinition: type => {
      const mark = registry.getMarkDefinition(type);
      return allowed(mark) ? mark : undefined;
    },
    getMarkDefinitions: () => registry.getMarkDefinitions().filter(allowed)
  };
}
