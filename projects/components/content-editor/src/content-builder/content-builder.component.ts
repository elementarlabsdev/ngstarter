import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  input, numberAttribute,
  OnInit, OnDestroy, output, PLATFORM_ID,
  signal,
  ElementRef,
  AfterViewInit,
  effect, EffectRef, runInInjectionContext, EnvironmentInjector, ChangeDetectorRef
} from '@angular/core';
import {
  CONTENT_BUILDER,
  ContentEditorBlock,
  ContentEditorBlockDef,
  ContentEditorItemProperty,
  ContentEditorOptions,
} from '../types';
import { Icon } from '@ngstarter-ui/components/icon';
import { AsyncPipe, isPlatformServer, NgComponentOutlet } from '@angular/common';
import { v7 as uuid } from 'uuid';
import { ContentBuilderStore } from '../content-builder.store';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragStart,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { Menu, MenuItem, MenuTrigger, MenuCloseReason, MenuHeading } from '@ngstarter-ui/components/menu';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { ContentEditorQuoteBlock } from '../_builder/quote-block/quote-block.component';
import { TextSelectionPopupDirective } from '../text-selection-popup.directive';
import { CommandBarComponent } from '../command-bar/command-bar.component';
import { BlockSelectionDirective } from '../directives/block-selection.directive';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { auditTime, distinctUntilChanged, map, startWith, shareReplay } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { List, ListItem, ListItemIcon, ListItemTitle } from '@ngstarter-ui/components/list';

@Component({
  selector: 'ngs-content-builder',
  exportAs: 'ngsContentBuilder',
  imports: [
    Icon,
    NgComponentOutlet,
    AsyncPipe,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    CdkDragPlaceholder,
    Menu,
    MenuItem,
    MenuTrigger,
    CdkMonitorFocus,
    TextSelectionPopupDirective,
    PopoverTriggerForDirective,
    Popover,
    ListItemTitle,
    ListItemIcon,
    ListItem,
    List,
    MenuHeading
  ],
  hostDirectives: [
    {
      directive: BlockSelectionDirective,
      inputs: [
        'autoScrollContainerSelector',
      ]
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ContentBuilderStore,
    {
      provide: CONTENT_BUILDER,
      useExisting: forwardRef(() => ContentBuilderComponent)
    }
  ],
  templateUrl: './content-builder.component.html',
  styleUrl: './content-builder.component.scss',
  host: {
    'class': 'ngs-content-builder',
    '[class.is-block-dragging]': '_blockDragging()',
    '[class.is-selection-of-blocks-active]': 'isSelectionOfBlocksActive()',
    '[class.select-none]': 'isSelectionOfBlocksActive()',
    '[style.user-select]': 'isSelectionOfBlocksActive() ? "none" : null',
    'tabindex': '0',
    '(paste)': '_onPaste($event)',
    '(keydown)': '_onKeyDown($event)',
  }
})
export class ContentBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);
  private _store = inject(ContentBuilderStore);
  private elRef = inject(ElementRef<HTMLElement>);
  private envInjector = inject(EnvironmentInjector);
  private cdr = inject(ChangeDetectorRef);
  private confirmManager = inject(ConfirmManager);
  private _resolvedScrollContainer: Element | Window | null = null;
  private _scrollEffect?: EffectRef;
  private _scrollSubject = new Subject<number>();
  private _scrollBindSub: Subscription | null = null;
  private _scroll$: Observable<number> | null = null;

  public get scrollContainerScrolled(): Observable<number> {
    if (!this._scroll$) {
      this._scroll$ = this._scrollSubject.asObservable().pipe(shareReplay(1));
    }
    return this._scroll$;
  }

  private blockDefs = signal<ContentEditorBlockDef[]>([
    {
      component: () => import('../_builder/divider-block/divider-block.component').then(c => c.DividerBlockComponent),
      type: 'divider',
      options: {},
      empty: () => {
        return {
          content: null,
          settings: {}
        };
      }
    },
    {
      component: () => import('../_builder/paragraph-block/paragraph-block.component').then(c => c.ParagraphBlockComponent),
      type: 'paragraph',
      options: {},
      empty: () => {
        return {
          content: '',
          props: [],
          settings: {}
        };
      }
    },
    {
      component: () => import('../_builder/code-block/code-block.component').then(c => c.CodeBlockComponent),
      type: 'code',
      options: {},
      empty: () => {
        return {
          content: '',
          settings: {
            language: 'none',
          }
        };
      }
    },
    {
      component: () => import('../_builder/heading-block/heading-block.component').then(c => c.HeadingBlockComponent),
      type: 'heading',
      options: {},
      empty: () => {
        return {
          content: '',
          props: [],
          settings: {
            level: 2
          }
        };
      }
    },
    {
      component: () => import('../_builder/image-block/image-block.component').then(c => c.ImageBlockComponent),
      type: 'image',
      options: {
        uploadFn: (file: File, base64: string) => {
          return new Promise((resolve) => {
            resolve(base64);
          });
        }
      },
      empty: () => {
        return {
          content: {
            src: '',
            alt: ''
          },
          settings: {
            alignment: 'center',
            width: 'auto',
            height: 'auto',
            align: 'center',
            natualWidth: 'auto',
            naturalHeight: 'auto'
          }
        };
      }
    },
    {
      component: () => import('../_builder/video-block/video-block.component').then(c => c.VideoBlockComponent),
      type: 'video',
      options: {
        uploadFn: (file: File, base64: string) => {
          return new Promise((resolve) => {
            resolve(base64);
          });
        }
      },
      empty: () => {
        return {
          content: {
            src: '',
            caption: '',
            orientation: 'landscape'
          },
          settings: {
            alignment: 'center',
            width: 'auto',
            height: 'auto',
            align: 'center',
            natualWidth: 'auto',
            naturalHeight: 'auto'
          }
        };
      }
    },
    {
      component: () => import('../_builder/list-block/list-block.component').then(c => c.ListBlockComponent),
      type: 'bulletList',
      options: {},
      empty: () => {
        return {
          content: [],
          settings: {
            listStyle: 'bullet'
          }
        };
      }
    },
    {
      component: () => import('../_builder/list-block/list-block.component').then(c => c.ListBlockComponent),
      type: 'orderedList',
      options: {},
      empty: () => {
        return {
          content: [],
          settings: {
            listStyle: 'ordered'
          }
        };
      }
    },
    {
      component: () => import('../_builder/table-block/table-block.component').then(c => c.TableBlockComponent),
      type: 'table',
      options: {},
      empty: () => {
        return {
          content: [
            [
              {
                content: '',
                props: [],
                styles: {},
                options: {
                  colspan: 1,
                  rowspan: 1
                },
              },
              {
                content: '',
                props: [],
                styles: {},
                options: {
                  colspan: 1,
                  rowspan: 1
                }
              },
              {
                content: '',
                props: [],
                styles: {},
                options: {
                  colspan: 1,
                  rowspan: 1
                }
              }
            ],
            [
              {
                content: '',
                props: [],
                styles: {},
                options: {
                  colspan: 1,
                  rowspan: 1
                }
              },
              {
                content: '',
                props: [],
                options: {
                  colspan: 1,
                  rowspan: 1
                }
              },
              {
                content: '',
                props: [],
                styles: {},
                options: {
                  colspan: 1,
                  rowspan: 1
                }
              }
            ],
          ],
          settings: {}
        };
      }
    },
    {
      component: () => import('../_builder/quote-block/quote-block.component').then(c => c.QuoteBlockComponent),
      type: 'quote',
      options: {},
      empty: (): ContentEditorQuoteBlock => {
        return {
          content: {
            cite: {
              content: '',
              props: []
            },
            caption: {
              content: '',
              props: []
            }
          },
          settings: {}
        };
      }
    },
    {
      component: () => import('../_builder/embed-block/embed-block').then(c => c.EmbedBlock),
      type: 'embed',
      options: {},
      empty: () => {
        return {
          content: {
            url: '',
            type: ''
          },
          settings: {}
        };
      }
    },
  ]);

  content = input<ContentEditorBlock[]>([]);
  contentChangedDelay = input(500, {
    transform: numberAttribute
  });
  suggestions = input<any>([
    {
      type: 'heading',
      title: 'Headings',
    },
    {
      type: 'item',
      title: 'Heading 1',
      description: 'Top-level heading',
      iconName: 'fluent:text-header-1-24-regular',
      hotKeys: 'ALT + 1',
      blockType: 'heading',
      blockSettings: {
        level: 1
      }
    },
    {
      type: 'item',
      title: 'Heading 2',
      description: 'Key section heading',
      iconName: 'fluent:text-header-2-24-regular',
      hotKeys: 'ALT + 2',
      blockType: 'heading',
      blockSettings: {
        level: 2
      }
    },
    {
      type: 'item',
      title: 'Heading 3',
      description: 'Subsection and group heading',
      iconName: 'fluent:text-header-3-24-regular',
      hotKeys: 'ALT + 3',
      blockType: 'heading',
      blockSettings: {
        level: 3
      }
    },
    {
      type: 'heading',
      title: 'Basic blocks',
    },
    {
      type: 'item',
      title: 'Paragraph',
      description: 'The body of your document',
      iconName: 'fluent:text-paragraph-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'paragraph',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Numbered List',
      description: 'List with ordered items',
      iconName: 'fluent:text-bullet-list-tree-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'orderedList',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Bullet List',
      description: 'List with unordered items',
      iconName: 'fluent:text-bullet-list-ltr-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'bulletList',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Quote',
      description: 'Quote or excerpt',
      iconName: 'fluent:text-quote-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'quote',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Code',
      description: 'The code block with syntax highlighting',
      iconName: 'fluent:code-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'code',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Divider',
      description: 'Visually divide blocks',
      iconName: 'fluent:minimize-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'divider',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Table',
      description: 'Table with editable cells',
      iconName: 'fluent:table-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'table',
      blockSettings: {}
    },
    {
      type: 'heading',
      title: 'Media',
    },
    {
      type: 'item',
      title: 'Image',
      description: 'Image with caption',
      iconName: 'fluent:image-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'image',
      blockSettings: {}
    },
    {
      type: 'item',
      title: 'Video',
      description: 'Video with caption',
      iconName: 'fluent:video-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'video',
      blockSettings: {}
    },
    {
      type: 'heading',
      title: 'Embeds',
    },
    {
      type: 'item',
      title: 'Embed',
      description: 'For PDFs, Google Maps and more',
      iconName: 'fluent:window-24-regular',
      hotKeys: 'ALT + 0',
      blockType: 'embed',
      blockSettings: {
        width: null,
        height: null
      }
    },
  ]);
  options = input<ContentEditorOptions>({});
  scrollContainer = input<string>();

  readonly contentChanged = output<ContentEditorBlock[]>();

  readonly focusChanged = new EventEmitter<void>();
  protected _content = signal<ContentEditorBlock[]>([]);
  protected blockDefsMap = new Map<string, any>();
  protected blockDefsOptionsMap = new Map<string, any>();
  protected _blockDragging = signal(false);
  public isSelectionOfBlocksActive = signal(false);

  _oldContent = signal({});
  readonly selectedBlocksModel = new SelectionModel(true);

  commandBar = CommandBarComponent;

  get api() {
    return {
      focusChanged: new EventEmitter<void>(),
    }
  }

  // Build helper maps: component map and merged options map
  private buildBlockDefMaps() {
    const overrides = this.options() || {} as ContentEditorOptions;
    this.blockDefsMap = new Map<string, any>();
    this.blockDefsOptionsMap = new Map<string, any>();

    this.blockDefs().forEach((def) => {
      if (!this.blockDefsMap.has(def.type)) {
        this.blockDefsMap.set(def.type, def.component());
      }
      const merged = {
        ...(def.options || {}),
        ...(overrides[def.type] || {})
      };
      this.blockDefsOptionsMap.set(def.type, merged);
    });
  }

  getBlockDefOption(type: string, key: string): any {
    return this.blockDefsOptionsMap.get(type)[key];
  }

  ngOnInit() {
    const content = this.content();

    if (content.length > 0) {
      const lastItem = content[content.length - 1];

      if (lastItem.type !== 'paragraph' || (lastItem.type === 'paragraph' && lastItem.content !== '')) {
        content.push(this._createBlock('paragraph'));
      }
    } else {
      content.push(this._createBlock('paragraph'));
    }

    this._content.set(content);
    this._oldContent.set(this._content());

    // Build block component map and merged options map
    this.buildBlockDefMaps();

    this._store.setBlocks(JSON.parse(JSON.stringify(content)));

    if (isPlatformServer(this._platformId)) {
      return;
    }

    if (content.length === 1) {
      this.focusBlock(content[0].id);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    // Initial resolve after view init
    this._resolvedScrollContainer = this._computeScrollContainer();
    // Привязываем подписку на скролл к текущему контейнеру
    this._rebindScrollListener();

    // Watch for changes of the input selector and recompute when it changes.
    // Create the signal effect within a valid injection context to satisfy Angular's requirement.
    runInInjectionContext(this.envInjector, () => {
      this._scrollEffect = effect(() => {
        const _selector = this.scrollContainer();
        this._resolvedScrollContainer = this._computeScrollContainer();
        // Перепривязка слушателя при смене контейнера
        this._rebindScrollListener();
      });
    });
  }

  /**
   * Public accessor for the resolved scroll container. If not computed yet, it will compute now.
   */
  getScrollContainer(): Element | Window {
    if (isPlatformServer(this._platformId)) {
      return ({} as any);
    }
    if (!this._resolvedScrollContainer) {
      this._resolvedScrollContainer = this._computeScrollContainer();
    }
    return this._resolvedScrollContainer || (window as unknown as Window);
  }

  /**
   * Resolves the scroll container element according to the following rules:
   * - If `scrollContainer` input is provided, uses `closest(selector)` starting from the host element.
   * - If not provided or `closest` returned null, automatically finds the first scrollable parent by walking up the DOM.
   * - Fallback to `document.scrollingElement` or `window` if nothing suitable found.
   */
  private _computeScrollContainer(): Element | Window | null {
    if (isPlatformServer(this._platformId)) {
      return null;
    }
    const host: HTMLElement = this.elRef?.nativeElement as HTMLElement;
    if (!host) {
      return (document.scrollingElement || window);
    }

    const selector = this.scrollContainer();
    if (selector && typeof selector === 'string') {
      try {
        const matched = host.closest(selector);
        if (matched) {
          return matched as Element;
        }
      } catch (_) {
        // If selector is invalid, ignore and fallback to auto detection
      }
    }

    // Auto-detect by traversing parents
    let parent: HTMLElement | null = host.parentElement;
    while (parent) {
      if (this._isElementScrollable(parent)) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return (document.scrollingElement || window);
  }

  private _isElementScrollable(el: HTMLElement): boolean {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && el.scrollHeight > el.clientHeight;
    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') && el.scrollWidth > el.clientWidth;
    return canScrollY || canScrollX;
  }

  private _rebindScrollListener(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    // Отписываемся от предыдущего контейнера, если был
    if (this._scrollBindSub) {
      try {
        this._scrollBindSub.unsubscribe();
      } catch {
      }
      this._scrollBindSub = null;
    }
    const container = this._resolvedScrollContainer ?? this._computeScrollContainer();
    if (!container) {
      return;
    }
    // Формируем источник скролла
    const getTop = () => {
      if (container instanceof Window) {
        return container.scrollY || (container as any).pageYOffset || 0;
      }
      return (container as Element).scrollTop || 0;
    };
    const source$ = fromEvent(container as any, 'scroll').pipe(
      auditTime(50),
      map(() => getTop()),
      startWith(getTop()),
      distinctUntilChanged(),
    );
    // Подписка: проксируем значения в общий Subject
    this._scrollBindSub = source$.subscribe(top => {
      this._scrollSubject.next(top);
    });
  }

  // удалён дубликат ngOnDestroy — см. реализацию в конце класса

  appendBlock(type: string, focus: boolean = true) {
    this.insertBlock(type, this._content().length, {}, focus);
  }

  insertBlock(type: string, index: number, options?: object, focus: boolean = true, content?: any): any {
    const isLastIndex = index === this._content().length;
    const newBlock = this._createBlock(type, options, content);

    if (focus) {
      this.focusBlock(newBlock.id);
    }

    this._content.update((data: ContentEditorBlock[]) => {
      return [...data.slice(0, index), newBlock, ...data.slice(index)];
    });
    this._store.addBlock(newBlock, index);

    if (isLastIndex && this._content()[index].type !== 'paragraph') {
      this.appendBlock('paragraph', false);
    }

    this.emitContentChangeEvent();

    return newBlock;
  }

  private _createBlock(type: string, settings = {}, content?: any): ContentEditorBlock {
    const blockDef = this.blockDefs().find(
      blockDefItem => blockDefItem.type === type
    ) as ContentEditorBlockDef;
    const empty = blockDef.empty();

    if (settings) {
      empty.settings = {
        ...empty.settings,
        ...settings
      };
    }

    if (content !== undefined) {
      empty.content = content;
    }

    return {
      id: uuid(),
      type: blockDef.type,
      isEmpty: content === undefined || content === '' || (Array.isArray(content) && content.length === 0),
      ...empty
    };
  }

  addBlock(type: string, options: object, index: number = -1) {
    if (index === -1) {
      if (this._store.activeBlockId()) {
        index = this._content().findIndex(dataBlock => dataBlock.id === this._store.activeBlockId()) + 1;
      } else {
        index = this._content().length;
      }
    }

    this.insertBlock(type, index, options);
  }

  duplicateBlock(blockId: string) {
    const index = this._content().findIndex(dataBlock => dataBlock.id === blockId);
    if (index === -1) {
      return;
    }

    const original = this._content()[index];

    // Deep clone mutable fields to avoid shared references
    const clonedContent = original.content != null ? JSON.parse(JSON.stringify(original.content)) : original.content;
    const clonedSettings = original.settings != null ? JSON.parse(JSON.stringify(original.settings)) : original.settings;
    const clonedProps = original.props != null ? JSON.parse(JSON.stringify(original.props)) : original.props;

    const duplicated: ContentEditorBlock = {
      ...original,
      id: uuid(),
      isEmpty: false,
      content: clonedContent,
      settings: clonedSettings,
      props: clonedProps,
    } as ContentEditorBlock;

    const insertIndex = index + 1;
    this._content.update((data: ContentEditorBlock[]) => {
      data.splice(insertIndex, 0, duplicated);
      return data;
    });
    this._store.addBlock(duplicated, insertIndex);

    this.focusBlock(duplicated.id);
    this.emitContentChangeEvent();
  }

  duplicateSelectedBlocks(popover: Popover) {
    const selectedIds = [...this.selectedBlocksModel.selected] as string[];
    if (!selectedIds.length) return;

    // Process in visual order (top to bottom)
    const ordered = selectedIds
      .map(id => ({ id, index: this._content().findIndex(b => b.id === id) }))
      .filter(x => x.index !== -1)
      .sort((a, b) => a.index - b.index)
      .map(x => x.id);

    const newIds: string[] = [];

    for (const id of ordered) {
      // Get current index of the original before duplicating
      const idx = this._content().findIndex(b => b.id === id);
      if (idx === -1) continue;

      this.duplicateBlock(id);

      // After duplication, the new block is placed right after the original
      const newBlock = this._content()[idx + 1];
      if (newBlock) {
        newIds.push(newBlock.id);
      }
    }

    // Select duplicated blocks
    this.selectedBlocksModel.clear();
    if (newIds.length) {
      this.selectedBlocksModel.select(...newIds);
    }
    this.cdr.markForCheck();
  }

  deleteBlock(blockId: string) {
    if (this._content().length === 1) {
      return;
    }

    const index = this._content().findIndex(dataBlock => dataBlock.id === blockId);

    if (index !== -1) {
      this._content.update(data => {
        data.splice(index, 1);
        return data;
      });
      this._store.deleteBlock(blockId, index);

      const prevBlock = this._content()[index - 1];

      if (prevBlock) {
        this.focusBlock(prevBlock.id);
      }

      this.emitContentChangeEvent();
    }
  }

  setBlockProps(id: string, props: ContentEditorItemProperty[]) {
    const data: ContentEditorBlock[] = this._content();
    const index = data.findIndex((dataBlock) => dataBlock.id === id);
    data[index].props = props;
    this.emitContentChangeEvent();
  }

  insertEmptyBlock(index: number) {
    this.insertBlock('paragraph', index + 1);
    this.emitContentChangeEvent();
  }

  focusBlock(id: string | null) {
    this._store.setFocusedBlockId(id);
    this.focusChanged.emit();
  }

  isBlockFocused(id: string) {
    return this._store.focusedBlockId() === id;
  }

  isActiveBlock(id: string) {
    return this._store.activeBlockId() === id;
  }

  drop(event: CdkDragDrop<ContentEditorBlock[]>) {
    moveItemInArray(this._content(), event.previousIndex, event.currentIndex);
    this._store.moveBlock(event.previousIndex, event.currentIndex);
    this.emitContentChangeEvent();
  }

  onTagSelected(tagName: string | null): void {
    // console.log('Tag selected event received:', tagName);
  }

  getData() {
    return this._store.blocks();
  }

  emitContentChangeEvent() {
    this.contentChanged.emit(this.getData());
  }

  selectBlock(blockId: string, multiple = false) {
    if (!multiple) {
      this.selectedBlocksModel.clear();
    }
    this.selectedBlocksModel.select(blockId);
    this.cdr.markForCheck();
  }

  unselectBlock(blockId: string) {
    this.selectedBlocksModel.deselect(blockId);
    this.cdr.markForCheck();
  }

  unselectSelectedBlocks() {
    this.selectedBlocksModel.clear();
    this.cdr.markForCheck();
  }

  isBlockSelected(blockId: string) {
    return this.selectedBlocksModel.isSelected(blockId);
  }

  deleteSelectedBlocks(popover?: Popover) {
    const selectedIds = [...this.selectedBlocksModel.selected] as string[];
    if (!selectedIds.length) {
      return;
    }

    const confirmRef = this.confirmManager.open({
      title: 'Delete blocks',
      description: 'This action cannot be undone. Selected blocks will be deleted.'
    });

    confirmRef.confirmed.subscribe(() => {
      // Delete from bottom to top to keep indexes stable
      const toDelete = selectedIds
        .map(id => ({ id, index: this._content().findIndex(b => b.id === id) }))
        .filter(x => x.index !== -1)
        .sort((a, b) => b.index - a.index);

      for (const item of toDelete) {
        this.deleteBlock(item.id);
      }

      this.unselectSelectedBlocks();
    });
  }

  protected _onKeyDown(event: KeyboardEvent) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedBlocksModel.hasValue()) {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // If we are in an input/contenteditable, only delete if multiple blocks are selected
      // or if it's not a Backspace (to avoid deleting text while trying to delete blocks)
      // Actually, if blocks are selected, they usually have a blue background and the user intent is likely to delete blocks.
      // But if there's only ONE block selected AND we are typing in it, we probably want to delete text.

      if (isInput && this.selectedBlocksModel.selected.length === 1) {
         // Let the default behavior happen for text editing
         return;
      }

      event.preventDefault();
      this.deleteSelectedBlocks();
    }
  }

  protected onDragStarted(event: CdkDragStart, block: ContentEditorBlock) {
    this._blockDragging.set(true);
  }

  protected onDragEnded(event: CdkDragStart, block: ContentEditorBlock) {
    this._blockDragging.set(false);
  }

  protected addBlockFromSuggestionMenu(suggestionsMenu: Menu, type: string, options: object) {
    suggestionsMenu.closed.emit('click');
    this.addBlock(type, options);
  }

  protected preventMenuClose(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }

  protected setActiveBlockId(event: Event, id: string | null) {
    event.stopPropagation();
    event.preventDefault();
    this._store.setActiveBlockId(id);
    this._store.setFocusedBlockId(id);
    this.focusChanged.emit();
  }

  protected onFocusChange(origin: string | null, dataBlock: ContentEditorBlock) {
  }

  protected onSuggestionsMenuOpen() {
  }

  protected onSuggestionsMenuClose(reason: MenuCloseReason) {
    if (!reason) {
      this._store.setFocusedBlockId(this._store.activeBlockId());
      this.focusChanged.emit();
    }

    // need some delay to prevent the flickering
    setTimeout(() => this._store.setActiveBlockId(null), 250);
  }

  ngOnDestroy(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    if (this._scrollBindSub) {
      try {
        this._scrollBindSub.unsubscribe();
      } catch {
      }
      this._scrollBindSub = null;
    }

    if (this._scrollEffect) {
      try {
        this._scrollEffect.destroy();
      } catch {
      }
      this._scrollEffect = undefined;
    }

    try {
      this._scrollSubject.complete();
    } catch {
    }

    this._scroll$ = null;
  }

  onSettingsPopoverClose() {
  }

  protected _onPaste(event: ClipboardEvent) {
    const target = event.target as HTMLElement;
    const isInsideCodeBlock = target.closest('.ngs-code-block') ||
                            target.closest('.cm-editor') ||
                            target.closest('.cm-content') ||
                            target.classList.contains('cm-content') ||
                            target.classList.contains('cm-line');

    if (isInsideCodeBlock) {
      return;
    }

    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain');

    if (!html && !text) {
      return;
    }

    // Check if we are pasting into a block that should handle its own paste (like code block)
    // but might not have been caught by target.closest if it's currently empty or has different structure.
    const activeBlockId = this._store.activeBlockId() || this._store.focusedBlockId();
    if (activeBlockId) {
      const activeBlock = this._content().find(b => b.id === activeBlockId);
      if (activeBlock?.type === 'code') {
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();

    let index = this._content().length;

    if (activeBlockId) {
      const activeIndex = this._content().findIndex(b => b.id === activeBlockId);
      if (activeIndex !== -1) {
        index = activeIndex + 1;
      }
    }

    if (html) {
      this._handleHtmlPaste(html, index);
    } else if (text) {
      this._handleTextPaste(text, index);
    }
  }

  private _handleTextPaste(text: string, index: number) {
    const lines = text.split(/\r?\n/);
    if (lines.length === 1) {
      this.insertBlock('paragraph', index, {}, false, text);
    } else {
      // If it looks like code (has indentation or common code characters), insert as a single code block
      const isCodeLike = text.includes('{') || text.includes('}') || text.includes(';') || text.includes('  ') || text.includes('\t');
      if (isCodeLike) {
        this.insertBlock('code', index, { language: 'none' }, false, text);
        return;
      }

      lines.forEach((line, i) => {
        if (line.trim().length > 0) {
          this.insertBlock('paragraph', index + i, {}, false, line);
        }
      });
    }
  }

  private _handleHtmlPaste(html: string, index: number) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    let currentIndex = index;
    Array.from(body.children).forEach(node => {
      const block = this._mapNodeToBlock(node);
      if (block) {
        this.insertBlock(block.type, currentIndex, block.settings, false, block.content);
        currentIndex++;
      }
    });
  }

  private _mapNodeToBlock(node: Element): { type: string, settings: any, content?: any } | null {
    const tag = node.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          settings: { level: parseInt(tag.substring(1)) },
          content: node.innerHTML
        };
      case 'p':
        return {
          type: 'paragraph',
          settings: {},
          content: node.innerHTML
        };
      case 'ul':
        return {
          type: 'bulletList',
          settings: { listStyle: 'bullet' },
          content: this._mapListItems(node)
        };
      case 'ol':
        return {
          type: 'orderedList',
          settings: { listStyle: 'ordered' },
          content: this._mapListItems(node)
        };
      case 'img':
        return {
          type: 'image',
          settings: {},
          content: {
            src: node.getAttribute('src') || '',
            alt: node.getAttribute('alt') || ''
          }
        };
      case 'video':
        return {
          type: 'video',
          settings: {},
          content: {
            src: node.getAttribute('src') || '',
            caption: node.getAttribute('title') || ''
          }
        };
      case 'blockquote':
        return {
          type: 'quote',
          settings: {},
          content: node.innerHTML
        };
      case 'pre':
        const codeNode = node.querySelector('code');
        const content = (codeNode || node).textContent || '';
        return {
          type: 'code',
          settings: { language: 'none' },
          content: content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd()
        };
      case 'hr':
        return {
          type: 'divider',
          settings: {}
        };
      default:
        if (node.textContent?.trim()) {
          return {
            type: 'paragraph',
            settings: {},
            content: node.innerHTML
          };
        }
        return null;
    }
  }

  private _mapListItems(node: Element): any[] {
    return Array.from(node.children)
      .filter(child => child.tagName.toLowerCase() === 'li')
      .map(li => ({
        content: li.innerHTML,
        children: []
      }));
  }
}
