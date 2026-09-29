import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Api {
  readonly sections: readonly EditorApiSection[] = [
    {
      title: 'Setup and plugin registration',
      description: 'Public functions used to create a scoped editor and compose its feature set.',
      rows: [
        {
          name: 'provideNgsEditor(...features)',
          type: 'Provider[]',
          default: 'required',
          description: 'Provides one scoped NgsEditor, its snapshot history, plugin providers, and the initial plugin set.'
        },
        {
          name: 'withEditorPlugin(plugin)',
          type: 'NgsEditorFeature',
          default: '—',
          description: 'Wraps a plugin for provideNgsEditor(). Use this path when the plugin declares Angular providers.'
        },
        {
          name: 'defineNgsEditorPlugin(plugin)',
          type: 'NgsEditorPlugin',
          default: '—',
          description: 'Typed identity helper for declaring blocks, marks, commands, keymaps, providers, paste handling, and setup.'
        },
        {
          name: 'basicTextEditorPlugin()',
          type: 'NgsEditorPlugin',
          default: 'not installed automatically',
          description: 'Creates the paragraph/text preset with bold, italic, strike, and inline-code marks and shortcuts.'
        },
        {
          name: 'colorEditorPlugin()',
          type: 'NgsEditorPlugin',
          default: 'not installed automatically',
          description: 'Adds independent textColor and backgroundColor marks plus typed commands to set or remove either color.'
        }
      ]
    },
    {
      title: 'NgsEditor signals',
      description: 'Readonly signal state exposed by the editor service.',
      rows: [
        { name: 'document', type: 'Signal<NgsEditorDocument>', default: 'empty paragraph', description: 'Current normalized JSON document.' },
        { name: 'selection', type: 'Signal<NgsEditorSelection | null>', default: 'null', description: 'Anchor and focus positions expressed as block IDs and text offsets.' },
        { name: 'storedMarks', type: 'Signal<readonly NgsEditorMark[]>', default: '[]', description: 'Marks that will be applied to text inserted at a collapsed selection.' },
        { name: 'focused', type: 'Signal<boolean>', default: 'false', description: 'Whether an attached editor surface currently has focus.' },
        { name: 'composing', type: 'Signal<boolean>', default: 'false', description: 'Whether an IME composition session is active.' },
        { name: 'readOnly', type: 'Signal<boolean>', default: 'false', description: 'Prevents commands and editing operations from mutating the document.' },
        { name: 'revision', type: 'Signal<number>', default: '0', description: 'Monotonic document revision used by surfaces to schedule rendering.' },
        { name: 'origin', type: 'Signal<NgsEditorChangeOrigin>', default: 'external', description: 'Origin of the last document change: external, api, keyboard, paste, composition, history, or command.' },
        { name: 'plugins', type: 'Signal<readonly NgsEditorPlugin[]>', default: 'provided plugins', description: 'Currently installed plugin instances in execution order.' },
        { name: 'empty', type: 'Signal<boolean>', default: 'true', description: 'True when normalized document text contains no non-whitespace characters.' },
        { name: 'canUndo', type: 'Signal<boolean>', default: 'false', description: 'Whether a previous snapshot is available.' },
        { name: 'canRedo', type: 'Signal<boolean>', default: 'false', description: 'Whether a forward snapshot is available.' }
      ]
    },
    {
      title: 'NgsEditor methods',
      description: 'State transitions and extension lookup methods available to custom shells and plugins.',
      rows: [
        { name: 'setPlugins(plugins)', type: 'void', default: '—', description: 'Atomically validates and replaces the plugin set. Duplicate plugin, command, mark, or block IDs throw without corrupting the current registry.' },
        { name: 'getMarkDefinition(type)', type: 'NgsEditorMarkDefinition | undefined', default: '—', description: 'Looks up one registered mark definition.' },
        { name: 'getMarkDefinitions()', type: 'readonly NgsEditorMarkDefinition[]', default: '—', description: 'Returns every registered mark definition.' },
        { name: 'getBlockDefinition(type)', type: 'NgsEditorBlockDefinition | undefined', default: '—', description: 'Looks up one registered block definition.' },
        { name: 'getBlockDefinitions()', type: 'readonly NgsEditorBlockDefinition[]', default: '—', description: 'Returns every registered block definition.' },
        { name: 'setDocument(document, resetHistory?)', type: 'void', default: 'resetHistory: true', description: 'Normalizes and installs an external JSON document, resets selection and stored marks, and optionally clears history.' },
        { name: 'setReadOnly(readOnly)', type: 'void', default: '—', description: 'Updates the read-only signal.' },
        { name: 'setFocused(focused)', type: 'void', default: '—', description: 'Updates focus state. NgsEditorSurface calls this automatically.' },
        { name: 'setComposing(composing)', type: 'void', default: '—', description: 'Updates IME composition state. NgsEditorSurface calls this automatically.' },
        { name: 'setSelection(selection)', type: 'void', default: '—', description: 'Clamps and stores a JSON selection, or clears it with null.' },
        { name: 'execute(command, payload?)', type: 'boolean', default: '—', description: 'Executes a typed command object or registered command ID when enabled and writable.' },
        { name: 'isCommandEnabled(command, payload?)', type: 'boolean', default: '—', description: 'Evaluates command availability against current editor state.' },
        { name: 'isCommandActive(command, payload?)', type: 'boolean', default: '—', description: 'Evaluates command active state for toolbar controls.' },
        { name: 'handleKeydown(event)', type: 'boolean', default: '—', description: 'Resolves normalized Mod, Alt, and Shift key bindings in plugin order.' },
        { name: 'handlePaste(event)', type: 'boolean', default: '—', description: 'Runs plugin paste handlers in order and stops at the first handler that returns true.' },
        { name: 'insertText(text, origin?)', type: 'boolean', default: 'origin: keyboard', description: 'Replaces the current selection, preserves applicable marks, and converts newlines into paragraph blocks.' },
        { name: 'deleteBackward()', type: 'boolean', default: '—', description: 'Deletes the selection or previous Unicode character and merges paragraphs at a block boundary.' },
        { name: 'deleteForward()', type: 'boolean', default: '—', description: 'Deletes the selection or next Unicode character and merges paragraphs at a block boundary.' },
        { name: 'deleteRange(selection, origin)', type: 'boolean', default: '—', description: 'Deletes a JSON selection, including ranges spanning multiple text blocks.' },
        { name: 'splitBlock()', type: 'boolean', default: '—', description: 'Splits the current text block at the selection and places the caret in a new paragraph.' },
        { name: 'toggleMark(type, attrs?)', type: 'boolean', default: '—', description: 'Toggles a registered mark over a range or in stored marks at a collapsed selection.' },
        { name: 'getActiveMark(type)', type: 'NgsEditorMark | undefined', default: '—', description: 'Returns the active mark and its attributes at the caret or across the current selection.' },
        { name: 'setMark(type, attrs?)', type: 'boolean', default: '—', description: 'Applies or replaces a registered mark over a selection or in collapsed-selection stored marks.' },
        { name: 'unsetMark(type)', type: 'boolean', default: '—', description: 'Removes a mark over a selection or from collapsed-selection stored marks.' },
        { name: 'isMarkActive(type)', type: 'boolean', default: '—', description: 'Reports whether a mark is active at the caret or across the complete selection.' },
        { name: 'toggleBlock(type)', type: 'boolean', default: '—', description: 'Toggles the selected text block between a registered block type and paragraph.' },
        { name: 'isBlockActive(type)', type: 'boolean', default: '—', description: 'Reports whether the selected block has the requested registered type.' },
        { name: 'insertBlock(block, select?)', type: 'boolean', default: 'select: false', description: 'Inserts a normalized plugin-defined block after the active block or at the document end.' },
        { name: 'updateBlock(id, patch)', type: 'boolean', default: '—', description: 'Updates a block by stable ID while preserving normalization and history.' },
        { name: 'removeBlock(id)', type: 'boolean', default: '—', description: 'Removes a block by stable ID and restores an empty paragraph if it was the final block.' },
        { name: 'commitDomDocument(document, selection)', type: 'boolean', default: '—', description: 'Commits browser-controlled DOM changes such as completed IME composition into JSON state.' },
        { name: 'undo()', type: 'boolean', default: '—', description: 'Restores the previous document and selection snapshot.' },
        { name: 'redo()', type: 'boolean', default: '—', description: 'Restores the next document and selection snapshot.' },
        { name: 'clear()', type: 'void', default: '—', description: 'Replaces content with an empty paragraph and clears history.' }
      ]
    },
    {
      title: 'NgsEditorSurface',
      description: 'Standalone directive that connects contenteditable DOM, browser selection, and NgsEditor state.',
      rows: [
        { name: 'ngsEditorSurface', type: 'directive', default: 'required', description: 'Attach to a host element inside the same injector scope as NgsEditor.' },
        { name: 'editor', type: 'NgsEditor', default: 'injected', description: 'The scoped editor instance used by the surface.' },
        { name: 'placeholder', type: 'InputSignal<string>', default: 'Write something…', description: 'Exposed as data-placeholder so the host application can choose how to style empty state.' },
        { name: 'ariaLabel', type: 'InputSignal<string>', default: 'Rich text editor', description: 'Accessible label applied to the textbox host.' },
        { name: 'disabled', type: 'InputSignal<boolean>', default: 'false', description: 'Disables contenteditable and input handling for this surface.' },
        { name: 'spellcheck', type: 'InputSignal<boolean>', default: 'true', description: 'Controls the native spellcheck attribute.' },
        { name: 'focus()', type: 'void', default: '—', description: 'Focuses the surface and restores the current JSON selection into the DOM.' }
      ]
    },
    {
      title: 'NgsEditorCommandDirective',
      description: 'Typed bridge between toolbar controls and editor commands.',
      rows: [
        { name: '[ngsEditorCommand]', type: 'InputSignal<NgsEditorCommand<TPayload>>', default: 'required', description: 'Command executed on click. Mousedown is prevented so the current editor selection is preserved.' },
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
        { name: 'blocks', type: 'readonly NgsEditorBlockDefinition[]', default: '[]', description: 'Block definitions with a unique type, DOM rendering/parsing contract, and factory for an empty block.' },
        { name: 'marks', type: 'readonly NgsEditorMarkDefinition[]', default: '[]', description: 'Inline mark definitions with render tag, optional parse tags, and attribute read/write hooks.' },
        { name: 'commands', type: 'readonly NgsEditorCommand[]', default: '[]', description: 'Typed operations with execute and optional enabled and active predicates.' },
        { name: 'keymap', type: 'readonly NgsEditorKeyBinding[]', default: '[]', description: 'Keyboard mappings such as Mod-b or Mod-Shift-x targeting a command object or registered command ID.' },
        { name: 'providers', type: 'readonly Provider[]', default: '[]', description: 'Angular providers installed when the plugin is supplied through provideNgsEditor(withEditorPlugin(...)).' },
        { name: 'handlePaste(event, editor)', type: 'boolean', default: 'undefined', description: 'Optional paste interception. Return true only when the plugin handled the clipboard event.' },
        { name: 'setup(editor)', type: 'void | (() => void)', default: 'undefined', description: 'Optional lifecycle hook. A returned cleanup function runs before plugin replacement or editor destruction.' }
      ]
    },
    {
      title: 'Extension definitions',
      description: 'Typed building blocks used inside NgsEditorPlugin.',
      rows: [
        { name: 'NgsEditorCommand.id', type: 'string', default: 'required', description: 'Unique command ID used by registry lookup and string-based key bindings.' },
        { name: 'NgsEditorCommand.execute(editor, payload)', type: 'boolean', default: 'required', description: 'Runs the command and returns whether it performed an operation.' },
        { name: 'NgsEditorCommand.enabled(editor, payload)', type: 'boolean', default: 'true', description: 'Optional availability predicate.' },
        { name: 'NgsEditorCommand.active(editor, payload)', type: 'boolean', default: 'false', description: 'Optional active-state predicate for toolbar controls.' },
        { name: 'NgsEditorKeyBinding.key', type: 'string', default: 'required', description: 'Normalized shortcut such as Mod-b, Mod-Shift-x, Alt-ArrowDown, or Escape.' },
        { name: 'NgsEditorKeyBinding.command', type: 'NgsEditorCommand | string', default: 'required', description: 'Command object or registered command ID.' },
        { name: 'NgsEditorKeyBinding.payload', type: 'unknown', default: 'undefined', description: 'Optional payload passed to the command.' },
        { name: 'NgsEditorMarkDefinition.type', type: 'string', default: 'required', description: 'Unique serialized mark type.' },
        { name: 'NgsEditorMarkDefinition.tagName', type: 'string', default: 'required', description: 'DOM element created when the mark is rendered.' },
        { name: 'NgsEditorMarkDefinition.parseTags', type: 'readonly string[]', default: '[]', description: 'Additional DOM tag names accepted when browser-controlled DOM is parsed.' },
        { name: 'NgsEditorMarkDefinition.applyAttributes(element, mark)', type: 'void', default: 'undefined', description: 'Writes serialized mark attributes to the rendered element.' },
        { name: 'NgsEditorMarkDefinition.readAttributes(element)', type: 'NgsEditorMarkAttributes | undefined', default: 'undefined', description: 'Reads mark attributes when DOM changes are committed back to JSON.' },
        { name: 'NgsEditorBlockDefinition.type', type: 'string', default: 'required', description: 'Unique serialized block type.' },
        { name: 'NgsEditorBlockDefinition.tagName', type: 'string', default: 'required', description: 'DOM element used by the default surface renderer.' },
        { name: 'NgsEditorBlockDefinition.contentTagName', type: 'string', default: 'undefined', description: 'Optional nested editable element, for example li inside ul or code inside pre.' },
        { name: 'NgsEditorBlockDefinition.editable', type: 'boolean', default: 'true', description: 'Set false for atomic media or application blocks that the browser must not edit directly.' },
        { name: 'NgsEditorBlockDefinition.create()', type: 'NgsEditorBlock', default: 'required', description: 'Creates an empty block of this type.' },
        { name: 'NgsEditorBlockDefinition.render(element, block)', type: 'void', default: 'undefined', description: 'Optional block renderer for atomic or non-text DOM such as image and embed blocks.' },
        { name: 'NgsEditorBlockDefinition.read(element, previous)', type: 'NgsEditorBlock', default: 'undefined', description: 'Optional DOM-to-JSON parser used when a custom editable block commits browser changes.' },
        { name: 'NgsEditorBlockDefinition.isEmpty(block)', type: 'boolean', default: 'text check', description: 'Optional empty-state override, commonly returning false for meaningful media blocks.' },
        { name: 'NgsEditorBlockDefinition.editorComponent', type: 'Type<unknown>', default: 'undefined', description: 'Optional Angular component metadata reserved for a specialized editing surface. The default text surface renders tagName.' },
        { name: 'NgsEditorBlockDefinition.rendererComponent', type: 'Type<unknown>', default: 'undefined', description: 'Optional Angular component metadata reserved for a dedicated document renderer. The default text surface renders tagName.' },
        { name: 'NgsEditorFeature.plugin', type: 'NgsEditorPlugin', default: 'required', description: 'Feature wrapper consumed by provideNgsEditor().' },
        { name: 'NGS_EDITOR_PLUGINS', type: 'InjectionToken<readonly NgsEditorPlugin[]>', default: 'provided by provideNgsEditor()', description: 'Low-level token containing the initial plugin set.' }
      ]
    },
    {
      title: 'Surface host contract',
      description: 'DOM attributes and hooks intentionally left available for host-owned styling and accessibility.',
      rows: [
        { name: 'exportAs', type: 'ngsEditorSurface', default: '—', description: 'Template reference name for calling focus() or reading the injected editor.' },
        { name: 'class', type: 'ngs-editor-surface', default: 'always', description: 'Stable class hook. The editor package does not attach opinionated visual styles.' },
        { name: 'role', type: 'textbox', default: 'always', description: 'Accessible role applied to the host element.' },
        { name: 'contenteditable', type: 'true | false', default: 'true', description: 'Derived from surface disabled and editor readOnly state.' },
        { name: 'aria-multiline', type: 'true', default: 'true', description: 'Identifies the surface as a multiline textbox.' },
        { name: 'aria-disabled', type: 'true | false', default: 'false', description: 'Mirrors effective disabled state.' },
        { name: 'data-placeholder', type: 'string', default: 'Write something…', description: 'Contains placeholder text for a host CSS pseudo-element or other custom presentation.' },
        { name: 'data-empty', type: 'empty attribute | null', default: 'empty attribute', description: 'Present while editor.empty() is true.' },
        { name: 'data-ngs-editor-block-id', type: 'string', default: 'generated', description: 'Connects each rendered block element to a stable JSON block ID.' },
        { name: 'data-ngs-editor-block-type', type: 'string', default: 'paragraph', description: 'Preserves the serialized block type in the DOM.' },
        { name: 'data-ngs-editor-placeholder', type: 'string', default: 'first empty text block', description: 'Placed on the empty block that owns the caret so host placeholder styling shares its line box.' },
        { name: 'data-ngs-editor-mark', type: 'string', default: 'registered mark type', description: 'Identifies rendered mark wrappers when DOM content is parsed.' }
      ]
    },
    {
      title: 'JSON document model',
      description: 'Serializable model types and normalization helpers. The core does not store HTML.',
      rows: [
        { name: 'NgsEditorDocument', type: '{ version: 1; blocks: readonly NgsEditorBlock[] }', default: '—', description: 'Versioned root document.' },
        { name: 'NgsEditorBlock<TContent>', type: '{ id; type; content; attrs? }', default: '—', description: 'Addressable block with plugin-defined type and content.' },
        { name: 'NgsEditorText', type: '{ type: text; text; marks }', default: '—', description: 'Text run with a normalized list of inline marks.' },
        { name: 'NgsEditorMark', type: '{ type; attrs? }', default: '—', description: 'Serializable inline annotation.' },
        { name: 'NgsEditorMarkAttributes', type: 'Readonly<Record<string, string | number | boolean | null>>', default: '—', description: 'Serializable attribute value map used by inline marks.' },
        { name: 'NgsEditorSelection', type: '{ anchor; focus }', default: '—', description: 'Forward or backward selection in model coordinates.' },
        { name: 'NgsEditorPoint', type: '{ blockId; offset }', default: '—', description: 'Position inside a block text stream.' },
        { name: 'createNgsEditorId(prefix?)', type: 'string', default: 'prefix: block', description: 'Creates a unique browser-safe model ID.' },
        { name: 'createNgsEditorText(text?, marks?)', type: 'NgsEditorText', default: 'empty text', description: 'Creates and normalizes one text run.' },
        { name: 'createNgsEditorParagraph(text?, marks?)', type: 'NgsEditorBlock', default: 'empty paragraph', description: 'Creates a paragraph block with a fresh ID.' },
        { name: 'createNgsEditorDocument(text?)', type: 'NgsEditorDocument', default: 'empty document', description: 'Creates a version 1 document containing one paragraph.' },
        { name: 'cloneNgsEditorDocument(document)', type: 'NgsEditorDocument', default: '—', description: 'Clones blocks, text runs, marks, and serializable attributes.' },
        { name: 'normalizeNgsEditorDocument(document)', type: 'NgsEditorDocument', default: '—', description: 'Ensures at least one block, unique block IDs, and normalized text content.' },
        { name: 'normalizeNgsEditorTextContent(content)', type: 'readonly NgsEditorText[]', default: '—', description: 'Removes empty runs, merges adjacent equal marks, and preserves an empty text run when needed.' },
        { name: 'normalizeNgsEditorMarks(marks)', type: 'readonly NgsEditorMark[]', default: '—', description: 'Deduplicates marks by type and returns deterministic order.' },
        { name: 'ngsEditorMarksEqual(left, right)', type: 'boolean', default: '—', description: 'Compares normalized mark collections.' },
        { name: 'ngsEditorDocumentsEqual(left, right)', type: 'boolean', default: '—', description: 'Compares complete JSON documents.' },
        { name: 'isNgsEditorTextContent(content)', type: 'type predicate', default: '—', description: 'Checks whether block content is composed of text runs.' },
        { name: 'getNgsEditorBlockText(block)', type: 'string', default: '—', description: 'Flattens text runs in one block.' },
        { name: 'getNgsEditorDocumentText(document)', type: 'string', default: '—', description: 'Flattens document blocks separated by newlines.' },
        { name: 'isNgsEditorDocumentEmpty(document)', type: 'boolean', default: '—', description: 'Checks whether flattened document text is empty after trimming.' }
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
        { name: 'NGS_EDITOR_TOGGLE_BOLD', type: 'NgsEditorCommand<void>', default: '—', description: 'Built-in bold command.' },
        { name: 'NGS_EDITOR_TOGGLE_ITALIC', type: 'NgsEditorCommand<void>', default: '—', description: 'Built-in italic command.' },
        { name: 'NGS_EDITOR_TOGGLE_STRIKE', type: 'NgsEditorCommand<void>', default: '—', description: 'Built-in strike command.' },
        { name: 'NGS_EDITOR_TOGGLE_CODE', type: 'NgsEditorCommand<void>', default: '—', description: 'Built-in inline-code command.' }
      ]
    },
    {
      title: 'Color plugin',
      description: 'Opt-in text and highlight colors supplied by colorEditorPlugin(). Colors are stored as mark attributes in the JSON document.',
      rows: [
        { name: 'textColor', type: 'mark', default: '<span style="color: …">', description: 'Applies a foreground color without affecting the background color mark.' },
        { name: 'backgroundColor', type: 'mark', default: '<span style="background-color: …">', description: 'Applies a highlight/background color without affecting the text color mark.' },
        { name: 'NGS_EDITOR_SET_TEXT_COLOR', type: 'NgsEditorCommand<string>', default: '—', description: 'Sets or replaces the textColor mark using a color command payload.' },
        { name: 'NGS_EDITOR_UNSET_TEXT_COLOR', type: 'NgsEditorCommand<void>', default: '—', description: 'Removes the textColor mark while preserving other marks.' },
        { name: 'NGS_EDITOR_SET_BACKGROUND_COLOR', type: 'NgsEditorCommand<string>', default: '—', description: 'Sets or replaces the backgroundColor mark using a color command payload.' },
        { name: 'NGS_EDITOR_UNSET_BACKGROUND_COLOR', type: 'NgsEditorCommand<void>', default: '—', description: 'Removes the backgroundColor mark while preserving other marks.' },
        { name: 'normalizeNgsEditorColor(value)', type: 'string | null', default: '—', description: 'Normalizes supported CSS colors and design-token variables and rejects values that can escape the color declaration.' }
      ]
    },
    {
      title: 'Snapshot history',
      description: 'NgsEditorHistory is scoped with the editor and records document plus selection snapshots.',
      rows: [
        { name: 'NgsEditorSnapshot', type: '{ document; selection }', default: '—', description: 'Immutable history value containing JSON document and model selection.' },
        { name: 'canUndo', type: 'Signal<boolean>', default: 'false', description: 'Whether the past stack contains a snapshot.' },
        { name: 'canRedo', type: 'Signal<boolean>', default: 'false', description: 'Whether the future stack contains a snapshot.' },
        { name: 'record(snapshot)', type: 'void', default: '—', description: 'Adds a cloned snapshot to the past stack and clears redo state.' },
        { name: 'undo(current)', type: 'NgsEditorSnapshot | null', default: '—', description: 'Moves current state to the future stack and returns the previous snapshot.' },
        { name: 'redo(current)', type: 'NgsEditorSnapshot | null', default: '—', description: 'Moves current state to the past stack and returns the next snapshot.' },
        { name: 'clear()', type: 'void', default: '—', description: 'Clears both history stacks.' }
      ]
    }
  ];
}
