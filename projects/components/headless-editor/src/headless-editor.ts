import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  InjectionToken,
  Provider,
  Signal,
  signal
} from '@angular/core';
import { NgsHeadlessEditorHistory } from './history';
import {
  cloneNgsHeadlessEditorDocument,
  createNgsHeadlessEditorDocument,
  createNgsHeadlessEditorParagraph,
  createNgsHeadlessEditorText,
  getNgsHeadlessEditorBlockText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorMark,
  NgsHeadlessEditorPoint,
  NgsHeadlessEditorSelection,
  NgsHeadlessEditorText,
  ngsHeadlessEditorDocumentsEqual,
  ngsHeadlessEditorMarksEqual,
  normalizeNgsHeadlessEditorDocument,
  normalizeNgsHeadlessEditorMarks,
  normalizeNgsHeadlessEditorTextContent
} from './model';
import {
  NgsHeadlessEditorBlockDefinition,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorFeature,
  NgsHeadlessEditorKeyBinding,
  NgsHeadlessEditorMarkDefinition,
  NgsHeadlessEditorPlugin
} from './plugin';

export type NgsHeadlessEditorChangeOrigin = 'external' | 'api' | 'keyboard' | 'paste' | 'composition' | 'history' | 'command';

export const NGS_HEADLESS_EDITOR_PLUGINS = new InjectionToken<readonly NgsHeadlessEditorPlugin[]>('NGS_HEADLESS_EDITOR_PLUGINS');

export function provideNgsHeadlessEditor(...features: readonly NgsHeadlessEditorFeature[]): Provider[] {
  const plugins = features.map(feature => feature.plugin);
  return [
    NgsHeadlessEditorHistory,
    NgsHeadlessEditor,
    ...plugins.flatMap(plugin => plugin.providers ?? []),
    {
      provide: NGS_HEADLESS_EDITOR_PLUGINS,
      useValue: plugins
    }
  ];
}

@Injectable()
export class NgsHeadlessEditor {
  private readonly history = inject(NgsHeadlessEditorHistory);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injectedPlugins = inject(NGS_HEADLESS_EDITOR_PLUGINS, { optional: true }) ?? [];

  private readonly _document = signal<NgsHeadlessEditorDocument>(createNgsHeadlessEditorDocument());
  private readonly _selection = signal<NgsHeadlessEditorSelection | null>(null);
  /** Marks for the next insertion at a collapsed caret; `null` means "inherit from the text". */
  private readonly _storedMarks = signal<readonly NgsHeadlessEditorMark[] | null>(null);
  private readonly _focused = signal(false);
  private readonly _composing = signal(false);
  private readonly _readOnly = signal(false);
  private readonly _revision = signal(0);
  private readonly _origin = signal<NgsHeadlessEditorChangeOrigin>('external');
  private readonly _plugins = signal<readonly NgsHeadlessEditorPlugin[]>([]);
  private readonly _inlineTarget = signal<NgsHeadlessEditor | null>(null);

  private readonly commands = new Map<string, NgsHeadlessEditorCommand<unknown>>();
  private readonly marks = new Map<string, NgsHeadlessEditorMarkDefinition>();
  private readonly blocks = new Map<string, NgsHeadlessEditorBlockDefinition>();
  private keymap: readonly NgsHeadlessEditorKeyBinding[] = [];
  private pluginCleanups: Array<() => void> = [];

  readonly document = this._document.asReadonly();
  /**
   * Nested editor that currently receives formatting, for example the editor of
   * the focused table cell. See setInlineTarget().
   */
  readonly inlineTarget = this._inlineTarget.asReadonly();
  /** Selection of the inline target while one is active, otherwise of this editor. */
  readonly selection: Signal<NgsHeadlessEditorSelection | null> = computed(() => {
    const target = this._inlineTarget();
    return target ? target.selection() : this._selection();
  });
  readonly storedMarks: Signal<readonly NgsHeadlessEditorMark[]> = computed(() => {
    const target = this._inlineTarget();
    return target ? target.storedMarks() : this._storedMarks() ?? [];
  });
  readonly focused = this._focused.asReadonly();
  readonly composing = this._composing.asReadonly();
  readonly readOnly = this._readOnly.asReadonly();
  readonly revision = this._revision.asReadonly();
  readonly origin = this._origin.asReadonly();
  readonly plugins = this._plugins.asReadonly();
  readonly empty = computed(() => {
    this._plugins();
    return this._document().blocks.every(block => {
      const definition = this.blocks.get(block.type);
      return definition?.isEmpty
        ? definition.isEmpty(block)
        : getNgsHeadlessEditorBlockText(block).trim().length === 0;
    });
  });
  readonly canUndo = this.history.canUndo;
  readonly canRedo = this.history.canRedo;

  constructor() {
    this.setPlugins(this.injectedPlugins);
    this.destroyRef.onDestroy(() => this.destroyPlugins());
  }

  setPlugins(plugins: readonly NgsHeadlessEditorPlugin[]): void {
    if (samePluginSet(this._plugins(), plugins)) {
      return;
    }

    const pluginIds = new Set<string>();
    const commands = new Map<string, NgsHeadlessEditorCommand<unknown>>();
    const marks = new Map<string, NgsHeadlessEditorMarkDefinition>();
    const blocks = new Map<string, NgsHeadlessEditorBlockDefinition>();
    const keymap: NgsHeadlessEditorKeyBinding[] = [];

    for (const plugin of plugins) {
      assertUnique(pluginIds, plugin.id, 'plugin');

      for (const command of plugin.commands ?? []) {
        assertUnique(commands, command.id, 'command');
        commands.set(command.id, command);
      }
      for (const mark of plugin.marks ?? []) {
        assertUnique(marks, mark.type, 'mark');
        marks.set(mark.type, mark);
      }
      for (const block of plugin.blocks ?? []) {
        assertUnique(blocks, block.type, 'block');
        blocks.set(block.type, block);
      }
      keymap.push(...(plugin.keymap ?? []));
    }

    this.destroyPlugins();
    this.commands.clear();
    this.marks.clear();
    this.blocks.clear();
    commands.forEach((command, id) => this.commands.set(id, command));
    marks.forEach((mark, type) => this.marks.set(type, mark));
    blocks.forEach((block, type) => this.blocks.set(type, block));
    this.keymap = keymap;
    this._plugins.set([...plugins]);

    for (const plugin of plugins) {
      const cleanup = plugin.setup?.(this);
      if (cleanup) {
        this.pluginCleanups.push(cleanup);
      }
    }
  }

  getMarkDefinition(type: string): NgsHeadlessEditorMarkDefinition | undefined {
    return this.marks.get(type);
  }

  getMarkDefinitions(): readonly NgsHeadlessEditorMarkDefinition[] {
    return [...this.marks.values()];
  }

  getBlockDefinition(type: string): NgsHeadlessEditorBlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getBlockDefinitions(): readonly NgsHeadlessEditorBlockDefinition[] {
    return [...this.blocks.values()];
  }

  setDocument(document: NgsHeadlessEditorDocument, resetHistory = true): void {
    // Copy once at the boundary: the caller may keep mutating its object, while
    // everything inside the editor treats documents as immutable.
    const normalized = normalizeNgsHeadlessEditorDocument(cloneNgsHeadlessEditorDocument(document));
    if (ngsHeadlessEditorDocumentsEqual(this._document(), normalized)) {
      return;
    }

    this._document.set(normalized);
    this._selection.set(firstSelection(normalized));
    this._storedMarks.set(null);
    this._origin.set('external');
    this._revision.update(revision => revision + 1);
    if (resetHistory) {
      this.history.clear();
    }
  }

  setReadOnly(readOnly: boolean): void {
    this._readOnly.set(readOnly);
  }

  setFocused(focused: boolean): void {
    this._focused.set(focused);
  }

  setComposing(composing: boolean): void {
    this._composing.set(composing);
  }

  setSelection(selection: NgsHeadlessEditorSelection | null): void {
    const next = selection ? clampSelection(this._document(), selection, this.marks) : null;
    if (!selectionsEqual(this._selection(), next)) {
      // Moving the caret discards pending marks and starts a new undo step.
      this._storedMarks.set(null);
      this.history.breakGroup();
    }
    this._selection.set(next);
  }

  execute<TPayload>(command: NgsHeadlessEditorCommand<TPayload> | string, payload?: TPayload): boolean {
    const resolved = typeof command === 'string'
      ? this.commands.get(command) as NgsHeadlessEditorCommand<TPayload> | undefined
      : command;

    if (!resolved || this._readOnly() || resolved.enabled?.(this, payload as TPayload) === false) {
      return false;
    }

    return resolved.execute(this, payload as TPayload);
  }

  isCommandEnabled<TPayload>(command: NgsHeadlessEditorCommand<TPayload>, payload?: TPayload): boolean {
    return !this._readOnly() && (command.enabled?.(this, payload as TPayload) ?? true);
  }

  isCommandActive<TPayload>(command: NgsHeadlessEditorCommand<TPayload>, payload?: TPayload): boolean {
    return command.active?.(this, payload as TPayload) ?? false;
  }

  handleKeydown(event: KeyboardEvent): boolean {
    const candidates = eventToKeyBindings(event);
    for (const candidate of candidates) {
      const binding = this.keymap.find(item => item.key.toLowerCase() === candidate);
      if (binding) {
        return this.execute(binding.command, binding.payload);
      }
    }

    // Edits are applied to the model, so the browser has no native undo stack
    // and never emits historyUndo/historyRedo for these shortcuts.
    if (candidates.includes('mod-z')) {
      return !this._readOnly() && this.undo();
    }
    if (candidates.includes('mod-shift-z') || candidates.includes('mod-y')) {
      return !this._readOnly() && this.redo();
    }
    return false;
  }

  handlePaste(event: ClipboardEvent): boolean {
    for (const plugin of this._plugins()) {
      if (plugin.handlePaste?.(event, this)) {
        return true;
      }
    }
    return false;
  }

  insertText(text: string, origin: NgsHeadlessEditorChangeOrigin = 'keyboard'): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.insertText(text, origin);
    }
    if (this._readOnly() || text.length === 0) {
      return false;
    }

    const initialSelection = this.ensureSelection();
    const base = deleteSelectedRange(this._document(), initialSelection);
    const selection = base.selection;
    const point = selection.focus;
    const blockIndex = base.document.blocks.findIndex(block => block.id === point.blockId);
    if (blockIndex < 0) {
      return false;
    }

    const block = base.document.blocks[blockIndex];
    if (!isNgsHeadlessEditorTextContent(block.content)) {
      return false;
    }

    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const marks = (this._storedMarks() ?? marksAtOffset(block.content, point.offset))
      .filter(mark => !this.marks.get(mark.type)?.atomic);
    const before = sliceTextContent(block.content, 0, point.offset);
    const after = sliceTextContent(block.content, point.offset, textContentLength(block.content));
    const blocks = [...base.document.blocks];

    if (lines.length === 1) {
      blocks[blockIndex] = {
        ...block,
        content: normalizeNgsHeadlessEditorTextContent([
          ...before,
          createNgsHeadlessEditorText(lines[0], marks),
          ...after
        ])
      };
      const offset = point.offset + lines[0].length;
      const group = origin === 'keyboard' &&
        isCollapsed(initialSelection) &&
        graphemeCount(lines[0]) === 1 &&
        !/\s/.test(lines[0])
        ? 'insert-text'
        : null;
      return this.commit(
        { version: 1, blocks },
        collapsedSelection(block.id, offset),
        origin,
        group
      );
    }

    const insertedBlocks: NgsHeadlessEditorBlock[] = lines.map((line, index) => {
      if (index === 0) {
        return {
          ...block,
          content: normalizeNgsHeadlessEditorTextContent([...before, createNgsHeadlessEditorText(line, marks)])
        };
      }
      if (index === lines.length - 1) {
        return {
          ...createNgsHeadlessEditorParagraph(),
          content: normalizeNgsHeadlessEditorTextContent([createNgsHeadlessEditorText(line, marks), ...after])
        };
      }
      return createNgsHeadlessEditorParagraph(line, marks);
    });
    blocks.splice(blockIndex, 1, ...insertedBlocks);
    const last = insertedBlocks[insertedBlocks.length - 1];
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(last.id, lines.at(-1)?.length ?? 0),
      origin
    );
  }

  deleteBackward(): boolean {
    if (this._readOnly()) {
      return false;
    }

    const selection = this.ensureSelection();
    if (!isCollapsed(selection)) {
      return this.deleteRange(selection, 'keyboard');
    }

    const point = selection.focus;
    const blockIndex = this._document().blocks.findIndex(block => block.id === point.blockId);
    const block = this._document().blocks[blockIndex];
    if (!block || !isNgsHeadlessEditorTextContent(block.content)) {
      return false;
    }

    if (point.offset > 0) {
      const start = previousGraphemeBoundary(getNgsHeadlessEditorBlockText(block), point.offset);
      return this.deleteRange({
        anchor: { blockId: block.id, offset: start },
        focus: point
      }, 'keyboard', 'delete-backward');
    }

    if (blockIndex === 0) {
      return false;
    }

    const previous = this._document().blocks[blockIndex - 1];
    if (!isNgsHeadlessEditorTextContent(previous.content)) {
      const blocks = [...this._document().blocks];
      blocks.splice(blockIndex - 1, 1);
      return this.commit(
        { version: 1, blocks },
        collapsedSelection(block.id, 0),
        'keyboard'
      );
    }
    const previousLength = textContentLength(previous.content);
    const blocks = [...this._document().blocks];
    blocks.splice(blockIndex - 1, 2, {
      ...previous,
      content: normalizeNgsHeadlessEditorTextContent([...previous.content, ...block.content])
    });
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(previous.id, previousLength),
      'keyboard'
    );
  }

  deleteForward(): boolean {
    if (this._readOnly()) {
      return false;
    }

    const selection = this.ensureSelection();
    if (!isCollapsed(selection)) {
      return this.deleteRange(selection, 'keyboard');
    }

    const point = selection.focus;
    const blockIndex = this._document().blocks.findIndex(block => block.id === point.blockId);
    const block = this._document().blocks[blockIndex];
    if (!block || !isNgsHeadlessEditorTextContent(block.content)) {
      return false;
    }
    const text = getNgsHeadlessEditorBlockText(block);

    if (point.offset < text.length) {
      return this.deleteRange({
        anchor: point,
        focus: { blockId: block.id, offset: nextGraphemeBoundary(text, point.offset) }
      }, 'keyboard', 'delete-forward');
    }

    const next = this._document().blocks[blockIndex + 1];
    if (!next) {
      return false;
    }
    if (!isNgsHeadlessEditorTextContent(next.content)) {
      const blocks = [...this._document().blocks];
      blocks.splice(blockIndex + 1, 1);
      return this.commit(
        { version: 1, blocks },
        collapsedSelection(block.id, point.offset),
        'keyboard'
      );
    }
    const blocks = [...this._document().blocks];
    blocks.splice(blockIndex, 2, {
      ...block,
      content: normalizeNgsHeadlessEditorTextContent([...block.content, ...next.content])
    });
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(block.id, point.offset),
      'keyboard'
    );
  }

  deleteRange(
    selection: NgsHeadlessEditorSelection,
    origin: NgsHeadlessEditorChangeOrigin,
    historyGroup: string | null = null
  ): boolean {
    if (this._readOnly()) {
      return false;
    }
    const deleted = deleteSelectedRange(this._document(), clampSelection(this._document(), selection, this.marks));
    if (ngsHeadlessEditorDocumentsEqual(deleted.document, this._document())) {
      return false;
    }
    return this.commit(deleted.document, deleted.selection, origin, historyGroup);
  }

  splitBlock(): boolean {
    if (this._readOnly()) {
      return false;
    }

    const deleted = deleteSelectedRange(this._document(), this.ensureSelection());
    const point = deleted.selection.focus;
    const blockIndex = deleted.document.blocks.findIndex(block => block.id === point.blockId);
    const block = deleted.document.blocks[blockIndex];
    if (!block || !isNgsHeadlessEditorTextContent(block.content)) {
      return false;
    }

    const definition = this.blocks.get(block.type);
    const exitType = definition?.exitType ?? 'paragraph';
    if (
      getNgsHeadlessEditorBlockText(block).length === 0 &&
      block.type !== exitType &&
      definition?.exitOnEmptyEnter !== false &&
      this.blocks.has(exitType)
    ) {
      // Second Enter in a quote, list or code block: drop the empty line and
      // continue below the block with a paragraph.
      const exit = this.blocks.get(exitType)?.create() ?? createNgsHeadlessEditorParagraph();
      const blocks = [...deleted.document.blocks];
      blocks.splice(blockIndex, 1, {
        ...exit,
        type: exitType,
        content: normalizeNgsHeadlessEditorTextContent([])
      });
      return this.commit(
        { version: 1, blocks },
        collapsedSelection(exit.id, 0),
        'keyboard'
      );
    }

    const left = sliceTextContent(block.content, 0, point.offset);
    const right = sliceTextContent(block.content, point.offset, textContentLength(block.content));
    const next = definition?.create() ?? createNgsHeadlessEditorParagraph();
    const blocks = [...deleted.document.blocks];
    blocks.splice(blockIndex, 1,
      { ...block, content: normalizeNgsHeadlessEditorTextContent(left) },
      { ...next, content: normalizeNgsHeadlessEditorTextContent(right) }
    );
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(next.id, 0),
      'keyboard'
    );
  }

  /**
   * Routes formatting (marks, stored marks, the selection used by mark commands
   * and insertText()) to a nested editor, such as the editor of a focused table
   * cell. Toolbar commands keep working unchanged: they run against this editor
   * and act on the nested one. Pass null to restore normal behavior. Block-level
   * operations are disabled while a target is active.
   */
  setInlineTarget(target: NgsHeadlessEditor | null): void {
    this._inlineTarget.set(target === this ? null : target);
  }

  /** Whether a mark can be applied at the current selection (registered, writable). */
  canApplyMark(type: string): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.canApplyMark(type);
    }
    this._plugins();
    return !this._readOnly() && this.marks.has(type);
  }

  /** Whether block operations such as toggleBlock() are possible right now. */
  canEditBlocks(): boolean {
    return !this._readOnly() && this._inlineTarget() === null;
  }

  toggleMark(type: string, attrs?: NgsHeadlessEditorMark['attrs']): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.toggleMark(type, attrs);
    }
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const mark: NgsHeadlessEditorMark = { type, attrs };
    const selection = this.ensureSelection();
    if (isCollapsed(selection)) {
      const current = this._storedMarks() ?? this.getMarksAtSelection();
      const active = current.some(item => item.type === type);
      this._storedMarks.set(active
        ? current.filter(item => item.type !== type)
        : normalizeNgsHeadlessEditorMarks([...current, mark])
      );
      return true;
    }

    const ordered = orderSelection(this._document(), selection);
    const blocks = this._document().blocks.map((block, blockIndex) => {
      if (
        blockIndex < ordered.startBlockIndex ||
        blockIndex > ordered.endBlockIndex ||
        !isNgsHeadlessEditorTextContent(block.content)
      ) {
        return block;
      }
      const from = blockIndex === ordered.startBlockIndex ? ordered.start.offset : 0;
      const to = blockIndex === ordered.endBlockIndex
        ? ordered.end.offset
        : textContentLength(block.content);
      return {
        ...block,
        content: toggleMarkInContent(block.content, from, to, mark)
      };
    });

    return this.commit({ version: 1, blocks }, selection, 'command');
  }

  isMarkActive(type: string): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.isMarkActive(type);
    }
    const selection = this._selection();
    if (!selection) {
      return false;
    }
    if (isCollapsed(selection)) {
      return this.getCollapsedMarks().some(mark => mark.type === type);
    }

    const ordered = orderSelection(this._document(), selection);
    for (let index = ordered.startBlockIndex; index <= ordered.endBlockIndex; index += 1) {
      const block = this._document().blocks[index];
      if (!block || !isNgsHeadlessEditorTextContent(block.content)) {
        return false;
      }
      const from = index === ordered.startBlockIndex ? ordered.start.offset : 0;
      const to = index === ordered.endBlockIndex ? ordered.end.offset : textContentLength(block.content);
      if (!contentRangeHasMark(block.content, from, to, type)) {
        return false;
      }
    }
    return true;
  }

  getActiveMark(type: string): NgsHeadlessEditorMark | undefined {
    const target = this._inlineTarget();
    if (target) {
      return target.getActiveMark(type);
    }
    const selection = this._selection();
    const marks = selection && isCollapsed(selection)
      ? this.getCollapsedMarks()
      : this.getMarksAtSelection();
    return marks.find(mark => mark.type === type);
  }

  setMark(type: string, attrs?: NgsHeadlessEditorMark['attrs']): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.setMark(type, attrs);
    }
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const selection = this.ensureSelection();
    const mark: NgsHeadlessEditorMark = { type, attrs };
    if (isCollapsed(selection)) {
      const current = this.getCollapsedMarks();
      this._storedMarks.set(normalizeNgsHeadlessEditorMarks([
        ...current.filter(item => item.type !== type),
        mark
      ]));
      return true;
    }

    return this.applyMarkToSelection(selection, mark);
  }

  unsetMark(type: string): boolean {
    const target = this._inlineTarget();
    if (target) {
      return target.unsetMark(type);
    }
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const selection = this.ensureSelection();
    if (isCollapsed(selection)) {
      const current = this.getCollapsedMarks();
      const next = current.filter(mark => mark.type !== type);
      if (next.length === current.length) {
        return false;
      }
      this._storedMarks.set(next);
      return true;
    }

    const ordered = orderSelection(this._document(), selection);
    const blocks = this._document().blocks.map((block, blockIndex) => {
      if (
        blockIndex < ordered.startBlockIndex ||
        blockIndex > ordered.endBlockIndex ||
        !isNgsHeadlessEditorTextContent(block.content)
      ) {
        return block;
      }
      const from = blockIndex === ordered.startBlockIndex ? ordered.start.offset : 0;
      const to = blockIndex === ordered.endBlockIndex
        ? ordered.end.offset
        : textContentLength(block.content);
      return {
        ...block,
        content: setMarkInContent(block.content, from, to, type)
      };
    });
    return this.commit({ version: 1, blocks }, selection, 'command');
  }

  toggleBlock(type: string, fallbackType = 'paragraph'): boolean {
    if (!this.canEditBlocks() || !this.blocks.has(type)) {
      return false;
    }
    const selection = this.ensureSelection();
    const ordered = orderSelection(this._document(), selection);
    const selected = this._document().blocks.slice(ordered.startBlockIndex, ordered.endBlockIndex + 1);
    const nextType = selected.every(block => block.type === type) ? fallbackType : type;
    if (!this.blocks.has(nextType)) {
      return false;
    }
    const blocks = this._document().blocks.map((block, blockIndex) => (
      blockIndex >= ordered.startBlockIndex && blockIndex <= ordered.endBlockIndex
        ? { ...block, type: nextType }
        : block
    ));
    return this.commit({ version: 1, blocks }, selection, 'command');
  }

  isBlockActive(type: string): boolean {
    const selection = this._selection();
    if (!selection || this._inlineTarget()) {
      return false;
    }
    const ordered = orderSelection(this._document(), selection);
    return this._document().blocks
      .slice(ordered.startBlockIndex, ordered.endBlockIndex + 1)
      .every(block => block.type === type);
  }

  /**
   * Inserts one or more blocks after the block that holds the caret, as one
   * undo step. With `selectInserted` the caret moves to the end of the last
   * inserted block.
   */
  insertBlock(
    block: NgsHeadlessEditorBlock | readonly NgsHeadlessEditorBlock[],
    selectInserted = false
  ): boolean {
    if (this._readOnly()) {
      return false;
    }
    const inserted = Array.isArray(block) ? block : [block as NgsHeadlessEditorBlock];
    if (inserted.length === 0) {
      return false;
    }
    const selection = this.ensureSelection();
    const focusIndex = this._document().blocks.findIndex(item => item.id === selection.focus.blockId);
    const blocks = [...this._document().blocks];
    blocks.splice(Math.max(0, focusIndex + 1), 0, ...inserted);
    const last = inserted[inserted.length - 1];
    const nextSelection = selectInserted
      ? collapsedSelection(last.id, getNgsHeadlessEditorBlockText(last).length)
      : selection;
    return this.commit({ version: 1, blocks }, nextSelection, 'command');
  }

  /**
   * Replaces a block with zero or more blocks as one undo step, for example to
   * turn an empty line into a table. The caret moves to `selection` when given.
   */
  replaceBlock(
    blockId: string,
    replacement: readonly NgsHeadlessEditorBlock[],
    selection?: NgsHeadlessEditorSelection
  ): boolean {
    if (this._readOnly()) {
      return false;
    }
    const index = this._document().blocks.findIndex(block => block.id === blockId);
    if (index < 0) {
      return false;
    }
    const blocks = [...this._document().blocks];
    blocks.splice(index, 1, ...replacement);
    const document = normalizeNgsHeadlessEditorDocument({ version: 1, blocks });
    const fallback = document.blocks[Math.min(index, document.blocks.length - 1)];
    return this.commit(document, selection ?? collapsedSelection(fallback.id, 0), 'command');
  }

  /**
   * Replaces type, content or attrs of a block. Updates that share a non-null
   * `historyGroup` in quick succession (for example typing in one table cell)
   * form a single undo step.
   */
  updateBlock(
    blockId: string,
    update: Partial<Pick<NgsHeadlessEditorBlock, 'type' | 'content' | 'attrs'>>,
    origin: NgsHeadlessEditorChangeOrigin = 'command',
    historyGroup: string | null = null
  ): boolean {
    if (this._readOnly()) {
      return false;
    }
    let found = false;
    const blocks = this._document().blocks.map(block => {
      if (block.id !== blockId) {
        return block;
      }
      found = true;
      return { ...block, ...update };
    });
    return found && this.commit({ version: 1, blocks }, this._selection(), origin, historyGroup);
  }

  removeBlock(blockId: string): boolean {
    if (this._readOnly()) {
      return false;
    }
    const index = this._document().blocks.findIndex(block => block.id === blockId);
    if (index < 0) {
      return false;
    }
    const blocks = this._document().blocks.filter(block => block.id !== blockId);
    const document = normalizeNgsHeadlessEditorDocument({ version: 1, blocks });
    const target = document.blocks[Math.min(index, document.blocks.length - 1)];
    return this.commit(document, collapsedSelection(target.id, 0), 'command');
  }

  commitDomDocument(document: NgsHeadlessEditorDocument, selection: NgsHeadlessEditorSelection | null): boolean {
    return this.commit(document, selection ?? firstSelection(document), 'composition');
  }

  undo(): boolean {
    const snapshot = this.history.undo({
      document: this._document(),
      selection: this._selection()
    });
    if (!snapshot) {
      return false;
    }
    this.restoreSnapshot(snapshot.document, snapshot.selection);
    return true;
  }

  redo(): boolean {
    const snapshot = this.history.redo({
      document: this._document(),
      selection: this._selection()
    });
    if (!snapshot) {
      return false;
    }
    this.restoreSnapshot(snapshot.document, snapshot.selection);
    return true;
  }

  clear(): void {
    this.commit(createNgsHeadlessEditorDocument(), null, 'api');
    this.history.clear();
  }

  /** Marks that apply at a collapsed caret, including pending stored marks. */
  private getCollapsedMarks(): readonly NgsHeadlessEditorMark[] {
    return this._storedMarks() ?? this.getMarksAtSelection();
  }

  private getMarksAtSelection(): readonly NgsHeadlessEditorMark[] {
    const selection = this.ensureSelection();
    const block = this._document().blocks.find(item => item.id === selection.focus.blockId);
    return block && isNgsHeadlessEditorTextContent(block.content)
      ? marksAtOffset(block.content, selection.focus.offset).filter(mark => !this.marks.get(mark.type)?.atomic)
      : [];
  }

  private applyMarkToSelection(selection: NgsHeadlessEditorSelection, mark: NgsHeadlessEditorMark): boolean {
    const ordered = orderSelection(this._document(), selection);
    const blocks = this._document().blocks.map((block, blockIndex) => {
      if (
        blockIndex < ordered.startBlockIndex ||
        blockIndex > ordered.endBlockIndex ||
        !isNgsHeadlessEditorTextContent(block.content)
      ) {
        return block;
      }
      const from = blockIndex === ordered.startBlockIndex ? ordered.start.offset : 0;
      const to = blockIndex === ordered.endBlockIndex
        ? ordered.end.offset
        : textContentLength(block.content);
      return {
        ...block,
        content: setMarkInContent(block.content, from, to, mark.type, mark)
      };
    });
    return this.commit({ version: 1, blocks }, selection, 'command');
  }

  private ensureSelection(): NgsHeadlessEditorSelection {
    return clampSelection(this._document(), this._selection() ?? firstSelection(this._document()), this.marks);
  }

  private commit(
    document: NgsHeadlessEditorDocument,
    selection: NgsHeadlessEditorSelection | null,
    origin: NgsHeadlessEditorChangeOrigin,
    historyGroup: string | null = null
  ): boolean {
    const normalized = normalizeNgsHeadlessEditorDocument(document);
    if (ngsHeadlessEditorDocumentsEqual(normalized, this._document())) {
      if (selection) {
        this.setSelection(selection);
      }
      return false;
    }

    this.history.record({
      document: this._document(),
      selection: this._selection()
    }, historyGroup);
    this._document.set(normalized);
    this._selection.set(selection ? clampSelection(normalized, selection, this.marks) : firstSelection(normalized));
    this._storedMarks.set(null);
    this._origin.set(origin);
    this._revision.update(revision => revision + 1);
    return true;
  }

  private restoreSnapshot(document: NgsHeadlessEditorDocument, selection: NgsHeadlessEditorSelection | null): void {
    this._document.set(document);
    this._selection.set(selection ? clampSelection(document, selection, this.marks) : firstSelection(document));
    this._storedMarks.set(null);
    this._origin.set('history');
    this._revision.update(revision => revision + 1);
  }

  private destroyPlugins(): void {
    for (const cleanup of this.pluginCleanups.splice(0)) {
      cleanup();
    }
  }
}

function samePluginSet(left: readonly NgsHeadlessEditorPlugin[], right: readonly NgsHeadlessEditorPlugin[]): boolean {
  return left.length === right.length && left.every((plugin, index) => plugin === right[index]);
}

function assertUnique(collection: Set<string> | Map<string, unknown>, id: string, kind: string): void {
  if (collection.has(id)) {
    throw new Error(`[NgsHeadlessEditor] Duplicate ${kind} id "${id}".`);
  }
  if (collection instanceof Set) {
    collection.add(id);
  }
}

/**
 * Returns lower-cased binding candidates for a keyboard event, most specific first.
 * `event.key` is layout dependent: Shift+7 produces "&", Option+C on macOS produces
 * "ç" and a Cyrillic layout produces "и" for the B key. The physical `event.code`
 * is used as a fallback so bindings like `Mod-Shift-7` and `Mod-b` still resolve.
 */
function eventToKeyBindings(event: KeyboardEvent): string[] {
  const modifiers: string[] = [];
  if (event.ctrlKey || event.metaKey) modifiers.push('mod');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');

  const keys: string[] = [];
  const add = (key: string | undefined) => {
    const normalized = key?.toLowerCase();
    if (normalized && !keys.includes(normalized)) {
      keys.push(normalized);
    }
  };
  add(event.key);
  const code = event.code ?? '';
  if (/^Key[A-Z]$/.test(code)) {
    add(code.slice(3));
  } else if (/^Digit\d$/.test(code)) {
    add(code.slice(5));
  }
  return keys.map(key => [...modifiers, key].join('-'));
}

function selectionsEqual(left: NgsHeadlessEditorSelection | null, right: NgsHeadlessEditorSelection | null): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return left.anchor.blockId === right.anchor.blockId &&
    left.anchor.offset === right.anchor.offset &&
    left.focus.blockId === right.focus.blockId &&
    left.focus.offset === right.focus.offset;
}

const graphemeSegmenter: Intl.Segmenter | null = typeof Intl !== 'undefined' && 'Segmenter' in Intl
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

/** Start offset of the user-perceived character before `offset` (emoji sequences, flags, combining marks). */
function previousGraphemeBoundary(text: string, offset: number): number {
  if (offset <= 0) {
    return 0;
  }
  if (graphemeSegmenter) {
    let start = 0;
    for (const segment of graphemeSegmenter.segment(text)) {
      if (segment.index >= offset) {
        break;
      }
      start = segment.index;
    }
    return start;
  }
  const previous = Array.from(text.slice(0, offset)).at(-1) ?? '';
  return offset - previous.length;
}

/** End offset of the user-perceived character after `offset`. */
function nextGraphemeBoundary(text: string, offset: number): number {
  if (offset >= text.length) {
    return text.length;
  }
  if (graphemeSegmenter) {
    for (const segment of graphemeSegmenter.segment(text)) {
      const end = segment.index + segment.segment.length;
      if (end > offset) {
        return end;
      }
    }
    return text.length;
  }
  const next = Array.from(text.slice(offset))[0] ?? '';
  return offset + next.length;
}

function graphemeCount(text: string): number {
  if (graphemeSegmenter) {
    let count = 0;
    for (const _segment of graphemeSegmenter.segment(text)) {
      count += 1;
    }
    return count;
  }
  return Array.from(text).length;
}

function firstSelection(document: NgsHeadlessEditorDocument): NgsHeadlessEditorSelection {
  const block = document.blocks[0];
  return collapsedSelection(block.id, 0);
}

function collapsedSelection(blockId: string, offset: number): NgsHeadlessEditorSelection {
  const point = { blockId, offset };
  return { anchor: point, focus: point };
}

function isCollapsed(selection: NgsHeadlessEditorSelection): boolean {
  return selection.anchor.blockId === selection.focus.blockId && selection.anchor.offset === selection.focus.offset;
}

function clampSelection(
  document: NgsHeadlessEditorDocument,
  selection: NgsHeadlessEditorSelection,
  marks: ReadonlyMap<string, NgsHeadlessEditorMarkDefinition>
): NgsHeadlessEditorSelection {
  const clamped = {
    anchor: clampPoint(document, selection.anchor),
    focus: clampPoint(document, selection.focus)
  };
  if (isCollapsed(clamped)) {
    const point = snapAtomicPoint(document, clamped.focus, marks, 'nearest');
    return { anchor: point, focus: point };
  }
  const ordered = orderSelection(document, clamped);
  const start = snapAtomicPoint(document, ordered.start, marks, 'start');
  const end = snapAtomicPoint(document, ordered.end, marks, 'end');
  return ordered.start === clamped.anchor ? { anchor: start, focus: end } : { anchor: end, focus: start };
}

/** Adjacent runs may share one token while having different surrounding formatting. */
function snapAtomicPoint(
  document: NgsHeadlessEditorDocument,
  point: NgsHeadlessEditorPoint,
  definitions: ReadonlyMap<string, NgsHeadlessEditorMarkDefinition>,
  bias: 'start' | 'end' | 'nearest'
): NgsHeadlessEditorPoint {
  const block = document.blocks.find(item => item.id === point.blockId);
  if (!block || !isNgsHeadlessEditorTextContent(block.content)) return point;
  const tokens: { from: number; to: number; mark: NgsHeadlessEditorMark }[] = [];
  let offset = 0;
  for (const run of block.content) {
    const mark = run.marks.find(item => definitions.get(item.type)?.atomic);
    if (mark) {
      const previous = tokens.at(-1);
      if (previous?.to === offset && ngsHeadlessEditorMarksEqual([previous.mark], [mark])) {
        previous.to += run.text.length;
      } else {
        tokens.push({ from: offset, to: offset + run.text.length, mark });
      }
    }
    offset += run.text.length;
  }
  const token = tokens.find(item => item.from < point.offset && point.offset < item.to);
  if (!token) return point;
  const toStart = bias === 'start' || (bias === 'nearest' && point.offset - token.from < token.to - point.offset);
  return { ...point, offset: toStart ? token.from : token.to };
}

function clampPoint(document: NgsHeadlessEditorDocument, point: NgsHeadlessEditorPoint): NgsHeadlessEditorPoint {
  const block = document.blocks.find(item => item.id === point.blockId) ?? document.blocks[0];
  return {
    blockId: block.id,
    offset: Math.max(0, Math.min(point.offset, getNgsHeadlessEditorBlockText(block).length))
  };
}

function orderSelection(document: NgsHeadlessEditorDocument, selection: NgsHeadlessEditorSelection) {
  const anchorIndex = document.blocks.findIndex(block => block.id === selection.anchor.blockId);
  const focusIndex = document.blocks.findIndex(block => block.id === selection.focus.blockId);
  const anchorFirst = anchorIndex < focusIndex || (
    anchorIndex === focusIndex && selection.anchor.offset <= selection.focus.offset
  );
  return {
    start: anchorFirst ? selection.anchor : selection.focus,
    end: anchorFirst ? selection.focus : selection.anchor,
    startBlockIndex: anchorFirst ? anchorIndex : focusIndex,
    endBlockIndex: anchorFirst ? focusIndex : anchorIndex
  };
}

/**
 * Removes the content between the selection points and returns the collapsed
 * caret. Blocks fully inside the range are removed. A non-text (atomic) block at
 * the start of the range is removed; one at the end is kept, because a point at
 * offset 0 of an atomic block sits before it.
 */
function deleteSelectedRange(document: NgsHeadlessEditorDocument, selection: NgsHeadlessEditorSelection) {
  if (isCollapsed(selection)) {
    return { document, selection };
  }
  const ordered = orderSelection(document, selection);
  const startBlock = document.blocks[ordered.startBlockIndex];
  const endBlock = document.blocks[ordered.endBlockIndex];
  if (!startBlock || !endBlock) {
    return { document, selection };
  }

  const endIsText = isNgsHeadlessEditorTextContent(endBlock.content);
  const after = isNgsHeadlessEditorTextContent(endBlock.content)
    ? sliceTextContent(endBlock.content, ordered.end.offset, textContentLength(endBlock.content))
    : [];
  const blocks = [...document.blocks];

  if (isNgsHeadlessEditorTextContent(startBlock.content)) {
    const before = sliceTextContent(startBlock.content, 0, ordered.start.offset);
    const removeCount = (endIsText ? ordered.endBlockIndex : ordered.endBlockIndex - 1) -
      ordered.startBlockIndex + 1;
    blocks.splice(ordered.startBlockIndex, removeCount, {
      ...startBlock,
      content: normalizeNgsHeadlessEditorTextContent([...before, ...after])
    });
    return {
      document: { version: 1 as const, blocks },
      selection: collapsedSelection(startBlock.id, ordered.start.offset)
    };
  }

  if (endIsText) {
    blocks.splice(
      ordered.startBlockIndex,
      ordered.endBlockIndex - ordered.startBlockIndex + 1,
      { ...endBlock, content: normalizeNgsHeadlessEditorTextContent(after) }
    );
    return {
      document: { version: 1 as const, blocks },
      selection: collapsedSelection(endBlock.id, 0)
    };
  }

  // Both ends are atomic blocks: drop everything before the end block and leave
  // an empty paragraph for the caret.
  const paragraph = createNgsHeadlessEditorParagraph();
  blocks.splice(
    ordered.startBlockIndex,
    ordered.endBlockIndex - ordered.startBlockIndex,
    paragraph
  );
  return {
    document: { version: 1 as const, blocks },
    selection: collapsedSelection(paragraph.id, 0)
  };
}

function textContentLength(content: readonly NgsHeadlessEditorText[]): number {
  return content.reduce((length, run) => length + run.text.length, 0);
}

function sliceTextContent(
  content: readonly NgsHeadlessEditorText[],
  from: number,
  to: number
): readonly NgsHeadlessEditorText[] {
  const result: NgsHeadlessEditorText[] = [];
  let offset = 0;
  for (const run of content) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    const start = Math.max(from, runStart);
    const end = Math.min(to, runEnd);
    if (start < end) {
      result.push(createNgsHeadlessEditorText(
        run.text.slice(start - runStart, end - runStart),
        run.marks
      ));
    }
    offset = runEnd;
  }
  return result;
}

function marksAtOffset(content: readonly NgsHeadlessEditorText[], offset: number): readonly NgsHeadlessEditorMark[] {
  let currentOffset = 0;
  for (const run of content) {
    const end = currentOffset + run.text.length;
    if (offset > currentOffset && offset <= end) {
      return run.marks;
    }
    if (offset === currentOffset && currentOffset === 0) {
      return run.marks;
    }
    currentOffset = end;
  }
  return content.at(-1)?.marks ?? [];
}

function toggleMarkInContent(
  content: readonly NgsHeadlessEditorText[],
  from: number,
  to: number,
  mark: NgsHeadlessEditorMark
): readonly NgsHeadlessEditorText[] {
  const remove = contentRangeHasMark(content, from, to, mark.type);
  const result: NgsHeadlessEditorText[] = [];
  let offset = 0;
  for (const run of content) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    const overlapStart = Math.max(from, runStart);
    const overlapEnd = Math.min(to, runEnd);
    if (overlapStart >= overlapEnd) {
      result.push(run);
      offset = runEnd;
      continue;
    }
    if (runStart < overlapStart) {
      result.push(createNgsHeadlessEditorText(run.text.slice(0, overlapStart - runStart), run.marks));
    }
    const marks = remove
      ? run.marks.filter(item => item.type !== mark.type)
      : normalizeNgsHeadlessEditorMarks([...run.marks.filter(item => item.type !== mark.type), mark]);
    result.push(createNgsHeadlessEditorText(
      run.text.slice(overlapStart - runStart, overlapEnd - runStart),
      marks
    ));
    if (overlapEnd < runEnd) {
      result.push(createNgsHeadlessEditorText(run.text.slice(overlapEnd - runStart), run.marks));
    }
    offset = runEnd;
  }
  return normalizeNgsHeadlessEditorTextContent(result);
}

function setMarkInContent(
  content: readonly NgsHeadlessEditorText[],
  from: number,
  to: number,
  type: string,
  mark?: NgsHeadlessEditorMark
): readonly NgsHeadlessEditorText[] {
  const result: NgsHeadlessEditorText[] = [];
  let offset = 0;
  for (const run of content) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    const overlapStart = Math.max(from, runStart);
    const overlapEnd = Math.min(to, runEnd);
    if (overlapStart >= overlapEnd) {
      result.push(run);
      offset = runEnd;
      continue;
    }
    if (runStart < overlapStart) {
      result.push(createNgsHeadlessEditorText(run.text.slice(0, overlapStart - runStart), run.marks));
    }
    const marks = mark
      ? normalizeNgsHeadlessEditorMarks([...run.marks.filter(item => item.type !== type), mark])
      : run.marks.filter(item => item.type !== type);
    result.push(createNgsHeadlessEditorText(
      run.text.slice(overlapStart - runStart, overlapEnd - runStart),
      marks
    ));
    if (overlapEnd < runEnd) {
      result.push(createNgsHeadlessEditorText(run.text.slice(overlapEnd - runStart), run.marks));
    }
    offset = runEnd;
  }
  return normalizeNgsHeadlessEditorTextContent(result);
}

function contentRangeHasMark(
  content: readonly NgsHeadlessEditorText[],
  from: number,
  to: number,
  type: string
): boolean {
  if (from === to) {
    return marksAtOffset(content, from).some(mark => mark.type === type);
  }
  let offset = 0;
  let foundText = false;
  for (const run of content) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    if (Math.max(from, runStart) < Math.min(to, runEnd)) {
      foundText = true;
      if (!run.marks.some(mark => mark.type === type)) {
        return false;
      }
    }
    offset = runEnd;
  }
  return foundText;
}
