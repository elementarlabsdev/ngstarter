import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  Provider,
  signal,
  untracked
} from '@angular/core';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from './headless-editor';
import {
  createNgsHeadlessEditorText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorText,
  ngsHeadlessEditorValuesEqual,
  normalizeNgsHeadlessEditorTextContent
} from './model';
import {
  defineNgsHeadlessEditorPlugin,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorKeyBinding,
  NgsHeadlessEditorMarkDefinition,
  NgsHeadlessEditorPlugin
} from './plugin';

export interface NgsHeadlessEditorInlineRegionOptions {
  /**
   * Marks available in the region: true for every mark of the parent editor
   * (except marks with `nested: false`), false for plain text, or a list of types.
   */
  readonly marks?: boolean | readonly string[];
}

/**
 * Provides a nested editor for rich text inside a component block, for example a
 * table cell or a caption. Add it to the component's providers; the component
 * then injects NgsHeadlessEditorInlineRegion and renders an
 * ngsHeadlessEditorSurface, which binds to the nested editor.
 */
export function provideNgsHeadlessEditorInlineRegion(): Provider[] {
  return [...provideNgsHeadlessEditor(), NgsHeadlessEditorInlineRegion];
}

/**
 * A small editor for inline rich text that lives inside a block of a parent
 * editor. It reuses the parent's marks, mark commands and key bindings, sends
 * undo and redo to the parent history, and, while active, becomes the parent's
 * inline target so toolbar formatting commands apply to it.
 *
 * Content is exchanged as text runs; line breaks are "\n" characters.
 */
@Injectable()
export class NgsHeadlessEditorInlineRegion {
  /** Editor of the document that contains the region. */
  readonly parent = inject(NgsHeadlessEditor, { skipSelf: true });
  /** Nested editor that edits the region. */
  readonly editor = inject(NgsHeadlessEditor);

  private readonly options = signal<NgsHeadlessEditorInlineRegionOptions>({ marks: true });

  /** True while formatting commands of the parent act on this region. */
  readonly active = computed(() => this.parent.inlineTarget() === this.editor);
  /** Region content as text runs. */
  readonly content = computed(() => documentToRuns(this.editor.document()));

  constructor() {
    effect(() => {
      const plugins = this.parent.plugins();
      const options = this.options();
      untracked(() => this.editor.setPlugins([createInlinePlugin(this.parent, plugins, options)]));
    });
    effect(() => {
      const readOnly = this.parent.readOnly();
      untracked(() => this.editor.setReadOnly(readOnly));
    });
    inject(DestroyRef).onDestroy(() => this.deactivate());
  }

  configure(options: NgsHeadlessEditorInlineRegionOptions): void {
    this.options.set({ marks: true, ...options });
  }

  /** Makes the region the parent's inline target. */
  activate(): void {
    this.parent.setInlineTarget(this.editor);
  }

  deactivate(): void {
    if (this.parent.inlineTarget() === this.editor) {
      this.parent.setInlineTarget(null);
    }
  }

  /**
   * Loads content into the nested editor unless it already shows it. The caret
   * position is kept when possible.
   */
  load(content: readonly NgsHeadlessEditorText[]): void {
    const next = normalizeNgsHeadlessEditorTextContent(content);
    if (ngsHeadlessEditorValuesEqual(next, this.content())) {
      return;
    }
    const selection = this.editor.selection();
    this.editor.setDocument(runsToDocument(next));
    if (selection) {
      this.editor.setSelection(selection);
    }
  }
}

function createInlinePlugin(
  parent: NgsHeadlessEditor,
  plugins: readonly NgsHeadlessEditorPlugin[],
  options: NgsHeadlessEditorInlineRegionOptions
): NgsHeadlessEditorPlugin {
  const allowed = (mark: NgsHeadlessEditorMarkDefinition) => {
    if (mark.nested === false || options.marks === false) {
      return false;
    }
    return Array.isArray(options.marks) ? options.marks.includes(mark.type) : true;
  };
  const undo: NgsHeadlessEditorCommand = { id: 'inline-region-undo', execute: () => parent.undo() };
  const redo: NgsHeadlessEditorCommand = { id: 'inline-region-redo', execute: () => parent.redo() };
  const keymap: NgsHeadlessEditorKeyBinding[] = [
    // Region edits are recorded in the parent history.
    { key: 'Mod-z', command: undo },
    { key: 'Mod-Shift-z', command: redo },
    { key: 'Mod-y', command: redo },
    ...plugins.flatMap(plugin => plugin.keymap ?? [])
  ];
  return defineNgsHeadlessEditorPlugin({
    id: 'inline-region',
    blocks: [
      plugins.flatMap(plugin => plugin.blocks ?? []).find(block => block.type === 'paragraph') ?? {
        type: 'paragraph',
        tagName: 'p',
        create: () => ({ id: 'line-0', type: 'paragraph', content: [createNgsHeadlessEditorText()] })
      }
    ],
    marks: plugins.flatMap(plugin => plugin.marks ?? []).filter(allowed),
    commands: [undo, redo, ...plugins.flatMap(plugin => plugin.commands ?? [])],
    keymap
  });
}

/** Splits runs on "\n" into paragraphs with stable ids, so the caret survives reloads. */
function runsToDocument(runs: readonly NgsHeadlessEditorText[]): NgsHeadlessEditorDocument {
  const lines: NgsHeadlessEditorText[][] = [[]];
  for (const run of runs) {
    run.text.split('\n').forEach((part, index) => {
      if (index > 0) {
        lines.push([]);
      }
      if (part) {
        lines[lines.length - 1].push(createNgsHeadlessEditorText(part, run.marks));
      }
    });
  }
  return {
    version: 1,
    blocks: lines.map((line, index): NgsHeadlessEditorBlock => ({
      id: `line-${index}`,
      type: 'paragraph',
      content: normalizeNgsHeadlessEditorTextContent(line)
    }))
  };
}

function documentToRuns(document: NgsHeadlessEditorDocument): readonly NgsHeadlessEditorText[] {
  const runs: NgsHeadlessEditorText[] = [];
  document.blocks.forEach((block, index) => {
    if (index > 0) {
      runs.push(createNgsHeadlessEditorText('\n'));
    }
    if (isNgsHeadlessEditorTextContent(block.content)) {
      runs.push(...block.content);
    }
  });
  return normalizeNgsHeadlessEditorTextContent(runs);
}
