import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

interface EditorApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

interface EditorApiSection {
  readonly title: string;
  readonly description: string;
  readonly rows: readonly EditorApiRow[];
}

@Component({
  selector: 'app-api',
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Table,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    Cell,
    CellDef,
    HeaderRow,
    HeaderRowDef,
    Row,
    RowDef
  ],
  templateUrl: './api.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Api {
  readonly sections: readonly EditorApiSection[] = [
    {
      title: 'Setup and plugin registration',
      description: 'Public functions used to create a scoped editor and compose its feature set.',
      rows: [
        {
          name: 'provideNgsHeadlessEditor(...features)',
          type: 'Provider[]',
          default: 'required',
          description: 'Provides one scoped NgsHeadlessEditor, its snapshot history, plugin providers, and the initial plugin set.'
        },
        {
          name: 'withHeadlessEditorPlugin(plugin)',
          type: 'NgsHeadlessEditorFeature',
          default: '—',
          description: 'Wraps a plugin for provideNgsHeadlessEditor(). Use this path when the plugin declares Angular providers.'
        },
        {
          name: 'defineNgsHeadlessEditorPlugin(plugin)',
          type: 'NgsHeadlessEditorPlugin',
          default: '—',
          description: 'Typed identity helper for declaring blocks, marks, commands, keymaps, providers, paste handling, and setup.'
        },
        {
          name: 'basicTextEditorPlugin()',
          type: 'NgsHeadlessEditorPlugin',
          default: 'not installed automatically',
          description: 'Creates the paragraph/text preset with bold, italic, strike, and inline-code marks and shortcuts.'
        },
        {
          name: 'colorEditorPlugin()',
          type: 'NgsHeadlessEditorPlugin',
          default: 'not installed automatically',
          description: 'Adds independent textColor and backgroundColor marks plus typed commands to set or remove either color.'
        }
      ]
    },
    {
      title: 'NgsHeadlessEditor signals',
      description: 'Readonly signal state exposed by the editor service.',
      rows: [
        { name: 'document', type: 'Signal<NgsHeadlessEditorDocument>', default: 'empty paragraph', description: 'Current normalized JSON document.' },
        { name: 'selection', type: 'Signal<NgsHeadlessEditorSelection | null>', default: 'null', description: 'Anchor and focus positions expressed as block IDs and text offsets.' },
        { name: 'storedMarks', type: 'Signal<readonly NgsHeadlessEditorMark[]>', default: '[]', description: 'Marks that will be applied to text inserted at a collapsed selection.' },
        { name: 'NgsHeadlessEditorChangeOrigin', type: "'external' | 'api' | 'keyboard' | 'paste' | 'composition' | 'history' | 'command'", default: '—', description: 'Values of the origin signal. external marks documents loaded with setDocument().' },
        { name: 'focused', type: 'Signal<boolean>', default: 'false', description: 'Whether an attached editor surface currently has focus.' },
        { name: 'composing', type: 'Signal<boolean>', default: 'false', description: 'Whether an IME composition session is active.' },
        { name: 'readOnly', type: 'Signal<boolean>', default: 'false', description: 'Prevents commands and editing operations from mutating the document.' },
        { name: 'revision', type: 'Signal<number>', default: '0', description: 'Monotonic document revision used by surfaces to schedule rendering.' },
        { name: 'origin', type: 'Signal<NgsHeadlessEditorChangeOrigin>', default: 'external', description: 'Origin of the last document change: external, api, keyboard, paste, composition, history, or command.' },
        { name: 'plugins', type: 'Signal<readonly NgsHeadlessEditorPlugin[]>', default: 'provided plugins', description: 'Currently installed plugin instances in execution order.' },
        { name: 'empty', type: 'Signal<boolean>', default: 'true', description: 'True when normalized document text contains no non-whitespace characters.' },
        { name: 'canUndo', type: 'Signal<boolean>', default: 'false', description: 'Whether a previous snapshot is available.' },
        { name: 'canRedo', type: 'Signal<boolean>', default: 'false', description: 'Whether a forward snapshot is available.' },
        { name: 'inlineTarget', type: 'Signal<NgsHeadlessEditor | null>', default: 'null', description: 'Nested editor (for example the focused table cell) that currently receives formatting.' },
      ]
    },
    {
      title: 'NgsHeadlessEditor methods',
      description: 'State transitions and extension lookup methods available to custom shells and plugins.',
      rows: [
        { name: 'setPlugins(plugins)', type: 'void', default: '—', description: 'Atomically validates and replaces the plugin set. Duplicate plugin, command, mark, or block IDs throw without corrupting the current registry.' },
        { name: 'getMarkDefinition(type)', type: 'NgsHeadlessEditorMarkDefinition | undefined', default: '—', description: 'Looks up one registered mark definition.' },
        { name: 'getMarkDefinitions()', type: 'readonly NgsHeadlessEditorMarkDefinition[]', default: '—', description: 'Returns every registered mark definition.' },
        { name: 'getBlockDefinition(type)', type: 'NgsHeadlessEditorBlockDefinition | undefined', default: '—', description: 'Looks up one registered block definition.' },
        { name: 'getBlockDefinitions()', type: 'readonly NgsHeadlessEditorBlockDefinition[]', default: '—', description: 'Returns every registered block definition.' },
        { name: 'setDocument(document, resetHistory?)', type: 'void', default: 'resetHistory: true', description: 'Normalizes and installs an external JSON document, resets selection and stored marks, and optionally clears history.' },
        { name: 'setReadOnly(readOnly)', type: 'void', default: '—', description: 'Updates the read-only signal.' },
        { name: 'setFocused(focused)', type: 'void', default: '—', description: 'Updates focus state. NgsHeadlessEditorSurface calls this automatically.' },
        { name: 'setComposing(composing)', type: 'void', default: '—', description: 'Updates IME composition state. NgsHeadlessEditorSurface calls this automatically.' },
        { name: 'setSelection(selection)', type: 'void', default: '—', description: 'Clamps and stores a JSON selection, or clears it with null.' },
        { name: 'setInlineTarget(editor | null)', type: 'void', default: '—', description: 'Routes marks, stored marks, selection and insertText() to a nested editor. Block operations are disabled while a target is active. Used by NgsHeadlessEditorInlineRegion.' },
        { name: 'canApplyMark(type)', type: 'boolean', default: '—', description: 'Whether a mark can be applied at the current selection, in this editor or in the inline target. Use it in enabled predicates of formatting commands.' },
        { name: 'canEditBlocks()', type: 'boolean', default: '—', description: 'False while read-only or while an inline target is active. Use it in enabled predicates of block commands.' },
        { name: 'execute(command, payload?)', type: 'boolean', default: '—', description: 'Executes a typed command object or registered command ID when enabled and writable.' },
        { name: 'isCommandEnabled(command, payload?)', type: 'boolean', default: '—', description: 'Evaluates command availability against current editor state.' },
        { name: 'isCommandActive(command, payload?)', type: 'boolean', default: '—', description: 'Evaluates command active state for toolbar controls.' },
        { name: 'handleKeydown(event)', type: 'boolean', default: '—', description: 'Resolves normalized Mod, Alt, and Shift key bindings in plugin order, falling back to the physical key (event.code) for layout-dependent keys. Handles Mod-z, Mod-Shift-z and Mod-y as undo/redo.' },
        { name: 'handlePaste(event)', type: 'boolean', default: '—', description: 'Runs plugin paste handlers in order and stops at the first handler that returns true.' },
        { name: 'insertText(text, origin?)', type: 'boolean', default: 'origin: keyboard', description: 'Replaces the current selection, preserves applicable marks, and converts newlines into paragraph blocks.' },
        { name: 'deleteBackward()', type: 'boolean', default: '—', description: 'Deletes the selection or previous Unicode character and merges paragraphs at a block boundary.' },
        { name: 'deleteForward()', type: 'boolean', default: '—', description: 'Deletes the selection or next Unicode character and merges paragraphs at a block boundary.' },
        { name: 'deleteRange(selection, origin, historyGroup?)', type: 'boolean', default: '—', description: 'Deletes a JSON selection, including ranges spanning multiple text blocks and atomic blocks. Changes with the same historyGroup made in quick succession share one undo step.' },
        { name: 'splitBlock()', type: 'boolean', default: '—', description: 'Splits the current text block at the selection and places the caret in a new paragraph.' },
        { name: 'toggleMark(type, attrs?)', type: 'boolean', default: '—', description: 'Toggles a registered mark over a range or in stored marks at a collapsed selection.' },
        { name: 'getActiveMark(type)', type: 'NgsHeadlessEditorMark | undefined', default: '—', description: 'Returns the active mark and its attributes at the caret or across the current selection.' },
        { name: 'setMark(type, attrs?)', type: 'boolean', default: '—', description: 'Applies or replaces a registered mark over a selection or in collapsed-selection stored marks.' },
        { name: 'unsetMark(type)', type: 'boolean', default: '—', description: 'Removes a mark over a selection or from collapsed-selection stored marks.' },
        { name: 'isMarkActive(type)', type: 'boolean', default: '—', description: 'Reports whether a mark is active at the caret or across the complete selection.' },
        { name: 'toggleBlock(type)', type: 'boolean', default: '—', description: 'Toggles the selected text block between a registered block type and paragraph.' },
        { name: 'isBlockActive(type)', type: 'boolean', default: '—', description: 'Reports whether the selected block has the requested registered type.' },
        { name: 'insertBlock(block | blocks, select?)', type: 'boolean', default: 'select: false', description: 'Inserts one or more blocks after the block that holds the caret as one undo step.' },
        { name: 'replaceBlock(id, blocks, selection?)', type: 'boolean', default: '—', description: 'Replaces a block with zero or more blocks as one undo step, for example an empty line with a table.' },
        { name: 'updateBlock(id, patch, origin?, historyGroup?)', type: 'boolean', default: "origin: 'command'", description: 'Updates type, content or attrs of a block by id. Updates sharing a historyGroup in quick succession form one undo step.' },
        { name: 'removeBlock(id)', type: 'boolean', default: '—', description: 'Removes a block by stable ID and restores an empty paragraph if it was the final block.' },
        { name: 'commitDomDocument(document, selection)', type: 'boolean', default: '—', description: 'Commits browser-controlled DOM changes such as completed IME composition into JSON state.' },
        { name: 'undo()', type: 'boolean', default: '—', description: 'Restores the previous document and selection snapshot.' },
        { name: 'redo()', type: 'boolean', default: '—', description: 'Restores the next document and selection snapshot.' },
        { name: 'clear()', type: 'void', default: '—', description: 'Replaces content with an empty paragraph and clears history.' }
      ]
    },
    {
      title: 'NgsHeadlessEditorSurface',
      description: 'Standalone directive that connects contenteditable DOM, browser selection, and NgsHeadlessEditor state.',
      rows: [
        { name: 'ngsHeadlessEditorSurface', type: 'directive', default: 'required', description: 'Attach to a host element inside the same injector scope as NgsHeadlessEditor.' },
        { name: 'editor', type: 'NgsHeadlessEditor', default: 'injected', description: 'The scoped editor instance used by the surface.' },
        { name: 'placeholder', type: 'InputSignal<string>', default: 'Write something…', description: 'Exposed as data-placeholder so the host application can choose how to style empty state.' },
        { name: 'ariaLabel', type: 'InputSignal<string>', default: 'Rich text editor', description: 'Accessible label applied to the textbox host.' },
        { name: 'disabled', type: 'InputSignal<boolean>', default: 'false', description: 'Disables contenteditable and input handling for this surface.' },
        { name: 'spellcheck', type: 'InputSignal<boolean>', default: 'true', description: 'Controls the native spellcheck attribute.' },
        { name: 'focus()', type: 'void', default: '—', description: 'Focuses the surface and restores the current JSON selection into the DOM.' },
        { name: 'getBlockElement(blockId)', type: 'HTMLElement | null', default: '—', description: 'Returns the element currently rendering a block, for positioning overlays or toolbars. Unchanged blocks keep the same element between renders.' },
        { name: 'ngsHeadlessEditorRuns', type: 'directive', default: '—', description: 'Renders text runs with the mark definitions of the nearest editor, for static previews of rich text.' },
      ]
    },
    {
      title: 'NgsHeadlessEditorCommandDirective',
      description: 'Typed bridge between toolbar controls and editor commands.',
      rows: [
        { name: '[ngsHeadlessEditorCommand]', type: 'InputSignal<NgsHeadlessEditorCommand<TPayload>>', default: 'required', description: 'Command executed on click. Mousedown is prevented so the current editor selection is preserved.' },
        { name: 'commandData', type: 'InputSignal<TPayload>', default: 'undefined', description: 'Optional typed command payload.' },
        { name: 'active', type: 'Signal<boolean>', default: 'computed', description: 'Reflects command.active() and adds the active class plus aria-pressed.' },
        { name: 'disabled', type: 'Signal<boolean>', default: 'computed', description: 'Reflects read-only state and command.enabled(), and sets the disabled attribute.' }
      ]
    },
    {
      title: 'Plugin contract',
      description: 'One plugin can contribute model definitions, behavior, Angular providers, and lifecycle work.',
      rows: [
        { name: 'id', type: 'string', default: 'required', description: 'Unique stable plugin ID.' },
        { name: 'blocks', type: 'readonly NgsHeadlessEditorBlockDefinition[]', default: '[]', description: 'Block definitions with a unique type, DOM rendering/parsing contract, and factory for an empty block.' },
        { name: 'marks', type: 'readonly NgsHeadlessEditorMarkDefinition[]', default: '[]', description: 'Inline mark definitions with render tag, optional parse tags, and attribute read/write hooks.' },
        { name: 'commands', type: 'readonly NgsHeadlessEditorCommand[]', default: '[]', description: 'Typed operations with execute and optional enabled and active predicates.' },
        { name: 'keymap', type: 'readonly NgsHeadlessEditorKeyBinding[]', default: '[]', description: 'Keyboard mappings such as Mod-b or Mod-Shift-x targeting a command object or registered command ID.' },
        { name: 'providers', type: 'readonly Provider[]', default: '[]', description: 'Angular providers installed when the plugin is supplied through provideNgsHeadlessEditor(withHeadlessEditorPlugin(...)).' },
        { name: 'handlePaste(event, editor)', type: 'boolean', default: 'undefined', description: 'Optional paste interception. Return true only when the plugin handled the clipboard event.' },
        { name: 'setup(editor)', type: 'void | (() => void)', default: 'undefined', description: 'Optional lifecycle hook. A returned cleanup function runs before plugin replacement or editor destruction.' }
      ]
    },
    {
      title: 'Extension definitions',
      description: 'Typed building blocks used inside NgsHeadlessEditorPlugin.',
      rows: [
        { name: 'NgsHeadlessEditorCommand.id', type: 'string', default: 'required', description: 'Unique command ID used by registry lookup and string-based key bindings.' },
        { name: 'NgsHeadlessEditorCommand.execute(editor, payload)', type: 'boolean', default: 'required', description: 'Runs the command and returns whether it performed an operation.' },
        { name: 'NgsHeadlessEditorCommand.enabled(editor, payload)', type: 'boolean', default: 'true', description: 'Optional availability predicate.' },
        { name: 'NgsHeadlessEditorCommand.active(editor, payload)', type: 'boolean', default: 'false', description: 'Optional active-state predicate for toolbar controls.' },
        { name: 'NgsHeadlessEditorKeyBinding.key', type: 'string', default: 'required', description: 'Normalized shortcut such as Mod-b, Mod-Shift-x, Alt-ArrowDown, or Escape.' },
        { name: 'NgsHeadlessEditorKeyBinding.command', type: 'NgsHeadlessEditorCommand | string', default: 'required', description: 'Command object or registered command ID.' },
        { name: 'NgsHeadlessEditorKeyBinding.payload', type: 'unknown', default: 'undefined', description: 'Optional payload passed to the command.' },
        { name: 'NgsHeadlessEditorMarkDefinition.type', type: 'string', default: 'required', description: 'Unique serialized mark type.' },
        { name: 'NgsHeadlessEditorMarkDefinition.tagName', type: 'string', default: 'required', description: 'DOM element created when the mark is rendered.' },
        { name: 'NgsHeadlessEditorMarkDefinition.parseTags', type: 'readonly string[]', default: '[]', description: 'Additional DOM tag names accepted when browser-controlled DOM is parsed.' },
        { name: 'NgsHeadlessEditorMarkDefinition.applyAttributes(element, mark)', type: 'void', default: 'undefined', description: 'Writes serialized mark attributes to the rendered element.' },
        { name: 'NgsHeadlessEditorMarkDefinition.readAttributes(element)', type: 'NgsHeadlessEditorMarkAttributes | undefined', default: 'undefined', description: 'Reads mark attributes when DOM changes are committed back to JSON.' },
        { name: 'NgsHeadlessEditorMarkDefinition.nested', type: 'boolean', default: 'true', description: 'Whether the mark is available in nested editors such as table cells.' },
        { name: 'NgsHeadlessEditorBlockDefinition.type', type: 'string', default: 'required', description: 'Unique serialized block type.' },
        { name: 'NgsHeadlessEditorBlockDefinition.tagName', type: 'string', default: 'required', description: 'DOM element used by the default surface renderer.' },
        { name: 'NgsHeadlessEditorBlockDefinition.contentTagName', type: 'string', default: 'undefined', description: 'Optional nested editable element, for example li inside ul or code inside pre.' },
        { name: 'NgsHeadlessEditorBlockDefinition.editable', type: 'boolean', default: 'true', description: 'Set false for atomic media or application blocks that the browser must not edit directly.' },
        { name: 'NgsHeadlessEditorBlockDefinition.exitOnEmptyEnter', type: 'boolean', default: 'true', description: 'Enter in an empty block of this type replaces the empty line with an exitType block, so Enter twice leaves quotes, lists and code.' },
        { name: 'NgsHeadlessEditorBlockDefinition.exitType', type: 'string', default: 'paragraph', description: 'Block type used when leaving the block.' },
        { name: 'NgsHeadlessEditorBlockDefinition.create()', type: 'NgsHeadlessEditorBlock', default: 'required', description: 'Creates an empty block of this type; Enter in a non-empty block uses it for the block that follows.' },
        { name: 'NgsHeadlessEditorBlockDefinition.render(element, block)', type: 'void', default: 'undefined', description: 'Optional block renderer for atomic or non-text DOM such as image and embed blocks.' },
        { name: 'NgsHeadlessEditorBlockDefinition.read(element, previous)', type: 'NgsHeadlessEditorBlock', default: 'undefined', description: 'Optional DOM-to-JSON parser used when a custom editable block commits browser changes.' },
        { name: 'NgsHeadlessEditorBlockDefinition.isEmpty(block)', type: 'boolean', default: 'text check', description: 'Optional empty-state override, commonly returning false for meaningful media blocks.' },
        { name: 'NgsHeadlessEditorBlockDefinition.editorComponent', type: 'Type<unknown>', default: 'undefined', description: 'Angular component rendered as the block while the surface is editable. The tagName element becomes its non-editable host, the block is passed to a `block` input when declared, and the instance survives block updates while the id and type stay the same. The component can inject NgsHeadlessEditor and call updateBlock().' },
        { name: 'NgsHeadlessEditorBlockDefinition.rendererComponent', type: 'Type<unknown>', default: 'undefined', description: 'Component used instead of editorComponent while the surface is read-only or disabled. Each falls back to the other when only one is defined.' },
        { name: 'NgsHeadlessEditorBlockComponent<TContent>', type: 'interface', default: '—', description: 'Recommended shape of block components: a block input (for example input.required<NgsHeadlessEditorBlock>()).' },
        { name: 'NgsHeadlessEditorFeature.plugin', type: 'NgsHeadlessEditorPlugin', default: 'required', description: 'Feature wrapper consumed by provideNgsHeadlessEditor().' },
        { name: 'NGS_HEADLESS_EDITOR_PLUGINS', type: 'InjectionToken<readonly NgsHeadlessEditorPlugin[]>', default: 'provided by provideNgsHeadlessEditor()', description: 'Low-level token containing the initial plugin set.' }
      ]
    },
    {
      title: 'Surface host contract',
      description: 'DOM attributes and hooks intentionally left available for host-owned styling and accessibility.',
      rows: [
        { name: 'exportAs', type: 'ngsHeadlessEditorSurface', default: '—', description: 'Template reference name for calling focus() or reading the injected editor.' },
        { name: 'class', type: 'ngs-headless-editor-surface', default: 'always', description: 'Stable class hook. The editor package does not attach opinionated visual styles.' },
        { name: 'role', type: 'textbox', default: 'always', description: 'Accessible role applied to the host element.' },
        { name: 'contenteditable', type: 'true | false', default: 'true', description: 'Derived from surface disabled and editor readOnly state.' },
        { name: 'aria-multiline', type: 'true', default: 'true', description: 'Identifies the surface as a multiline textbox.' },
        { name: 'aria-disabled', type: 'true | false', default: 'false', description: 'Mirrors effective disabled state.' },
        { name: 'data-placeholder', type: 'string', default: 'Write something…', description: 'Contains placeholder text for a host CSS pseudo-element or other custom presentation.' },
        { name: 'data-empty', type: 'empty attribute | null', default: 'empty attribute', description: 'Present while editor.empty() is true.' },
        { name: 'data-ngs-headless-editor-block-id', type: 'string', default: 'generated', description: 'Connects each rendered block element to a stable JSON block ID.' },
        { name: 'data-ngs-headless-editor-block-type', type: 'string', default: 'paragraph', description: 'Preserves the serialized block type in the DOM.' },
        { name: 'data-ngs-headless-editor-placeholder', type: 'string', default: 'first empty text block', description: 'Placed on the empty block that owns the caret so host placeholder styling shares its line box.' },
        { name: 'data-ngs-headless-editor-mark', type: 'string', default: 'registered mark type', description: 'Identifies rendered mark wrappers when DOM content is parsed.' }
      ]
    },
    {
      title: 'JSON document model',
      description: 'Serializable model types and normalization helpers. The core does not store HTML.',
      rows: [
        { name: 'NgsHeadlessEditorDocument', type: '{ version: 1; blocks: readonly NgsHeadlessEditorBlock[] }', default: '—', description: 'Versioned root document.' },
        { name: 'NgsHeadlessEditorBlock<TContent>', type: '{ id; type; content; attrs? }', default: '—', description: 'Addressable block with plugin-defined type and content.' },
        { name: 'NgsHeadlessEditorText', type: '{ type: text; text; marks }', default: '—', description: 'Text run with a normalized list of inline marks.' },
        { name: 'NgsHeadlessEditorMark', type: '{ type; attrs? }', default: '—', description: 'Serializable inline annotation.' },
        { name: 'NgsHeadlessEditorMarkAttributes', type: 'Readonly<Record<string, string | number | boolean | null>>', default: '—', description: 'Serializable attribute value map used by inline marks.' },
        { name: 'NgsHeadlessEditorSelection', type: '{ anchor; focus }', default: '—', description: 'Forward or backward selection in model coordinates.' },
        { name: 'NgsHeadlessEditorPoint', type: '{ blockId; offset }', default: '—', description: 'Position inside a block text stream.' },
        { name: 'createNgsHeadlessEditorId(prefix?)', type: 'string', default: 'prefix: block', description: 'Creates a unique browser-safe model ID.' },
        { name: 'createNgsHeadlessEditorText(text?, marks?)', type: 'NgsHeadlessEditorText', default: 'empty text', description: 'Creates and normalizes one text run.' },
        { name: 'createNgsHeadlessEditorParagraph(text?, marks?)', type: 'NgsHeadlessEditorBlock', default: 'empty paragraph', description: 'Creates a paragraph block with a fresh ID.' },
        { name: 'createNgsHeadlessEditorDocument(text?)', type: 'NgsHeadlessEditorDocument', default: 'empty document', description: 'Creates a version 1 document containing one paragraph.' },
        { name: 'cloneNgsHeadlessEditorDocument(document)', type: 'NgsHeadlessEditorDocument', default: '—', description: 'Clones blocks, text runs, marks, and serializable attributes.' },
        { name: 'normalizeNgsHeadlessEditorDocument(document)', type: 'NgsHeadlessEditorDocument', default: '—', description: 'Ensures at least one block, unique block IDs and normalized text runs. Unchanged blocks keep their object identity and an already normalized document is returned as-is.' },
        { name: 'normalizeNgsHeadlessEditorTextContent(content)', type: 'readonly NgsHeadlessEditorText[]', default: '—', description: 'Removes empty runs, merges adjacent equal marks, and preserves an empty text run when needed.' },
        { name: 'normalizeNgsHeadlessEditorMarks(marks)', type: 'readonly NgsHeadlessEditorMark[]', default: '—', description: 'Deduplicates marks by type and returns deterministic order.' },
        { name: 'ngsHeadlessEditorMarksEqual(left, right)', type: 'boolean', default: '—', description: 'Compares normalized mark collections.' },
        { name: 'ngsHeadlessEditorDocumentsEqual(left, right)', type: 'boolean', default: '—', description: 'Structural document comparison that short-circuits on shared, unchanged blocks and ignores object key order.' },
        { name: 'ngsHeadlessEditorBlocksEqual(left, right)', type: 'boolean', default: '—', description: 'Structural comparison of one block: id, type, attrs and content.' },
        { name: 'ngsHeadlessEditorValuesEqual(left, right)', type: 'boolean', default: '—', description: 'Deep equality for JSON-like values; key order is ignored and undefined keys count as absent.' },
        { name: 'isNgsHeadlessEditorTextContent(content)', type: 'type predicate', default: '—', description: 'Checks whether block content is composed of text runs.' },
        { name: 'getNgsHeadlessEditorBlockText(block)', type: 'string', default: '—', description: 'Flattens text runs in one block.' },
        { name: 'getNgsHeadlessEditorDocumentText(document)', type: 'string', default: '—', description: 'Flattens document blocks separated by newlines.' },
        { name: 'isNgsHeadlessEditorDocumentEmpty(document)', type: 'boolean', default: '—', description: 'Checks whether flattened document text is empty after trimming.' }
      ]
    },
    {
      title: 'Basic text preset',
      description: 'Exports supplied by basicTextEditorPlugin().',
      rows: [
        { name: 'paragraph', type: 'block', default: '<p>', description: 'Default text block.' },
        { name: 'bold', type: 'mark', default: '<strong>', description: 'Parses strong and b elements. Shortcut: Mod-b.' },
        { name: 'italic', type: 'mark', default: '<em>', description: 'Parses em and i elements. Shortcut: Mod-i.' },
        { name: 'strike', type: 'mark', default: '<s>', description: 'Parses s and strike elements. Shortcut: Mod-Shift-x.' },
        { name: 'code', type: 'mark', default: '<code>', description: 'Inline code mark. Shortcut: Mod-e.' },
        { name: 'NGS_HEADLESS_EDITOR_TOGGLE_BOLD', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Built-in bold command.' },
        { name: 'NGS_HEADLESS_EDITOR_TOGGLE_ITALIC', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Built-in italic command.' },
        { name: 'NGS_HEADLESS_EDITOR_TOGGLE_STRIKE', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Built-in strike command.' },
        { name: 'NGS_HEADLESS_EDITOR_TOGGLE_CODE', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Built-in inline-code command.' }
      ]
    },
    {
      title: 'Color plugin',
      description: 'Opt-in text and highlight colors supplied by colorEditorPlugin(). Colors are stored as mark attributes in the JSON document.',
      rows: [
        { name: 'textColor', type: 'mark', default: '<span style="color: …">', description: 'Applies a foreground color without affecting the background color mark.' },
        { name: 'backgroundColor', type: 'mark', default: '<span style="background-color: …">', description: 'Applies a highlight/background color without affecting the text color mark.' },
        { name: 'NGS_HEADLESS_EDITOR_SET_TEXT_COLOR', type: 'NgsHeadlessEditorCommand<string>', default: '—', description: 'Sets or replaces the textColor mark using a color command payload.' },
        { name: 'NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Removes the textColor mark while preserving other marks.' },
        { name: 'NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR', type: 'NgsHeadlessEditorCommand<string>', default: '—', description: 'Sets or replaces the backgroundColor mark using a color command payload.' },
        { name: 'NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR', type: 'NgsHeadlessEditorCommand<void>', default: '—', description: 'Removes the backgroundColor mark while preserving other marks.' },
        { name: 'normalizeNgsHeadlessEditorColor(value)', type: 'string | null', default: '—', description: 'Normalizes supported CSS colors and design-token variables and rejects values that can escape the color declaration.' },
        { name: 'NGS_HEADLESS_EDITOR_TEXT_COLOR_MARK', type: "'textColor'", default: '—', description: 'Mark type of the text color mark.' },
        { name: 'NGS_HEADLESS_EDITOR_BACKGROUND_COLOR_MARK', type: "'backgroundColor'", default: '—', description: 'Mark type of the background color mark.' },
      ]
    },
    {
      title: 'Nested editors',
      description: 'Rich text inside component blocks, as used by table cells.',
      rows: [
        { name: 'provideNgsHeadlessEditorInlineRegion()', type: 'Provider[]', default: '—', description: 'Provides a nested editor and NgsHeadlessEditorInlineRegion for a component.' },
        { name: 'NgsHeadlessEditorInlineRegion.parent / editor', type: 'NgsHeadlessEditor', default: '—', description: 'The document editor and the nested editor.' },
        { name: 'NgsHeadlessEditorInlineRegion.configure(options)', type: 'void', default: 'marks: true', description: 'marks: true (all marks without nested: false), false (plain text) or a list of mark types.' },
        { name: 'NgsHeadlessEditorInlineRegion.load(runs)', type: 'void', default: '—', description: 'Shows content in the nested editor unless it already does; keeps the caret when possible.' },
        { name: 'NgsHeadlessEditorInlineRegion.content', type: 'Signal<readonly NgsHeadlessEditorText[]>', default: '—', description: 'Current content as text runs; lines are joined with newline characters.' },
        { name: 'NgsHeadlessEditorInlineRegion.activate() / deactivate() / active', type: 'void / Signal<boolean>', default: '—', description: 'Makes the region the inline target of the document editor.' },
        { name: 'renderNgsHeadlessEditorRuns / renderNgsHeadlessEditorTextRun', type: 'function', default: '—', description: 'Render text runs into DOM with mark definitions.' },
        { name: 'readNgsHeadlessEditorInlineContent(element, marks, options?)', type: 'NgsHeadlessEditorText[]', default: '—', description: 'Reads text runs from DOM; lineBreaks turns br and block boundaries into newlines.' }
      ]
    },
    {
      title: 'Mention plugin and menu',
      description: 'Editable inline mentions with a caret menu and custom Angular option components. See the Mentions guide.',
      rows: [
        { name: 'mentionEditorPlugin(options?)', type: 'NgsHeadlessEditorPlugin', default: 'trigger: @', description: 'Registers the mention mark and provides editor-scoped search callback, trigger and optionComponent configuration.' },
        { name: 'NgsHeadlessEditorMentionSearch<T>', type: '(query: string) => Promise<readonly T[]>', default: '—', description: 'Consumer-defined local or backend search. Receives the query without the trigger. Results retain their order without additional filtering.' },
        { name: 'NgsHeadlessEditorMentionOption', type: '{ id: string; label: string }', default: '—', description: 'Candidate identity and label. Extend with arbitrary presentation data.' },
        { name: 'NgsHeadlessEditorMentionOptionComponent<T>', type: '{ option: () => T; active: () => boolean }', default: '—', description: 'Inputs required by a custom optionComponent. The menu handles selection around the component.' },
        { name: 'NGS_HEADLESS_EDITOR_MENTION_OPTIONS', type: 'InjectionToken<NgsHeadlessEditorMentionPluginOptions>', default: '{}', description: 'Configuration installed through withHeadlessEditorPlugin: options, optionComponent, trigger.' },
        { name: 'ngsHeadlessEditorMentions', type: 'Menu | null', default: 'default menu', description: 'Directive on a surface. Pass a Menu for custom content, or use the default menu with the plugin optionComponent.' },
        { name: 'mentionOptions / mentionTrigger', type: 'NgsHeadlessEditorMentionSearch<T> / string', default: 'plugin callback / @', description: 'Per-surface overrides for the async search callback and trigger.' },
        { name: 'query / suggestions / activeIndex / open', type: 'Signal', default: 'null / [] / 0 / false', description: 'Current query, matching candidates, highlighted index and whether suggestions are open.' },
        { name: 'loading / error', type: 'Signal<boolean> / Signal<unknown>', default: 'false / null', description: 'Pending search and latest search error. Outdated responses are ignored; rejection closes the menu until the next search.' },
        { name: 'optionId(index) / select(option) / dismiss()', type: 'methods', default: '—', description: 'Option id for aria-activedescendant, candidate insertion in one undo step, and dismissal of the current query.' },
        { name: 'mentionSelected / mentionQueryChange', type: 'output', default: '—', description: 'Emits the inserted candidate or the query (null when inactive). Search itself runs through the options callback.' },
        { name: 'findNgsHeadlessEditorMentionQuery(editor, trigger?)', type: 'NgsHeadlessEditorMentionQuery | null', default: 'trigger: @', description: 'Finds a trigger and query at a collapsed caret; ignores existing mentions and e-mail addresses.' },
        { name: 'insertNgsHeadlessEditorMention(editor, option, query)', type: 'boolean', default: '—', description: 'Replaces a still-current query with a mention and a space; preserves surrounding text and formatting.' },
        { name: 'NGS_HEADLESS_EDITOR_MENTION_MARK', type: "'mention'", default: '—', description: 'Mention mark type. Its attributes contain id and label.' },
        { name: 'NgsHeadlessEditorMentionMenu', type: 'component', default: 'built in', description: 'Default ngs-menu content used by the mentions directive.' }
      ]
    },
    {
      title: 'Table plugin',
      description: 'Table blocks: plugin, commands, data helpers and components. See the Tables guide.',
      rows: [
        { name: 'tableEditorPlugin(options?)', type: 'NgsHeadlessEditorPlugin', default: 'paste: true, formatting: true', description: 'Registers the table block, its editor and read-only components, the table commands and spreadsheet/HTML table paste. formatting: true, false or a list of mark types allowed in cells.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_OPTIONS', type: 'InjectionToken<NgsHeadlessEditorTablePluginOptions>', default: '{}', description: 'Plugin options, provided by withHeadlessEditorPlugin(tableEditorPlugin(...)).' },
        { name: 'NgsHeadlessEditorTableCellContent', type: 'readonly NgsHeadlessEditorText[]', default: '—', description: 'Content of one cell: text runs with marks; newlines are line breaks.' },
        { name: 'getNgsHeadlessEditorTableCellText(cell)', type: 'string', default: '—', description: 'Plain text of a cell.' },
        { name: 'normalizeNgsHeadlessEditorTableCell(value)', type: 'NgsHeadlessEditorTableCellContent', default: '—', description: 'Normalizes a cell from a string, text runs or untrusted JSON.' },
        { name: 'ngsHeadlessEditorTableCellMarks(registry, formatting?)', type: 'NgsHeadlessEditorMarkRegistry', default: '—', description: 'Mark registry filtered to the marks allowed in cells.' },
        { name: 'NGS_HEADLESS_EDITOR_INSERT_TABLE', type: 'NgsHeadlessEditorCommand<NgsHeadlessEditorTableSize | undefined>', default: '3 x 3, header', description: 'Replaces an empty line or inserts after the current block, adds a trailing paragraph when needed and focuses the first cell.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_BEFORE / _AFTER', type: 'NgsHeadlessEditorCommand', default: '—', description: 'Adds a row above or below the active cell.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_BEFORE / _AFTER', type: 'NgsHeadlessEditorCommand', default: '—', description: 'Adds a column left or right of the active cell.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW / _COLUMN', type: 'NgsHeadlessEditorCommand', default: '—', description: 'Deletes the row or column of the active cell; disabled for the last one.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER', type: 'NgsHeadlessEditorCommand', default: '—', description: 'Toggles the header row; active while it is on.' },
        { name: 'NGS_HEADLESS_EDITOR_TABLE_DELETE', type: 'NgsHeadlessEditorCommand', default: '—', description: 'Removes the table of the active cell.' },
        { name: 'insertNgsHeadlessEditorTable(editor, block)', type: 'boolean', default: '—', description: 'Inserts a table block with the same placement and focus rules as the insert command.' },
        { name: 'ngsHeadlessEditorActiveTableCell(editor)', type: 'Signal<NgsHeadlessEditorTableCell | null>', default: 'null', description: 'Focused (or last focused) table cell: block id, row and column.' },
        { name: 'focusNgsHeadlessEditorTableCell(editor, cell)', type: 'void', default: '—', description: 'Focuses a cell once its table is rendered.' },
        { name: 'NgsHeadlessEditorTableData', type: '{ rows: NgsHeadlessEditorTableCellContent[][]; header: boolean }', default: '—', description: 'Table data stored in block.attrs.' },
        { name: 'NgsHeadlessEditorTableSize', type: '{ rows; columns; header? }', default: '—', description: 'Payload of the insert command.' },
        { name: 'createNgsHeadlessEditorTable(sizeOrRows, header?)', type: 'NgsHeadlessEditorBlock<null>', default: 'header: true', description: 'Creates a table block from a size or from cells given as strings or text runs.' },
        { name: 'getNgsHeadlessEditorTableData(block)', type: 'NgsHeadlessEditorTableData', default: '—', description: 'Reads and normalizes table data (rectangular rows, at most 500 x 50).' },
        { name: 'setNgsHeadlessEditorTableCell / insert…Row / remove…Row / insert…Column / remove…Column', type: 'NgsHeadlessEditorTableData', default: '—', description: 'Pure table operations that return new data.' },
        { name: 'parseNgsHeadlessEditorTableText(text)', type: 'NgsHeadlessEditorTableCellContent[][] | null', default: '—', description: 'Parses a tab-separated spreadsheet range into cells; null unless it is a real grid.' },
        { name: 'parseNgsHeadlessEditorTableHtml(html, marks?)', type: 'NgsHeadlessEditorTableCellContent[][] | null', default: '—', description: 'Extracts cells from clipboard HTML that contains only a table, keeping formatting for the given marks.' },
        { name: 'NgsHeadlessEditorTableBlockEditor / NgsHeadlessEditorTableView', type: 'component', default: '—', description: 'Editing and read-only components registered by the plugin. Style them through .ngs-headless-editor-table, .ngs-headless-editor-table-cell, th, .active, .ngs-headless-editor-table-cell-content and .ngs-headless-editor-table-cell-editor.' }
      ]
    },
    {
      title: 'Snapshot history',
      description: 'NgsHeadlessEditorHistory is scoped with the editor and records document plus selection snapshots.',
      rows: [
        { name: 'NgsHeadlessEditorSnapshot', type: '{ document; selection }', default: '—', description: 'Immutable history value containing JSON document and model selection.' },
        { name: 'canUndo', type: 'Signal<boolean>', default: 'false', description: 'Whether the past stack contains a snapshot.' },
        { name: 'canRedo', type: 'Signal<boolean>', default: 'false', description: 'Whether the future stack contains a snapshot.' },
        { name: 'record(snapshot, group?)', type: 'void', default: '—', description: 'Adds a snapshot to the past stack (structure is shared, not cloned) and clears redo state. Consecutive records with the same non-null group within one second form a single undo step. At most 200 steps are kept.' },
        { name: 'breakGroup()', type: 'void', default: '—', description: 'Forces the next record to start a new undo step. Called on caret moves, undo and redo.' },
        { name: 'NGS_HEADLESS_EDITOR_HISTORY_LIMIT', type: 'number', default: '200', description: 'Maximum number of undo steps kept in memory.' },
        { name: 'NGS_HEADLESS_EDITOR_HISTORY_GROUP_DELAY', type: 'number', default: '1000', description: 'Milliseconds within which changes of the same group form one undo step.' },
        { name: 'undo(current)', type: 'NgsHeadlessEditorSnapshot | null', default: '—', description: 'Moves current state to the future stack and returns the previous snapshot.' },
        { name: 'redo(current)', type: 'NgsHeadlessEditorSnapshot | null', default: '—', description: 'Moves current state to the past stack and returns the next snapshot.' },
        { name: 'clear()', type: 'void', default: '—', description: 'Clears both history stacks.' }
      ]
    }
  ];
}
