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

interface CommentEditorApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
}

interface CommentEditorApiSection {
  readonly title: string;
  readonly description: string;
  readonly rows: readonly CommentEditorApiRow[];
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
  styleUrl: './api.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Api {
  readonly sections: readonly CommentEditorApiSection[] = [
    {
      title: 'Inputs',
      description: 'JSON state, editor behavior, labels, layout, and integration callbacks.',
      rows: [
        { name: 'value', type: 'ModelSignal<NgsEditorDocument>', default: 'empty document', description: 'Two-way bound versioned JSON document. This is the canonical content value.' },
        { name: 'plugins', type: 'readonly NgsEditorPlugin[]', default: '[]', description: 'Additional editor plugins installed after the basic text, color, and Comment Editor feature plugins.' },
        { name: 'contentMaxHeight', type: 'number | undefined', default: 'undefined', description: 'Maximum expanded content height in pixels before the editing surface scrolls.' },
        { name: 'placeholder', type: 'string', default: 'Write something …', description: 'Placeholder rendered while the JSON document is empty.' },
        { name: 'ariaLabel', type: 'string', default: 'Comment editor', description: 'Accessible label for the contenteditable surface.' },
        { name: 'buttonCancelLabel', type: 'string', default: 'Cancel', description: 'Cancel action label.' },
        { name: 'buttonSendLabel', type: 'string', default: 'Send', description: 'Send action label.' },
        { name: 'buttonSubmitLabel', type: 'string | undefined', default: 'undefined', description: 'Optional submit-label alias. When set, it takes precedence over buttonSendLabel.' },
        { name: 'toolbarAlwaysVisible', type: 'boolean', default: 'false', description: 'Keeps the projected toolbar visible while the editor is expanded.' },
        { name: 'fullViewMode', type: 'boolean', default: 'false', description: 'Keeps the editor in its expanded layout.' },
        { name: 'cancelButtonAlwaysVisible', type: 'boolean', default: 'false', description: 'Shows cancel independently of interactive expansion state.' },
        { name: 'allowEmptyContent', type: 'boolean', default: 'false', description: 'Legacy-compatible option allowing an empty send.' },
        { name: 'allowEmpty', type: 'boolean', default: 'false', description: 'Allows an empty JSON document to be submitted.' },
        { name: 'autoClear', type: 'boolean', default: 'true', description: 'Clears the document and closes transient UI state after a successful send.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Shows the send action loading state and prevents send/cancel.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables editing and component actions.' },
        { name: 'readOnly', type: 'boolean', default: 'false', description: 'Keeps content visible while preventing document mutations.' },
        { name: 'imageUploadFn', type: '(file: Blob) => Promise<string>', default: 'data URL fallback', description: 'Uploads an image and resolves its final URL. The editor inserts an immediate preview placeholder and retains rejected upload state.' }
      ]
    },
    {
      title: 'Outputs',
      description: 'JSON-first submission with an HTML compatibility output.',
      rows: [
        { name: 'submitted', type: 'NgsEditorDocument', default: '—', description: 'Emits the canonical JSON document on send.' },
        { name: 'sent', type: 'string', default: '—', description: 'Emits escaped serialized HTML generated from the same JSON document.' },
        { name: 'canceled', type: 'void', default: '—', description: 'Emits after cancel clears content and transient toolbar/full-view state.' }
      ]
    },
    {
      title: 'Component methods and signals',
      description: 'Public surface available through a template reference such as #editor.',
      rows: [
        { name: 'editor', type: 'NgsEditor', default: 'scoped instance', description: 'Signal-based editor service owned by this Comment Editor.' },
        { name: 'api', type: 'CommentEditorAPI', default: 'scoped facade', description: 'Stable facade used by command directives and application code.' },
        { name: 'isEditorActivated', type: 'Signal<boolean>', default: 'computed', description: 'Whether the expanded editor layout is active.' },
        { name: 'isToolbarVisible', type: 'Signal<boolean>', default: 'computed', description: 'Whether the projected toolbar is currently rendered.' },
        { name: 'isBubbleMenuVisible', type: 'Signal<boolean>', default: 'computed', description: 'Whether a non-collapsed selection should show the projected bubble menu.' },
        { name: 'isCancelVisible', type: 'Signal<boolean>', default: 'computed', description: 'Whether the cancel action is currently visible.' },
        { name: 'sendDisabled', type: 'Signal<boolean>', default: 'computed', description: 'Combines disabled, loading, allow-empty, and editor-empty state.' },
        { name: 'send(event?) / submit(event?)', type: 'void', default: '—', description: 'Emits JSON and HTML outputs, then applies autoClear.' },
        { name: 'cancel(event?)', type: 'void', default: '—', description: 'Clears content, resets transient view state, and emits canceled.' },
        { name: 'clear()', type: 'void', default: '—', description: 'Resets the scoped editor to an empty paragraph.' },
        { name: 'focus()', type: 'void', default: '—', description: 'Focuses the editor surface and restores its model selection.' },
        { name: 'showFullView() / hideFullView()', type: 'void', default: '—', description: 'Controls transient expanded state.' },
        { name: 'showToolbar() / hideToolbar() / toggleToolbar()', type: 'void', default: '—', description: 'Controls the projected toolbar.' },
        { name: 'insertText(text)', type: 'void', default: '—', description: 'Programmatically inserts text at the selection; a standalone emoji receives the single-emoji mark.' },
        { name: 'insertImage(file)', type: 'void', default: '—', description: 'Creates an upload placeholder, invokes imageUploadFn, and replaces or annotates the media block.' },
        { name: 'insertYoutube(url)', type: 'boolean', default: '—', description: 'Validates a YouTube URL and inserts a privacy-enhanced embed block.' },
        { name: 'setTextColor(color) / unsetTextColor()', type: 'boolean', default: '—', description: 'Applies or removes the textColor mark for the current selection or caret.' },
        { name: 'setBackgroundColor(color) / unsetBackgroundColor()', type: 'boolean', default: '—', description: 'Applies or removes the backgroundColor highlight mark for the current selection or caret.' },
        { name: 'setLink(url) / unsetLink()', type: 'boolean', default: '—', description: 'Applies, edits, or removes the link mark for the current text selection.' }
      ]
    },
    {
      title: 'Projection components',
      description: 'The Comment Editor owns behavior and layout; applications project the controls they need.',
      rows: [
        { name: 'CommentEditorToolbar', type: 'ngs-comment-editor-toolbar', default: 'optional', description: 'Projected top formatting toolbar controlled by toolbar visibility state.' },
        { name: 'CommentEditorFooterBar', type: 'ngs-comment-editor-footer-bar', default: 'optional', description: 'Projected footer tools placed before cancel and send actions.' },
        { name: 'CommentEditorBubbleMenu', type: 'ngs-comment-editor-bubble-menu', default: 'optional', description: 'Projected selection menu with link preview, editing, and formatting controls.' },
        { name: 'CommentEditorDivider', type: 'ngs-comment-editor-divider', default: 'optional', description: 'Visual separator for projected command groups.' }
      ]
    },
    {
      title: 'Command directives',
      description: 'Composable behavior for projected buttons. Combine formatting directives with ngsCommentEditorCommand.',
      rows: [
        { name: 'ngsCommentEditorCommand', type: 'directive', default: '—', description: 'Applies the shared command button class.' },
        { name: 'ngsCommentEditorCommandBold', type: 'directive', default: 'Mod-b', description: 'Toggles bold and reflects active/disabled state.' },
        { name: 'ngsCommentEditorCommandItalic', type: 'directive', default: 'Mod-i', description: 'Toggles italic and reflects active/disabled state.' },
        { name: 'ngsCommentEditorCommandStrike', type: 'directive', default: 'Mod-Shift-x', description: 'Toggles strike.' },
        { name: 'ngsCommentEditorCommandCode', type: 'directive', default: 'Mod-e', description: 'Toggles inline code.' },
        { name: 'ngsCommentEditorCommandBlockquote', type: 'directive', default: 'Mod-Shift-b', description: 'Toggles the active text block between paragraph and blockquote.' },
        { name: 'ngsCommentEditorCommandCodeBlock', type: 'directive', default: 'Mod-Alt-c', description: 'Toggles a code block.' },
        { name: 'ngsCommentEditorCommandBulletList', type: 'directive', default: 'Mod-Shift-8', description: 'Toggles a bullet-list block.' },
        { name: 'ngsCommentEditorCommandOrderedList', type: 'directive', default: 'Mod-Shift-7', description: 'Toggles an ordered-list block.' },
        { name: 'ngsCommentEditorCommandLink', type: 'directive', default: '—', description: 'Opens the link dialog and applies a normalized link mark.' },
        { name: 'ngsCommentEditorCommandEditLink', type: 'directive', default: '—', description: 'Edits the active link from the bubble menu.' },
        { name: 'ngsCommentEditorCommandUnsetLink', type: 'directive', default: '—', description: 'Removes the active link mark.' },
        { name: 'ngsCommentEditorCommandImage', type: 'directive', default: 'image/*', description: 'Opens file selection and forwards the chosen image to insertImage().' },
        { name: 'ngsCommentEditorCommandYoutube', type: 'directive', default: '—', description: 'Opens the YouTube dialog and inserts a validated media block.' },
        { name: 'ngsCommentEditorCommandToggleToolbar', type: 'directive', default: '—', description: 'Toggles projected toolbar visibility and reflects active state.' }
      ]
    },
    {
      title: 'Comment Editor plugin and serialization',
      description: 'Public building blocks used by the prebuilt component and available to custom Angular shells.',
      rows: [
        { name: 'colorEditorPlugin()', type: 'NgsEditorPlugin', default: 'installed by CommentEditor', description: 'Adds text and background color marks and their set/unset commands.' },
        { name: 'commentEditorPlugin()', type: 'NgsEditorPlugin', default: 'installed by CommentEditor', description: 'Adds blockquote, code block, list, image, upload, YouTube, link, and single-emoji definitions and commands.' },
        { name: 'createCommentEditorMediaBlock(type, attrs)', type: 'NgsEditorBlock<null>', default: '—', description: 'Creates a serializable image, upload-placeholder, or YouTube block.' },
        { name: 'normalizeLinkUrl(value)', type: 'string', default: '—', description: 'Normalizes HTTP(S), mailto, and tel destinations and prefixes plain hosts with HTTPS.' },
        { name: 'normalizeYoutubeUrl(value)', type: 'string | null', default: '—', description: 'Accepts watch, short, shorts, or embed URLs and returns a youtube-nocookie embed URL.' },
        { name: 'serializeCommentEditorDocument(document)', type: 'string', default: '—', description: 'Serializes supported JSON blocks and marks to escaped HTML. Unresolved upload placeholders are omitted.' }
      ]
    }
  ];
}
