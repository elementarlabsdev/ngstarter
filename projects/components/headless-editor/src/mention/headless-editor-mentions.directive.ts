import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  afterNextRender, ComponentRef, computed, DestroyRef, Directive, DOCUMENT, effect, ElementRef,
  inject, input, output, OutputRefSubscription, signal, untracked, ViewContainerRef
} from '@angular/core';
import { Menu } from '@ngstarter-ui/components/menu';
import { NgsHeadlessEditor } from '../headless-editor';
import { createNgsHeadlessEditorId } from '../model';
import { NgsHeadlessEditorSurface } from '../headless-editor-surface.directive';
import {
  findNgsHeadlessEditorMentionQuery, insertNgsHeadlessEditorMention,
  NgsHeadlessEditorMentionOption, NgsHeadlessEditorMentionQuery
} from './mention.plugin';
import { NGS_HEADLESS_EDITOR_MENTION_OPTIONS, NgsHeadlessEditorMentionSearch } from './mention.options';
import { NgsHeadlessEditorMentionMenu } from './mention-menu/mention-menu';

/**
 * Opens a consumer-defined ngs-menu at @query. Focus stays in the editor;
 * ArrowUp/Down, Enter/Tab and Escape control the suggestions. Works in nested
 * inline editors too. The menu owns its option templates; call select(option)
 * on click and use optionId(index) / activeIndex() for accessible highlighting.
 */
@Directive({
  selector: '[ngsHeadlessEditorSurface][ngsHeadlessEditorMentions]',
  exportAs: 'ngsHeadlessEditorMentions'
})
export class NgsHeadlessEditorMentions<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption> {
  private readonly editor = inject(NgsHeadlessEditor);
  private readonly surface = inject(NgsHeadlessEditorSurface);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly config = inject(NGS_HEADLESS_EDITOR_MENTION_OPTIONS);
  private readonly initialized = signal(false);
  private readonly dismissed = signal<NgsHeadlessEditorMentionQuery | null>(null);
  private readonly menuId = createNgsHeadlessEditorId('mentions');
  private overlayRef: OverlayRef | null = null;
  private shownMenu: Menu | null = null;
  private ariaHost: HTMLElement | null = null;
  private readonly previousAria = new Map<string, string | null>();
  private frame: number | null = null;
  private previousEditor: NgsHeadlessEditor | null = null;
  private previousQuery = '';
  private defaultMenu: ComponentRef<NgsHeadlessEditorMentionMenu> | null = null;
  private menuClosed: OutputRefSubscription | null = null;

  readonly menu = input<Menu | '' | null>(null, { alias: 'ngsHeadlessEditorMentions' });
  readonly options = input<NgsHeadlessEditorMentionSearch<TOption>>(
    (this.config.options ?? (async () => [])) as NgsHeadlessEditorMentionSearch<TOption>,
    { alias: 'mentionOptions' }
  );
  readonly trigger = input(this.config.trigger ?? '@', { alias: 'mentionTrigger' });
  readonly selected = output<TOption>({ alias: 'mentionSelected' });
  readonly queryChange = output<string | null>({ alias: 'mentionQueryChange' });
  private readonly target = computed(() => this.editor.inlineTarget() ?? this.editor);
  private readonly match = computed(() => {
    const target = this.target();
    return this.initialized() && !this.surface.disabled() && !this.editor.readOnly() && target.focused()
      ? findNgsHeadlessEditorMentionQuery(target, this.trigger())
      : null;
  });
  readonly query = computed(() => this.match()?.query ?? null);
  private readonly results = signal<readonly TOption[]>([]);
  private readonly searching = signal(false);
  private readonly searchError = signal<unknown>(null);
  readonly suggestions = this.results.asReadonly();
  readonly loading = this.searching.asReadonly();
  readonly error = this.searchError.asReadonly();
  readonly activeIndex = signal(0);
  readonly open = computed(() => {
    const match = this.match();
    return match !== null && !sameQuery(match, this.dismissed()) && this.suggestions().length > 0;
  });

  constructor() {
    effect(onCleanup => {
      const query = this.query();
      const search = this.options();
      // Changing the nested editor invalidates a request even for the same query.
      this.target();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      untracked(() => {
        this.results.set([]);
        this.searchError.set(null);
        this.searching.set(query !== null);
        if (query === null) return;
        void (async () => {
          try {
            const options = await search(query);
            if (!cancelled) this.results.set(options);
          } catch (error: unknown) {
            if (!cancelled) this.searchError.set(error);
          } finally {
            if (!cancelled) this.searching.set(false);
          }
        })();
      });
    });
    effect(() => {
      const query = this.query();
      untracked(() => this.queryChange.emit(query));
    });
    effect(() => {
      const target = this.target();
      const match = this.match();
      const count = this.suggestions().length;
      const key = match ? `${match.blockId}:${match.from}:${match.to}:${match.query}` : '';
      untracked(() => {
        if (target !== this.previousEditor || key !== this.previousQuery) {
          this.activeIndex.set(0);
          this.dismissed.set(null);
        } else if (this.activeIndex() >= count) {
          this.activeIndex.set(Math.max(0, count - 1));
        }
        this.previousEditor = target;
        this.previousQuery = key;
      });
    });
    effect(() => {
      this.open();
      this.menu();
      this.activeIndex();
      this.match();
      untracked(() => this.schedulePosition());
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.initialized.set(true);
      // Capture before the surface processes Enter or a table handles Tab.
      this.host.addEventListener('keydown', this.onKeydown, true);
      this.document.addEventListener('scroll', this.onViewportChange, true);
      this.document.defaultView?.addEventListener('resize', this.onViewportChange);
    });
    destroyRef.onDestroy(() => {
      this.host.removeEventListener('keydown', this.onKeydown, true);
      this.document.removeEventListener('scroll', this.onViewportChange, true);
      this.document.defaultView?.removeEventListener('resize', this.onViewportChange);
      if (this.frame !== null) this.document.defaultView?.cancelAnimationFrame(this.frame);
      this.clearAria();
      this.menuClosed?.unsubscribe();
      this.overlayRef?.dispose();
      this.defaultMenu?.destroy();
    });
  }

  optionId(index: number): string {
    return `${this.menuId}-option-${index}`;
  }

  select(option: TOption): boolean {
    const match = this.match();
    if (!match || !this.open() || !this.suggestions().includes(option)) return false;
    const inserted = insertNgsHeadlessEditorMention(this.target(), option, match);
    if (inserted) {
      this.closeOverlay();
      this.selected.emit(option);
    }
    return inserted;
  }

  dismiss(): void {
    this.dismissed.set(this.match());
    this.closeOverlay();
  }

  private readonly onKeydown = (event: KeyboardEvent) => {
    const match = this.match();
    if (!match || sameQuery(match, this.dismissed()) || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    const selection = this.document.getSelection();
    if (!selection?.anchorNode || !this.host.contains(selection.anchorNode)) return;
    // Escape also dismisses a pending search, so its response cannot reopen the menu.
    if (event.key !== 'Escape' && !this.open()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        const count = this.suggestions().length;
        this.activeIndex.update(index => (index + (event.key === 'ArrowDown' ? 1 : count - 1)) % count);
        break;
      }
      case 'Enter':
      case 'Tab':
        if (event.shiftKey) return;
        this.select(this.suggestions()[this.activeIndex()]);
        break;
      case 'Escape':
        this.dismiss();
        break;
      default: return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private readonly onViewportChange = () => this.schedulePosition();

  private schedulePosition(): void {
    const window = this.document.defaultView;
    if (!this.initialized() || !window) return;
    if (this.frame !== null) window.cancelAnimationFrame(this.frame);
    this.frame = window.requestAnimationFrame(() => {
      this.frame = null;
      this.positionMenu();
    });
  }

  private positionMenu(): void {
    const selection = this.document.getSelection();
    if (!this.open() || !selection?.anchorNode || !selection.isCollapsed ||
      !this.host.contains(selection.anchorNode) || selection.rangeCount === 0) {
      this.closeOverlay();
      return;
    }
    const range = selection.getRangeAt(0).cloneRange();
    let rect = range.getBoundingClientRect();
    if (rect.height === 0 && range.startContainer.nodeType === 3 && range.startOffset > 0) {
      range.setStart(range.startContainer, range.startOffset - 1);
      rect = range.getBoundingClientRect();
      rect = new DOMRect(rect.right, rect.top, 0, rect.height);
    }
    if (rect.height === 0) {
      this.closeOverlay();
      return;
    }
    const menu = this.resolveMenu();
    if (this.shownMenu !== menu) this.closeOverlay();
    const strategy = this.overlay.position().flexibleConnectedTo({ x: rect.left, y: rect.bottom })
      .withPositions([
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -rect.height - 4 }
      ]).withPush(true).withViewportMargin(8);
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        positionStrategy: strategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: false
      });
      this.overlayRef.outsidePointerEvents().subscribe(event => {
        if (!(event.target instanceof Node) || !this.host.contains(event.target)) this.dismiss();
      });
      this.overlayRef.overlayElement.addEventListener('mousedown', event => event.preventDefault());
    } else {
      this.overlayRef.updatePositionStrategy(strategy);
    }
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.overlayElement.id = this.menuId;
      this.overlayRef.attach(new TemplatePortal(menu.templateRef(), this.viewContainer));
      this.shownMenu = menu;
      this.menuClosed = menu.closed.subscribe(reason => {
        // MenuItem emits its host click before the consumer's (click) handler.
        // Let select(option) run before dismissing a click-closed menu.
        if (reason === 'click') {
          queueMicrotask(() => {
            if (this.shownMenu === menu) this.dismiss();
          });
        } else {
          this.dismiss();
        }
      });
    }
    const anchor = selection.anchorNode.nodeType === 1
      ? selection.anchorNode as Element : selection.anchorNode.parentElement;
    const surface = anchor?.closest<HTMLElement>('[ngsHeadlessEditorSurface]') ?? this.host;
    if (this.ariaHost !== surface) {
      this.clearAria();
      this.ariaHost = surface;
      for (const name of ['aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant']) {
        this.previousAria.set(name, surface.getAttribute(name));
      }
    }
    surface.setAttribute('aria-autocomplete', 'list');
    surface.setAttribute('aria-expanded', 'true');
    surface.setAttribute('aria-controls', this.menuId);
    const activeId = this.optionId(this.activeIndex());
    if (this.document.getElementById(activeId)) surface.setAttribute('aria-activedescendant', activeId);
    this.document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }

  private closeOverlay(): void {
    this.clearAria();
    this.menuClosed?.unsubscribe();
    this.menuClosed = null;
    this.overlayRef?.detach();
    this.shownMenu = null;
  }

  private resolveMenu(): Menu {
    const menu = this.menu();
    if (menu) return menu;
    if (!this.defaultMenu) {
      this.defaultMenu = this.viewContainer.createComponent(NgsHeadlessEditorMentionMenu);
      this.defaultMenu.setInput('mentions', this);
      this.defaultMenu.changeDetectorRef.detectChanges();
    }
    return this.defaultMenu.instance.menu();
  }

  private clearAria(): void {
    for (const [name, value] of this.previousAria) {
      if (value === null) this.ariaHost?.removeAttribute(name);
      else this.ariaHost?.setAttribute(name, value);
    }
    this.previousAria.clear();
    this.ariaHost = null;
  }
}

function sameQuery(left: NgsHeadlessEditorMentionQuery, right: NgsHeadlessEditorMentionQuery | null): boolean {
  return right !== null && left.blockId === right.blockId && left.from === right.from &&
    left.to === right.to && left.query === right.query && left.trigger === right.trigger;
}
