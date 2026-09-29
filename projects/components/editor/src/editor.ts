import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  InjectionToken,
  Provider,
  signal
} from '@angular/core';
import { NgsEditorHistory } from './history';
import {
  cloneNgsEditorDocument,
  createNgsEditorDocument,
  createNgsEditorParagraph,
  createNgsEditorText,
  getNgsEditorBlockText,
  isNgsEditorTextContent,
  NgsEditorBlock,
  NgsEditorDocument,
  NgsEditorMark,
  NgsEditorPoint,
  NgsEditorSelection,
  NgsEditorText,
  ngsEditorDocumentsEqual,
  ngsEditorMarksEqual,
  normalizeNgsEditorDocument,
  normalizeNgsEditorMarks,
  normalizeNgsEditorTextContent
} from './model';
import {
  NgsEditorBlockDefinition,
  NgsEditorCommand,
  NgsEditorFeature,
  NgsEditorKeyBinding,
  NgsEditorMarkDefinition,
  NgsEditorPlugin
} from './plugin';

export type NgsEditorChangeOrigin = 'external' | 'api' | 'keyboard' | 'paste' | 'composition' | 'history' | 'command';

export const NGS_EDITOR_PLUGINS = new InjectionToken<readonly NgsEditorPlugin[]>('NGS_EDITOR_PLUGINS');

export function provideNgsEditor(...features: readonly NgsEditorFeature[]): Provider[] {
  const plugins = features.map(feature => feature.plugin);
  return [
    NgsEditorHistory,
    NgsEditor,
    ...plugins.flatMap(plugin => plugin.providers ?? []),
    {
      provide: NGS_EDITOR_PLUGINS,
      useValue: plugins
    }
  ];
}

@Injectable()
export class NgsEditor {
  private readonly history = inject(NgsEditorHistory);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injectedPlugins = inject(NGS_EDITOR_PLUGINS, { optional: true }) ?? [];

  private readonly _document = signal<NgsEditorDocument>(createNgsEditorDocument());
  private readonly _selection = signal<NgsEditorSelection | null>(null);
  private readonly _storedMarks = signal<readonly NgsEditorMark[]>([]);
  private readonly _focused = signal(false);
  private readonly _composing = signal(false);
  private readonly _readOnly = signal(false);
  private readonly _revision = signal(0);
  private readonly _origin = signal<NgsEditorChangeOrigin>('external');
  private readonly _plugins = signal<readonly NgsEditorPlugin[]>([]);

  private readonly commands = new Map<string, NgsEditorCommand<unknown>>();
  private readonly marks = new Map<string, NgsEditorMarkDefinition>();
  private readonly blocks = new Map<string, NgsEditorBlockDefinition>();
  private keymap: readonly NgsEditorKeyBinding[] = [];
  private pluginCleanups: Array<() => void> = [];

  readonly document = this._document.asReadonly();
  readonly selection = this._selection.asReadonly();
  readonly storedMarks = this._storedMarks.asReadonly();
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
        : getNgsEditorBlockText(block).trim().length === 0;
    });
  });
  readonly canUndo = this.history.canUndo;
  readonly canRedo = this.history.canRedo;

  constructor() {
    this.setPlugins(this.injectedPlugins);
    this.destroyRef.onDestroy(() => this.destroyPlugins());
  }

  setPlugins(plugins: readonly NgsEditorPlugin[]): void {
    if (samePluginSet(this._plugins(), plugins)) {
      return;
    }

    const pluginIds = new Set<string>();
    const commands = new Map<string, NgsEditorCommand<unknown>>();
    const marks = new Map<string, NgsEditorMarkDefinition>();
    const blocks = new Map<string, NgsEditorBlockDefinition>();
    const keymap: NgsEditorKeyBinding[] = [];

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

  getMarkDefinition(type: string): NgsEditorMarkDefinition | undefined {
    return this.marks.get(type);
  }

  getMarkDefinitions(): readonly NgsEditorMarkDefinition[] {
    return [...this.marks.values()];
  }

  getBlockDefinition(type: string): NgsEditorBlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getBlockDefinitions(): readonly NgsEditorBlockDefinition[] {
    return [...this.blocks.values()];
  }

  setDocument(document: NgsEditorDocument, resetHistory = true): void {
    const normalized = normalizeNgsEditorDocument(document);
    if (ngsEditorDocumentsEqual(this._document(), normalized)) {
      return;
    }

    this._document.set(cloneNgsEditorDocument(normalized));
    this._selection.set(firstSelection(normalized));
    this._storedMarks.set([]);
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

  setSelection(selection: NgsEditorSelection | null): void {
    this._selection.set(selection ? clampSelection(this._document(), selection) : null);
    if (selection && !isCollapsed(selection)) {
      this._storedMarks.set([]);
    }
  }

  execute<TPayload>(command: NgsEditorCommand<TPayload> | string, payload?: TPayload): boolean {
    const resolved = typeof command === 'string'
      ? this.commands.get(command) as NgsEditorCommand<TPayload> | undefined
      : command;

    if (!resolved || this._readOnly() || resolved.enabled?.(this, payload as TPayload) === false) {
      return false;
    }

    const executed = resolved.execute(this, payload as TPayload);
    if (executed) {
      this._origin.set('command');
    }
    return executed;
  }

  isCommandEnabled<TPayload>(command: NgsEditorCommand<TPayload>, payload?: TPayload): boolean {
    return !this._readOnly() && (command.enabled?.(this, payload as TPayload) ?? true);
  }

  isCommandActive<TPayload>(command: NgsEditorCommand<TPayload>, payload?: TPayload): boolean {
    return command.active?.(this, payload as TPayload) ?? false;
  }

  handleKeydown(event: KeyboardEvent): boolean {
    const key = eventToKeyBinding(event);
    const binding = this.keymap.find(item => item.key.toLowerCase() === key.toLowerCase());
    return binding ? this.execute(binding.command, binding.payload) : false;
  }

  handlePaste(event: ClipboardEvent): boolean {
    for (const plugin of this._plugins()) {
      if (plugin.handlePaste?.(event, this)) {
        return true;
      }
    }
    return false;
  }

  insertText(text: string, origin: NgsEditorChangeOrigin = 'keyboard'): boolean {
    if (this._readOnly() || text.length === 0) {
      return false;
    }

    const base = deleteSelectedRange(this._document(), this.ensureSelection());
    const selection = base.selection;
    const point = selection.focus;
    const blockIndex = base.document.blocks.findIndex(block => block.id === point.blockId);
    if (blockIndex < 0) {
      return false;
    }

    const block = base.document.blocks[blockIndex];
    if (!isNgsEditorTextContent(block.content)) {
      return false;
    }

    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const marks = this._storedMarks().length > 0
      ? this._storedMarks()
      : marksAtOffset(block.content, point.offset);
    const before = sliceTextContent(block.content, 0, point.offset);
    const after = sliceTextContent(block.content, point.offset, textContentLength(block.content));
    const blocks = [...base.document.blocks];

    if (lines.length === 1) {
      blocks[blockIndex] = {
        ...block,
        content: normalizeNgsEditorTextContent([
          ...before,
          createNgsEditorText(lines[0], marks),
          ...after
        ])
      };
      const offset = point.offset + lines[0].length;
      return this.commit(
        { version: 1, blocks },
        collapsedSelection(block.id, offset),
        origin
      );
    }

    const insertedBlocks: NgsEditorBlock[] = lines.map((line, index) => {
      if (index === 0) {
        return {
          ...block,
          content: normalizeNgsEditorTextContent([...before, createNgsEditorText(line, marks)])
        };
      }
      if (index === lines.length - 1) {
        return {
          ...createNgsEditorParagraph(),
          content: normalizeNgsEditorTextContent([createNgsEditorText(line, marks), ...after])
        };
      }
      return createNgsEditorParagraph(line, marks);
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
      const deleted = deleteSelectedRange(this._document(), selection);
      return this.commit(deleted.document, deleted.selection, 'keyboard');
    }

    const point = selection.focus;
    const blockIndex = this._document().blocks.findIndex(block => block.id === point.blockId);
    const block = this._document().blocks[blockIndex];
    if (!block || !isNgsEditorTextContent(block.content)) {
      return false;
    }

    if (point.offset > 0) {
      const text = getNgsEditorBlockText(block);
      const previousCharacter = Array.from(text.slice(0, point.offset)).at(-1) ?? '';
      const start = point.offset - previousCharacter.length;
      return this.deleteRange({
        anchor: { blockId: block.id, offset: start },
        focus: point
      }, 'keyboard');
    }

    if (blockIndex === 0) {
      return false;
    }

    const previous = this._document().blocks[blockIndex - 1];
    if (!isNgsEditorTextContent(previous.content)) {
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
      content: normalizeNgsEditorTextContent([...previous.content, ...block.content])
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
    if (!block || !isNgsEditorTextContent(block.content)) {
      return false;
    }
    const text = getNgsEditorBlockText(block);

    if (point.offset < text.length) {
      const nextCharacter = Array.from(text.slice(point.offset))[0] ?? '';
      return this.deleteRange({
        anchor: point,
        focus: { blockId: block.id, offset: point.offset + nextCharacter.length }
      }, 'keyboard');
    }

    const next = this._document().blocks[blockIndex + 1];
    if (!next) {
      return false;
    }
    if (!isNgsEditorTextContent(next.content)) {
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
      content: normalizeNgsEditorTextContent([...block.content, ...next.content])
    });
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(block.id, point.offset),
      'keyboard'
    );
  }

  deleteRange(selection: NgsEditorSelection, origin: NgsEditorChangeOrigin): boolean {
    const deleted = deleteSelectedRange(this._document(), selection);
    if (ngsEditorDocumentsEqual(deleted.document, this._document())) {
      return false;
    }
    return this.commit(deleted.document, deleted.selection, origin);
  }

  splitBlock(): boolean {
    if (this._readOnly()) {
      return false;
    }

    const deleted = deleteSelectedRange(this._document(), this.ensureSelection());
    const point = deleted.selection.focus;
    const blockIndex = deleted.document.blocks.findIndex(block => block.id === point.blockId);
    const block = deleted.document.blocks[blockIndex];
    if (!block || !isNgsEditorTextContent(block.content)) {
      return false;
    }

    const left = sliceTextContent(block.content, 0, point.offset);
    const right = sliceTextContent(block.content, point.offset, textContentLength(block.content));
    const next = this.blocks.get(block.type)?.create() ?? createNgsEditorParagraph();
    const blocks = [...deleted.document.blocks];
    blocks.splice(blockIndex, 1,
      { ...block, content: normalizeNgsEditorTextContent(left) },
      { ...next, content: normalizeNgsEditorTextContent(right) }
    );
    return this.commit(
      { version: 1, blocks },
      collapsedSelection(next.id, 0),
      'keyboard'
    );
  }

  toggleMark(type: string, attrs?: NgsEditorMark['attrs']): boolean {
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const mark: NgsEditorMark = { type, attrs };
    const selection = this.ensureSelection();
    if (isCollapsed(selection)) {
      const current = this._storedMarks().length > 0
        ? this._storedMarks()
        : this.getMarksAtSelection();
      const active = current.some(item => item.type === type);
      this._storedMarks.set(active
        ? current.filter(item => item.type !== type)
        : normalizeNgsEditorMarks([...current, mark])
      );
      return true;
    }

    const ordered = orderSelection(this._document(), selection);
    const blocks = this._document().blocks.map(block => {
      const blockIndex = this._document().blocks.findIndex(item => item.id === block.id);
      if (
        blockIndex < ordered.startBlockIndex ||
        blockIndex > ordered.endBlockIndex ||
        !isNgsEditorTextContent(block.content)
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
    const selection = this._selection();
    if (!selection) {
      return false;
    }
    if (isCollapsed(selection)) {
      return this.getMarksAtSelection().some(mark => mark.type === type);
    }

    const ordered = orderSelection(this._document(), selection);
    for (let index = ordered.startBlockIndex; index <= ordered.endBlockIndex; index += 1) {
      const block = this._document().blocks[index];
      if (!block || !isNgsEditorTextContent(block.content)) {
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

  getActiveMark(type: string): NgsEditorMark | undefined {
    return this.getMarksAtSelection().find(mark => mark.type === type);
  }

  setMark(type: string, attrs?: NgsEditorMark['attrs']): boolean {
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const selection = this.ensureSelection();
    const mark: NgsEditorMark = { type, attrs };
    if (isCollapsed(selection)) {
      const current = this._storedMarks().length > 0
        ? this._storedMarks()
        : this.getMarksAtSelection();
      this._storedMarks.set(normalizeNgsEditorMarks([
        ...current.filter(item => item.type !== type),
        mark
      ]));
      return true;
    }

    return this.applyMarkToSelection(selection, mark);
  }

  unsetMark(type: string): boolean {
    if (this._readOnly() || !this.marks.has(type)) {
      return false;
    }

    const selection = this.ensureSelection();
    if (isCollapsed(selection)) {
      const current = this._storedMarks().length > 0
        ? this._storedMarks()
        : this.getMarksAtSelection();
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
        !isNgsEditorTextContent(block.content)
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
    if (this._readOnly() || !this.blocks.has(type)) {
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
    if (!selection) {
      return false;
    }
    const ordered = orderSelection(this._document(), selection);
    return this._document().blocks
      .slice(ordered.startBlockIndex, ordered.endBlockIndex + 1)
      .every(block => block.type === type);
  }

  insertBlock(block: NgsEditorBlock, selectInserted = false): boolean {
    if (this._readOnly()) {
      return false;
    }
    const selection = this.ensureSelection();
    const focusIndex = this._document().blocks.findIndex(item => item.id === selection.focus.blockId);
    const blocks = [...this._document().blocks];
    blocks.splice(Math.max(0, focusIndex + 1), 0, block);
    const nextSelection = selectInserted
      ? collapsedSelection(block.id, getNgsEditorBlockText(block).length)
      : selection;
    return this.commit({ version: 1, blocks }, nextSelection, 'command');
  }

  updateBlock(
    blockId: string,
    update: Partial<Pick<NgsEditorBlock, 'type' | 'content' | 'attrs'>>,
    origin: NgsEditorChangeOrigin = 'command'
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
    return found && this.commit({ version: 1, blocks }, this._selection(), origin);
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
    const document = normalizeNgsEditorDocument({ version: 1, blocks });
    const target = document.blocks[Math.min(index, document.blocks.length - 1)];
    return this.commit(document, collapsedSelection(target.id, 0), 'command');
  }

  commitDomDocument(document: NgsEditorDocument, selection: NgsEditorSelection | null): boolean {
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
    this.commit(createNgsEditorDocument(), null, 'api');
    this.history.clear();
  }

  private getMarksAtSelection(): readonly NgsEditorMark[] {
    const selection = this.ensureSelection();
    const block = this._document().blocks.find(item => item.id === selection.focus.blockId);
    return block && isNgsEditorTextContent(block.content)
      ? marksAtOffset(block.content, selection.focus.offset)
      : [];
  }

  private applyMarkToSelection(selection: NgsEditorSelection, mark: NgsEditorMark): boolean {
    const ordered = orderSelection(this._document(), selection);
    const blocks = this._document().blocks.map((block, blockIndex) => {
      if (
        blockIndex < ordered.startBlockIndex ||
        blockIndex > ordered.endBlockIndex ||
        !isNgsEditorTextContent(block.content)
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

  private ensureSelection(): NgsEditorSelection {
    return this._selection() ?? firstSelection(this._document());
  }

  private commit(
    document: NgsEditorDocument,
    selection: NgsEditorSelection | null,
    origin: NgsEditorChangeOrigin
  ): boolean {
    const normalized = normalizeNgsEditorDocument(document);
    if (ngsEditorDocumentsEqual(normalized, this._document())) {
      if (selection) {
        this.setSelection(selection);
      }
      return false;
    }

    this.history.record({
      document: this._document(),
      selection: this._selection()
    });
    this._document.set(normalized);
    this._selection.set(selection ? clampSelection(normalized, selection) : firstSelection(normalized));
    this._origin.set(origin);
    this._revision.update(revision => revision + 1);
    return true;
  }

  private restoreSnapshot(document: NgsEditorDocument, selection: NgsEditorSelection | null): void {
    this._document.set(cloneNgsEditorDocument(document));
    this._selection.set(selection ? clampSelection(document, selection) : firstSelection(document));
    this._origin.set('history');
    this._revision.update(revision => revision + 1);
  }

  private destroyPlugins(): void {
    for (const cleanup of this.pluginCleanups.splice(0)) {
      cleanup();
    }
  }
}

function samePluginSet(left: readonly NgsEditorPlugin[], right: readonly NgsEditorPlugin[]): boolean {
  return left.length === right.length && left.every((plugin, index) => plugin === right[index]);
}

function assertUnique(collection: Set<string> | Map<string, unknown>, id: string, kind: string): void {
  if (collection.has(id)) {
    throw new Error(`[NgsEditor] Duplicate ${kind} id "${id}".`);
  }
  if (collection instanceof Set) {
    collection.add(id);
  }
}

function eventToKeyBinding(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push('Mod');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  parts.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  return parts.join('-');
}

function firstSelection(document: NgsEditorDocument): NgsEditorSelection {
  const block = document.blocks[0];
  return collapsedSelection(block.id, 0);
}

function collapsedSelection(blockId: string, offset: number): NgsEditorSelection {
  const point = { blockId, offset };
  return { anchor: point, focus: point };
}

function isCollapsed(selection: NgsEditorSelection): boolean {
  return selection.anchor.blockId === selection.focus.blockId && selection.anchor.offset === selection.focus.offset;
}

function clampSelection(document: NgsEditorDocument, selection: NgsEditorSelection): NgsEditorSelection {
  return {
    anchor: clampPoint(document, selection.anchor),
    focus: clampPoint(document, selection.focus)
  };
}

function clampPoint(document: NgsEditorDocument, point: NgsEditorPoint): NgsEditorPoint {
  const block = document.blocks.find(item => item.id === point.blockId) ?? document.blocks[0];
  return {
    blockId: block.id,
    offset: Math.max(0, Math.min(point.offset, getNgsEditorBlockText(block).length))
  };
}

function orderSelection(document: NgsEditorDocument, selection: NgsEditorSelection) {
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

function deleteSelectedRange(document: NgsEditorDocument, selection: NgsEditorSelection) {
  if (isCollapsed(selection)) {
    return { document, selection };
  }
  const ordered = orderSelection(document, selection);
  const startBlock = document.blocks[ordered.startBlockIndex];
  const endBlock = document.blocks[ordered.endBlockIndex];
  if (
    !startBlock || !endBlock ||
    !isNgsEditorTextContent(startBlock.content) ||
    !isNgsEditorTextContent(endBlock.content)
  ) {
    return { document, selection };
  }

  const before = sliceTextContent(startBlock.content, 0, ordered.start.offset);
  const after = sliceTextContent(
    endBlock.content,
    ordered.end.offset,
    textContentLength(endBlock.content)
  );
  const blocks = [...document.blocks];
  blocks.splice(
    ordered.startBlockIndex,
    ordered.endBlockIndex - ordered.startBlockIndex + 1,
    {
      ...startBlock,
      content: normalizeNgsEditorTextContent([...before, ...after])
    }
  );
  return {
    document: { version: 1 as const, blocks },
    selection: collapsedSelection(startBlock.id, ordered.start.offset)
  };
}

function textContentLength(content: readonly NgsEditorText[]): number {
  return content.reduce((length, run) => length + run.text.length, 0);
}

function sliceTextContent(
  content: readonly NgsEditorText[],
  from: number,
  to: number
): readonly NgsEditorText[] {
  const result: NgsEditorText[] = [];
  let offset = 0;
  for (const run of content) {
    const runStart = offset;
    const runEnd = offset + run.text.length;
    const start = Math.max(from, runStart);
    const end = Math.min(to, runEnd);
    if (start < end) {
      result.push(createNgsEditorText(
        run.text.slice(start - runStart, end - runStart),
        run.marks
      ));
    }
    offset = runEnd;
  }
  return result;
}

function marksAtOffset(content: readonly NgsEditorText[], offset: number): readonly NgsEditorMark[] {
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
  content: readonly NgsEditorText[],
  from: number,
  to: number,
  mark: NgsEditorMark
): readonly NgsEditorText[] {
  const remove = contentRangeHasMark(content, from, to, mark.type);
  const result: NgsEditorText[] = [];
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
      result.push(createNgsEditorText(run.text.slice(0, overlapStart - runStart), run.marks));
    }
    const marks = remove
      ? run.marks.filter(item => item.type !== mark.type)
      : normalizeNgsEditorMarks([...run.marks.filter(item => item.type !== mark.type), mark]);
    result.push(createNgsEditorText(
      run.text.slice(overlapStart - runStart, overlapEnd - runStart),
      marks
    ));
    if (overlapEnd < runEnd) {
      result.push(createNgsEditorText(run.text.slice(overlapEnd - runStart), run.marks));
    }
    offset = runEnd;
  }
  return normalizeNgsEditorTextContent(result);
}

function setMarkInContent(
  content: readonly NgsEditorText[],
  from: number,
  to: number,
  type: string,
  mark?: NgsEditorMark
): readonly NgsEditorText[] {
  const result: NgsEditorText[] = [];
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
      result.push(createNgsEditorText(run.text.slice(0, overlapStart - runStart), run.marks));
    }
    const marks = mark
      ? normalizeNgsEditorMarks([...run.marks.filter(item => item.type !== type), mark])
      : run.marks.filter(item => item.type !== type);
    result.push(createNgsEditorText(
      run.text.slice(overlapStart - runStart, overlapEnd - runStart),
      marks
    ));
    if (overlapEnd < runEnd) {
      result.push(createNgsEditorText(run.text.slice(overlapEnd - runStart), run.marks));
    }
    offset = runEnd;
  }
  return normalizeNgsEditorTextContent(result);
}

function contentRangeHasMark(
  content: readonly NgsEditorText[],
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
