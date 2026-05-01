import { Directive, ElementRef, inject, input, NgZone, OnDestroy, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CONTENT_BUILDER } from '../types';
import { ContentBuilderComponent } from '../content-builder/content-builder.component';
import SelectionArea from '@viselect/vanilla';

/**
 * Directive to enable mouse-drag selection of child blocks inside a container.
 *
 * Behavior:
 * - Drag can be started only from an area that is NOT inside a block (matched by `blockSelector`).
 * - While dragging, the directive creates a dynamic selection rectangle element with the
 *   class `selectionAreaClass` (default: `ngs-textContent-builder-selection-area`).
 * - Any block that intersects the selection rectangle receives `selectedClass` (default: `is-selected`).
 *   When the block leaves the selection area, the class is removed.
 */
@Directive({
  selector: '[ngsBlockSelection]'
})
export class BlockSelectionDirective implements OnDestroy {
  private document = inject(DOCUMENT);
  private _platformId = inject(PLATFORM_ID);
  private contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);

  /** CSS selector for selectable blocks. Defaults to `.block`. */
  blockSelector = input<string>('.block-content');

  autoScrollContainerSelector = input<string | null>(null);

  /** CSS class applied to the dynamic selection rectangle element. */
  selectionAreaClass = input<string>('selection-area');

  /**
   * List of CSS class names to ignore when starting selection.
   * If the mousedown target or any of its ancestors (via closest) contains any of
   * these classes, the selection will NOT start. Class names can be provided with
   * or without leading dot (e.g., 'toolbar-button' or '.toolbar-button').
   */
  ignoreClasses = input<string[]>(['.block-controls']);

  private elRef = inject(ElementRef) as ElementRef<HTMLElement>;

  private host: HTMLElement = this.elRef.nativeElement;
  private selection: SelectionArea | null = null;

  // Track only blockIds we toggled via drag selection to avoid interfering with other selection sources
  private selectedSet = new Set<string>();

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      this.selection = new SelectionArea({
        selectables: [this.blockSelector()],
        boundaries: [this.host],
        container: this.host,
        features: {
          touch: false,
          range: true,
          deselectOnBlur: true,
          singleTap: {
            allow: true,
            intersect: 'native'
          }
        },
        selectionAreaClass: this.selectionAreaClass()
      }).on('beforestart', ({ event }) => {
        const targetEl = event?.target as HTMLElement | null;
        if (this.isInIgnoredArea(targetEl) || targetEl?.closest(this.blockSelector())) {
          return false;
        }
        if (event) {
          event.preventDefault();
        }
        return true;
      }).on('stop', () => {
        this.contentBuilder.isSelectionOfBlocksActive.set(false);
      }).on('start', ({ store, event }) => {
        this.contentBuilder.isSelectionOfBlocksActive.set(true);

        const activeElement = this.document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
          activeElement.blur();
        }
        this.host.focus();

        if (event && !event.ctrlKey && !event.metaKey) {
          this.contentBuilder.unselectSelectedBlocks();
          this.selectedSet.clear();
        }
      }).on('move', ({ store: { changed: { added, removed } } }) => {
        added.forEach(el => {
          const blockEl = el.closest('.block') as HTMLElement | null;
          const blockId = blockEl?.getAttribute('data-block-id');
          if (blockId) {
            this.contentBuilder.selectBlock(blockId, true);
            this.selectedSet.add(blockId);
          }
        });
        removed.forEach(el => {
          const blockEl = el.closest('.block') as HTMLElement | null;
          const blockId = blockEl?.getAttribute('data-block-id');
          if (blockId && this.selectedSet.has(blockId)) {
            this.contentBuilder.unselectBlock(blockId);
            this.selectedSet.delete(blockId);
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.selection?.destroy();
  }

  private isInIgnoredArea(target: HTMLElement | null): boolean {
    const list = this.ignoreClasses();
    if (!target || !Array.isArray(list) || list.length === 0) return false;
    const normalized = list
      .map(c => (c ?? '').toString().trim())
      .filter(Boolean)
      .map(c => c.startsWith('.') ? c.slice(1) : c);
    if (normalized.length === 0) return false;

    let el: HTMLElement | null = target;
    // Traverse up through ancestors to emulate "closest" semantics for class names
    while (el) {
      for (const cls of normalized) {
        if (el.classList && el.classList.contains(cls)) return true;
      }
      el = el.parentElement;
    }
    return false;
  }
}
