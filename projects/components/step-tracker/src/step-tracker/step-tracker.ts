import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  contentChild,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model
} from '@angular/core';
import {
  StepTrackerItem,
  StepTrackerResolvedItemState
} from '../step-tracker-item/step-tracker-item';
import { StepTrackerCompletedIcon } from '../step-tracker-completed-icon/step-tracker-completed-icon';
import { StepTrackerErrorIcon } from '../step-tracker-error-icon/step-tracker-error-icon';

export type StepTrackerOrientation = 'vertical' | 'horizontal';

@Component({
  selector: 'ngs-step-tracker',
  exportAs: 'ngsStepTracker',
  templateUrl: './step-tracker.html',
  styleUrl: './step-tracker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-step-tracker',
    'role': 'list',
    '[class.ngs-step-tracker-vertical]': 'orientation() === "vertical"',
    '[class.ngs-step-tracker-horizontal]': 'orientation() === "horizontal"',
  },
})
export class StepTracker {
  readonly orientation = input<StepTrackerOrientation>('vertical');
  readonly activeIndex = model<number | null>(null);

  readonly items = contentChildren(StepTrackerItem);
  readonly completedIcon = contentChild(StepTrackerCompletedIcon);
  readonly errorIcon = contentChild(StepTrackerErrorIcon);
  readonly itemsCount = computed(() => this.items().length);

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _ngZone = inject(NgZone);
  private readonly _observedItemElements = new Set<HTMLElement>();
  private _resizeObserver: ResizeObserver | null = null;
  private _syncFrame = 0;
  private _hasBrowserRender = false;

  constructor() {
    effect(() => {
      const activeIndex = this.activeIndex();

      this.items().forEach((item, index) => {
        item.setTrackerState(this._stateForIndex(index, activeIndex));
      });
    });

    effect(() => {
      const completedIcon = this.completedIcon()?.templateRef ?? null;
      const errorIcon = this.errorIcon()?.templateRef ?? null;

      this.items().forEach((item) => {
        item.setIndicatorIconTemplates(completedIcon, errorIcon);
      });
    });

    effect(() => {
      const activeIndex = this.activeIndex();
      const itemsCount = this.itemsCount();

      if (activeIndex === null || itemsCount === 0) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(activeIndex, itemsCount));

      if (nextIndex !== activeIndex) {
        this.activeIndex.set(nextIndex);
      }
    });

    effect(() => {
      this.orientation();
      this.items();
      this._observeItems();
      this._scheduleConnectorSync();
    });

    afterNextRender(() => {
      this._hasBrowserRender = true;

      this._ngZone.runOutsideAngular(() => {
        this._resizeObserver = new ResizeObserver(() => {
          this._scheduleConnectorSync();
        });
        this._resizeObserver.observe(this._elementRef.nativeElement);
        this._observeItems();
        this._scheduleConnectorSync();
      });
    });

    this._destroyRef.onDestroy(() => {
      this._resizeObserver?.disconnect();

      if (this._syncFrame) {
        cancelAnimationFrame(this._syncFrame);
      }
    });
  }

  setActiveIndex(index: number): void {
    this.activeIndex.set(index);
  }

  next(): void {
    const itemsCount = this.itemsCount();

    if (itemsCount === 0) {
      return;
    }

    const activeIndex = this.activeIndex();
    this.activeIndex.set(activeIndex === null ? 0 : Math.min(activeIndex + 1, itemsCount));
  }

  previous(): void {
    const itemsCount = this.itemsCount();

    if (itemsCount === 0) {
      return;
    }

    const activeIndex = this.activeIndex();
    this.activeIndex.set(activeIndex === null ? 0 : Math.max(activeIndex - 1, 0));
  }

  private _stateForIndex(index: number, activeIndex: number | null): StepTrackerResolvedItemState {
    if (activeIndex === null) {
      return 'pending';
    }

    if (index < activeIndex) {
      return 'completed';
    }

    if (index === activeIndex) {
      return 'current';
    }

    return 'pending';
  }

  private _observeItems(): void {
    if (!this._resizeObserver) {
      return;
    }

    const nextElements = new Set(this.items().map((item) => item.getHostElement()));

    for (const element of this._observedItemElements) {
      if (!nextElements.has(element)) {
        this._resizeObserver.unobserve(element);
        this._observedItemElements.delete(element);
      }
    }

    for (const element of nextElements) {
      if (!this._observedItemElements.has(element)) {
        this._resizeObserver.observe(element);
        this._observedItemElements.add(element);
      }
    }
  }

  private _scheduleConnectorSync(): void {
    if (!this._hasBrowserRender || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    if (this._syncFrame) {
      cancelAnimationFrame(this._syncFrame);
    }

    this._syncFrame = requestAnimationFrame(() => {
      this._syncFrame = 0;
      this._syncHorizontalConnectors();
    });
  }

  private _syncHorizontalConnectors(): void {
    const items = this.items();

    if (this.orientation() !== 'horizontal') {
      items.forEach((item) => {
        item.resetHorizontalConnector();
      });
      return;
    }

    const connectorGap = this._readConnectorGap();

    items.forEach((item, index) => {
      const nextItem = items[index + 1];

      if (!nextItem) {
        item.resetHorizontalConnector();
        return;
      }

      const hostRect = item.getHostElement().getBoundingClientRect();
      const currentEnd = this._getHorizontalConnectorEnd(item);
      const nextStart = this._getHorizontalConnectorStart(nextItem);
      const left = currentEnd - hostRect.left + connectorGap;
      const width = Math.max(0, nextStart - currentEnd - connectorGap * 2);
      const top = this._getHorizontalConnectorTop(item, hostRect);

      item.setHorizontalConnector(left, width, top);
    });
  }

  private _getHorizontalConnectorEnd(item: StepTrackerItem): number {
    return item.getIndicatorRect()?.right ?? 0;
  }

  private _getHorizontalConnectorStart(item: StepTrackerItem): number {
    return item.getIndicatorRect()?.left ?? Number.POSITIVE_INFINITY;
  }

  private _getHorizontalConnectorTop(item: StepTrackerItem, hostRect: DOMRect): number {
    const indicatorRect = item.getIndicatorRect();

    if (!indicatorRect) {
      return 0;
    }

    return indicatorRect.top - hostRect.top + indicatorRect.height / 2;
  }

  private _readConnectorGap(): number {
    const probe = document.createElement('div');

    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.width = 'var(--ngs-step-tracker-connector-gap)';
    this._elementRef.nativeElement.appendChild(probe);

    const width = probe.getBoundingClientRect().width;
    probe.remove();

    return width;
  }
}
