import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  createNgsEditorDocument,
  createNgsEditorParagraph,
  getNgsEditorBlockText,
  getNgsEditorDocumentText,
  NGS_EDITOR_TOGGLE_BOLD,
  NGS_EDITOR_TOGGLE_CODE,
  NGS_EDITOR_TOGGLE_ITALIC,
  NGS_EDITOR_TOGGLE_STRIKE,
  NGS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_EDITOR_SET_TEXT_COLOR,
  NGS_EDITOR_UNSET_BACKGROUND_COLOR,
  NGS_EDITOR_UNSET_TEXT_COLOR,
  NgsEditor,
  NgsEditorCommand,
  NgsEditorDocument,
  NgsEditorPlugin,
  NgsEditorSurface,
  ngsEditorDocumentsEqual,
  provideNgsEditor
} from '@ngstarter-ui/components/editor';
import {
  commentEditorPlugin,
  createCommentEditorMediaBlock,
  NGS_COMMENT_EDITOR_SET_LINK,
  NGS_COMMENT_EDITOR_TOGGLE_BLOCKQUOTE,
  NGS_COMMENT_EDITOR_TOGGLE_BULLET_LIST,
  NGS_COMMENT_EDITOR_TOGGLE_CODE_BLOCK,
  NGS_COMMENT_EDITOR_TOGGLE_ORDERED_LIST,
  NGS_COMMENT_EDITOR_UNSET_LINK,
  normalizeYoutubeUrl
} from '../comment-editor.plugin';
import { serializeCommentEditorDocument } from '../comment-editor-serializer';
import { COMMENT_EDITOR, CommentEditorAPI } from '../types';

@Component({
  selector: 'ngs-comment-editor',
  exportAs: 'ngsCommentEditor',
  imports: [Button, NgsEditorSurface],
  providers: [
    provideNgsEditor(),
    {
      provide: COMMENT_EDITOR,
      useExisting: forwardRef(() => CommentEditor)
    }
  ],
  templateUrl: './comment-editor.html',
  styleUrl: './comment-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-comment-editor',
    '[class.full-view]': 'isEditorActivated()',
    '[class.ngs-comment-editor-disabled]': 'disabled()',
    '(click)': 'activateFullView($event)'
  }
})
export class CommentEditor {
  readonly editor = inject(NgsEditor);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly surface = viewChild.required(NgsEditorSurface);
  private readonly bubbleMenuLayer = viewChild<ElementRef<HTMLElement>>('bubbleMenuLayer');
  private readonly basicPlugin = basicTextEditorPlugin();
  private readonly colorPlugin = colorEditorPlugin();
  private readonly commentPlugin = commentEditorPlugin();
  private readonly toolbarActive = signal(false);
  private readonly fullViewActive = signal(false);
  private bubbleMenuFrame: number | null = null;

  readonly value = model<NgsEditorDocument>(createNgsEditorDocument());
  readonly plugins = input<readonly NgsEditorPlugin[]>([]);
  readonly contentMaxHeight = input<number>();
  readonly buttonCancelLabel = input('Cancel');
  readonly buttonSendLabel = input('Send');
  readonly buttonSubmitLabel = input<string>();
  readonly placeholder = input('Write something …');
  readonly ariaLabel = input('Comment editor');
  readonly toolbarAlwaysVisible = input(false, { transform: booleanAttribute });
  readonly fullViewMode = input(false, { transform: booleanAttribute });
  readonly cancelButtonAlwaysVisible = input(false, { transform: booleanAttribute });
  readonly allowEmptyContent = input(false, { transform: booleanAttribute });
  readonly allowEmpty = input(false, { transform: booleanAttribute });
  readonly autoClear = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly imageUploadFn = input<(file: Blob) => Promise<string>>();

  readonly submitted = output<NgsEditorDocument>();
  readonly sent = output<string>();
  readonly canceled = output<void>();

  readonly isEditorActivated = computed(() => this.fullViewActive() || this.fullViewMode());
  readonly isToolbarVisible = computed(() => (
    (this.toolbarActive() || this.toolbarAlwaysVisible()) && this.isEditorActivated()
  ));
  readonly isBubbleMenuVisible = computed(() => {
    const selection = this.editor.selection();
    return this.editor.focused() && !!selection && (
      selection.anchor.blockId !== selection.focus.blockId ||
      selection.anchor.offset !== selection.focus.offset
    );
  });
  readonly isCancelVisible = computed(() => (
    (this.fullViewActive() && !this.fullViewMode()) || this.cancelButtonAlwaysVisible()
  ));
  readonly sendLabel = computed(() => this.buttonSubmitLabel() ?? this.buttonSendLabel());
  readonly sendDisabled = computed(() => (
    this.disabled() ||
    this.loading() ||
    (!(this.allowEmpty() || this.allowEmptyContent()) && this.editor.empty())
  ));

  private readonly commands = new Map<string, NgsEditorCommand<any>>([
    ['toggleBold', NGS_EDITOR_TOGGLE_BOLD],
    ['toggleItalic', NGS_EDITOR_TOGGLE_ITALIC],
    ['toggleStrike', NGS_EDITOR_TOGGLE_STRIKE],
    ['toggleCode', NGS_EDITOR_TOGGLE_CODE],
    ['toggleBlockquote', NGS_COMMENT_EDITOR_TOGGLE_BLOCKQUOTE],
    ['toggleCodeBlock', NGS_COMMENT_EDITOR_TOGGLE_CODE_BLOCK],
    ['toggleBulletList', NGS_COMMENT_EDITOR_TOGGLE_BULLET_LIST],
    ['toggleOrderedList', NGS_COMMENT_EDITOR_TOGGLE_ORDERED_LIST]
  ]);

  readonly api: CommentEditorAPI = {
    isCommandDisabled: command => this.isCommandDisabled(command),
    isActive: command => this.isActive(command),
    runCommand: command => this.runCommand(command),
    editor: () => this.editor,
    document: () => this.editor.document(),
    isToolbarActive: () => this.toolbarActive(),
    toggleToolbar: () => this.toggleToolbar(),
    showToolbar: () => this.showToolbar(),
    hideToolbar: () => this.hideToolbar(),
    isEditorActivated: () => this.isEditorActivated(),
    showFullView: () => this.showFullView(),
    hideFullView: () => this.hideFullView(),
    insertText: text => this.insertText(text),
    insertImage: file => this.insertImage(file),
    insertYoutube: url => this.insertYoutube(url),
    getMarkAttributes: type => this.editor.getActiveMark(type)?.attrs,
    setTextColor: color => this.setTextColor(color),
    unsetTextColor: () => this.unsetTextColor(),
    setBackgroundColor: color => this.setBackgroundColor(color),
    unsetBackgroundColor: () => this.unsetBackgroundColor(),
    setLink: url => this.setLink(url),
    unsetLink: () => this.unsetLink(),
    clear: () => this.clear(),
    focus: () => this.focus()
  };

  constructor() {
    effect(() => {
      this.editor.setPlugins([
        this.basicPlugin,
        this.colorPlugin,
        this.commentPlugin,
        ...this.plugins()
      ]);
    });

    effect(() => {
      const value = this.value();
      untracked(() => {
        if (!ngsEditorDocumentsEqual(value, this.editor.document())) {
          this.editor.setDocument(value);
        }
      });
    });

    effect(() => {
      const document = this.editor.document();
      if (this.editor.origin() !== 'external' && !ngsEditorDocumentsEqual(document, this.value())) {
        this.value.set(document);
      }
    });

    effect(() => {
      this.editor.setReadOnly(this.disabled() || this.readOnly());
    });

    effect(() => {
      const maxHeight = this.contentMaxHeight();
      if (typeof maxHeight === 'number') {
        this.renderer.setStyle(
          this.host.nativeElement,
          '--ngs-comment-editor-content-max-height',
          `${Math.max(0, maxHeight)}px`
        );
      } else {
        this.renderer.removeStyle(this.host.nativeElement, '--ngs-comment-editor-content-max-height');
      }
    });

    effect(() => {
      this.editor.selection();
      this.editor.focused();
      this.editor.revision();
      const layer = this.bubbleMenuLayer();
      if (layer && this.isBubbleMenuVisible()) {
        untracked(() => this.scheduleBubbleMenuPosition());
      }
    });

    afterNextRender(() => {
      const windowRef = this.documentRef.defaultView;
      if (!windowRef) {
        return;
      }
      const reposition = () => this.scheduleBubbleMenuPosition();
      windowRef.addEventListener('resize', reposition);
      this.documentRef.addEventListener('scroll', reposition, true);
      this.destroyRef.onDestroy(() => {
        windowRef.removeEventListener('resize', reposition);
        this.documentRef.removeEventListener('scroll', reposition, true);
        if (this.bubbleMenuFrame !== null) {
          windowRef.cancelAnimationFrame(this.bubbleMenuFrame);
        }
      });
    });
  }

  insertText(text: string): void {
    if (!text || this.disabled() || this.readOnly()) {
      return;
    }

    if (!this.editor.focused()) {
      const lastTextBlock = [...this.editor.document().blocks]
        .reverse()
        .find(block => Array.isArray(block.content));
      if (lastTextBlock) {
        const offset = getNgsEditorBlockText(lastTextBlock).length;
        this.editor.setSelection({
          anchor: { blockId: lastTextBlock.id, offset },
          focus: { blockId: lastTextBlock.id, offset }
        });
      } else {
        const paragraph = createNgsEditorParagraph();
        this.editor.insertBlock(paragraph, true);
      }
    }

    const value = getNgsEditorDocumentText(this.editor.document()).length > 0 && !this.editor.focused()
      ? ` ${text} `
      : text;
    const singleEmoji = isOnlyEmoji(text) && this.currentBlockIsEmpty();
    if (singleEmoji) {
      this.editor.setMark('singleEmoji');
    }
    this.editor.insertText(value, 'api');
    if (singleEmoji) {
      this.editor.unsetMark('singleEmoji');
    }
    this.showFullView();
    queueMicrotask(() => this.focus());
  }

  isCommandDisabled(command: string): boolean | null {
    if (command === 'toggleLink') {
      const selection = this.editor.selection();
      const collapsed = !selection || (
        selection.anchor.blockId === selection.focus.blockId &&
        selection.anchor.offset === selection.focus.offset
      );
      return this.editor.readOnly() || collapsed ? true : null;
    }
    const resolved = this.commands.get(command);
    return !resolved || !this.editor.isCommandEnabled(resolved) ? true : null;
  }

  isActive(command: string): boolean {
    const markAliases: Record<string, string> = {
      bold: 'bold',
      italic: 'italic',
      strike: 'strike',
      code: 'code',
      link: 'link'
    };
    if (markAliases[command]) {
      return this.editor.isMarkActive(markAliases[command]);
    }
    const resolved = this.commands.get(command);
    return resolved ? this.editor.isCommandActive(resolved) : false;
  }

  runCommand(command: string): void {
    const resolved = this.commands.get(command);
    if (resolved) {
      this.editor.execute(resolved);
      this.focus();
    }
  }

  send(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    if (this.sendDisabled()) {
      return;
    }

    const document = this.editor.document();
    this.submitted.emit(document);
    this.sent.emit(serializeCommentEditorDocument(document));

    if (this.autoClear()) {
      this.toolbarActive.set(false);
      this.fullViewActive.set(false);
      this.clear();
    }
  }

  submit(event?: Event): void {
    this.send(event);
  }

  cancel(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.toolbarActive.set(false);
    this.fullViewActive.set(false);
    this.clear();
    this.canceled.emit();
  }

  clear(): void {
    this.editor.clear();
  }

  activateFullView(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.closest('button, a')) {
        return;
      }
    }
    this.showFullView();
  }

  showFullView(): void {
    this.fullViewActive.set(true);
  }

  hideFullView(): void {
    this.fullViewActive.set(false);
  }

  toggleToolbar(): void {
    this.toolbarActive.update(visible => !visible);
  }

  showToolbar(): void {
    this.toolbarActive.set(true);
  }

  hideToolbar(): void {
    this.toolbarActive.set(false);
  }

  focus(): void {
    this.surface().focus();
  }

  setLink(url: string): boolean {
    if (!url.trim()) {
      return this.unsetLink();
    }
    return this.editor.execute(NGS_COMMENT_EDITOR_SET_LINK, url);
  }

  setTextColor(color: string): boolean {
    return this.editor.execute(NGS_EDITOR_SET_TEXT_COLOR, color);
  }

  unsetTextColor(): boolean {
    return this.editor.execute(NGS_EDITOR_UNSET_TEXT_COLOR);
  }

  setBackgroundColor(color: string): boolean {
    return this.editor.execute(NGS_EDITOR_SET_BACKGROUND_COLOR, color);
  }

  unsetBackgroundColor(): boolean {
    return this.editor.execute(NGS_EDITOR_UNSET_BACKGROUND_COLOR);
  }

  unsetLink(): boolean {
    return this.editor.execute(NGS_COMMENT_EDITOR_UNSET_LINK);
  }

  insertYoutube(url: string): boolean {
    const src = normalizeYoutubeUrl(url);
    if (!src) {
      return false;
    }
    const inserted = this.editor.insertBlock(createCommentEditorMediaBlock('youtube', { src }));
    if (inserted) {
      this.showFullView();
    }
    return inserted;
  }

  insertImage(file: File): void {
    if (this.disabled() || this.readOnly()) {
      return;
    }
    void this.readFile(file).then(preview => {
      const block = createCommentEditorMediaBlock('imageUpload', {
        src: preview,
        status: 'uploading'
      });
      if (!this.editor.insertBlock(block)) {
        return;
      }
      this.showFullView();
      const upload = this.imageUploadFn();
      const result = upload ? upload(file) : Promise.resolve(preview);
      result.then(
        src => this.editor.updateBlock(block.id, {
          type: 'image',
          attrs: { src, alt: file.name }
        }),
        error => this.editor.updateBlock(block.id, {
          attrs: {
            src: preview,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
          }
        })
      );
    });
  }

  private currentBlockIsEmpty(): boolean {
    const selection = this.editor.selection();
    const block = this.editor.document().blocks.find(item => item.id === selection?.focus.blockId);
    return !!block && getNgsEditorBlockText(block).length === 0;
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('Unable to read image'));
      reader.readAsDataURL(file);
    });
  }

  private scheduleBubbleMenuPosition(): void {
    const windowRef = this.documentRef.defaultView;
    if (!windowRef) {
      return;
    }
    if (this.bubbleMenuFrame !== null) {
      windowRef.cancelAnimationFrame(this.bubbleMenuFrame);
    }
    this.bubbleMenuFrame = windowRef.requestAnimationFrame(() => {
      this.bubbleMenuFrame = null;
      this.positionBubbleMenu();
    });
  }

  private positionBubbleMenu(): void {
    const layer = this.bubbleMenuLayer()?.nativeElement;
    if (!layer) {
      return;
    }
    const selectionRect = this.surface().getSelectionRect();
    if (!selectionRect || !this.isBubbleMenuVisible()) {
      this.renderer.removeClass(layer, 'bubble-menu-positioned');
      return;
    }

    const viewportWidth = this.documentRef.documentElement.clientWidth;
    const layerWidth = layer.getBoundingClientRect().width;
    const edge = 8;
    const halfWidth = layerWidth / 2;
    const selectionCenter = selectionRect.left + selectionRect.width / 2;
    const x = layerWidth + edge * 2 >= viewportWidth
      ? viewportWidth / 2
      : Math.min(
        Math.max(selectionCenter, edge + halfWidth),
        viewportWidth - edge - halfWidth
      );

    this.renderer.setStyle(layer, 'left', `${x}px`);
    this.renderer.setStyle(layer, 'top', `${selectionRect.top}px`);
    this.renderer.addClass(layer, 'bubble-menu-positioned');
  }
}

function isOnlyEmoji(value: string): boolean {
  if (!value.trim()) {
    return false;
  }
  return /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u200d\ufe0f])+$/u.test(value.trim());
}
