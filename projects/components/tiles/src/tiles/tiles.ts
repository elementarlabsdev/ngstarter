import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input, numberAttribute,
  output,
  signal,
} from '@angular/core';
import { injectElement, arrayShallowEquals } from '@ngstarter-ui/components/core';
import { TILES_REORDER, tilesSwap } from '../tiles.tokens';
import { Tile } from '../tile/tile';
import { exchangeTileGroup, findTileGroup } from './tile-group';

@Component({
  selector: 'ngs-tiles',
  exportAs: 'ngsTiles',
  template: '<ng-content/>',
  styleUrl: './tiles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-tiles',
    '[style.--ngs-tiles-columns]': 'columns()',
    '[style.grid-template-columns]': '"repeat(" + columns() + ", 1fr)"',
  },
})
export class Tiles {
  private reorder = inject(TILES_REORDER);
  readonly el = injectElement();

  readonly element = signal<HTMLElement | null>(null);
  readonly order = signal<Map<Tile, number>>(new Map());
  readonly tiles = contentChildren(Tile);
  readonly items = input<any[]>([]);
  readonly gap = input<number | string>(24);
  readonly columns = input(12, { transform: numberAttribute });

  readonly orderChange = output<Map<number, number>>();
  readonly orderChanged = output<any[]>();
  readonly layoutChanged = output<any[]>();

  private rearrangeTimer?: ReturnType<typeof setTimeout>;
  private pendingTarget?: Tile;
  private lastRearrange?: { x: number; y: number };
  private initialItems: any[] | null = null;
  private isInitialized = false;
  private isDragging = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelPendingRearrange());
    effect(() => {
      const tiles = this.tiles();
      const currentOrder = this.order();
      const newOrder = new Map<Tile, number>();

      tiles.forEach((tile, index) => {
        if (currentOrder.has(tile)) {
          newOrder.set(tile, currentOrder.get(tile)!);
        } else {
          newOrder.set(tile, index);
        }
      });

      // Cleanup old entries and check if changed
      let changed = newOrder.size !== currentOrder.size;
      if (!changed) {
        for (const [tile, visualIndex] of newOrder) {
          if (currentOrder.get(tile) !== visualIndex) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        this.order.set(newOrder);

        const currentItems = this.items();
        if (currentItems.length > 0 && this.isInitialized && !this.isDragging) {
          const layout = this.calculateLayout(newOrder);
          this.layoutChanged.emit(layout);
        }
      }

      this.isInitialized = true;
    });
  }

  private calculateLayout(currentOrder: Map<Tile, number>): any[] {
    const tiles = this.tiles();
    const currentItems = this.items();
    const layout = new Array(currentItems.length);
    tiles.forEach((tile, index) => {
      const visualIndex = currentOrder.get(tile) ?? index;
      if (visualIndex < layout.length) {
        layout[visualIndex] = currentItems[index];
      }
    });
    return layout.filter(item => item !== undefined);
  }

  onDragEnd(tile: Tile): void {
    this.cancelPendingRearrange();

    const currentItems = this.items();
    const currentOrder = this.order();
    const tiles = this.tiles();

    if (currentItems.length > 0 && tiles.length > 0) {
      const newItems = new Array(currentItems.length);
      tiles.forEach((tile, index) => {
        const visualIndex = currentOrder.get(tile) ?? index;
        if (visualIndex < newItems.length) {
          newItems[visualIndex] = currentItems[index];
        }
      });
      // Filter out empty slots if any (though they shouldn't exist if data is consistent)
      const filteredNewItems = newItems.filter(item => item !== undefined);
      if (filteredNewItems.length === currentItems.length) {
        if (this.initialItems && !arrayShallowEquals(this.initialItems, filteredNewItems)) {
          this.orderChanged.emit(filteredNewItems);
          this.layoutChanged.emit(filteredNewItems);
        }
      } else {
        console.warn('Tiles: New items length mismatch, skip emission', filteredNewItems.length, currentItems.length);
      }
    }

    this.lastRearrange = undefined;
    this.initialItems = null;
    this.isDragging = false;
  }

  onDragStart(): void {
    this.isDragging = true;
    if (!this.initialItems) {
      this.initialItems = [...this.items()];
    }
  }

  rearrange(element: HTMLElement, event: PointerEvent): void {
    const draggedElement = this.element();
    const tiles = this.tiles();

    if (!draggedElement || draggedElement === element) {
      return;
    }

    const draggedTile = tiles.find((tile) => tile.element === draggedElement);
    let targetTile = tiles.find((tile) => tile.element === element);

    if (!draggedTile || !targetTile) {
      return;
    }

    const order = this.order();
    const draggedVisualIndex = order.get(draggedTile);
    let targetVisualIndex = order.get(targetTile);

    if (draggedVisualIndex === undefined || targetVisualIndex === undefined) {
      return;
    }

    const columns = this.columns();
    const isFullWidth = draggedTile.width() === columns;

    // Get the actual floating element's position
    const draggedWrapper = (draggedTile as any).wrapper()?.nativeElement;
    if (!draggedWrapper) {
      return;
    }
    const floatingRect = draggedWrapper.getBoundingClientRect();
    const sourceRect = draggedElement.getBoundingClientRect();
    const hoveredRect = element.getBoundingClientRect();
    const areSameSize = Math.abs(sourceRect.width - hoveredRect.width) < 1 &&
      Math.abs(sourceRect.height - hoveredRect.height) < 1;
    const canCoverGroup = !areSameSize && Math.abs(sourceRect.top - hoveredRect.top) >= 1 &&
      hoveredRect.width <= sourceRect.width + 1 && hoveredRect.height <= sourceRect.height + 1;
    const slots = canCoverGroup ? tiles.map(tile => ({ tile, rect: tile.element.getBoundingClientRect() })) : undefined;
    const gridStyle = slots && getComputedStyle(this.el);
    const group = slots && gridStyle && findTileGroup(slots, sourceRect, hoveredRect, floatingRect,
      parseFloat(gridStyle.columnGap) || 0, parseFloat(gridStyle.rowGap) || 0);

    const targetRect = group?.rect ?? hoveredRect;
    const vertical = Math.abs(sourceRect.top - targetRect.top) >= 1;
    const forward = vertical ? sourceRect.top < targetRect.top : sourceRect.left < targetRect.left;
    const start = vertical ? targetRect.top : targetRect.left;
    const end = vertical ? targetRect.bottom : targetRect.right;
    const fraction = isFullWidth ? 0.3 : group || areSameSize ? 0.2 : 0.5;
    const edge = vertical
      ? (forward ? floatingRect.bottom : floatingRect.top)
      : (forward ? floatingRect.right : floatingRect.left);
    const threshold = forward ? start + (end - start) * fraction : end - (end - start) * fraction;
    if (forward ? edge < threshold : edge > threshold) {
      this.cancelPendingRearrange();
      return;
    }

    // After the layout changes, a different tile can move under the same pointer.
    // Require the pointer to cross the new slot in the intended direction.
    const last = this.lastRearrange;
    if (last) {
      const movement = vertical ? event.clientY - last.y : event.clientX - last.x;
      if ((forward ? movement : -movement) < 10) {
        this.cancelPendingRearrange();
        return;
      }
    }

    // Adjustment for full-width tiles to displace the entire row
    if (isFullWidth && !group) {
      const targetTop = targetRect.top;
      let finalTargetVisualIndex = targetVisualIndex;
      tiles.forEach((t) => {
        const tIndex = order.get(t);
        if (tIndex !== undefined) {
          if (forward ? tIndex > finalTargetVisualIndex : tIndex < finalTargetVisualIndex) {
            const r = t.element.getBoundingClientRect();
            if (Math.abs(r.top - targetTop) < 5) {
              finalTargetVisualIndex = tIndex;
            }
          }
        }
      });
      if (finalTargetVisualIndex !== targetVisualIndex) {
        const newTargetTile = tiles.find((t) => order.get(t) === finalTargetVisualIndex);
        if (newTargetTile) {
          targetTile = newTargetTile;
          targetVisualIndex = finalTargetVisualIndex;
        }
      }
    }

    const pendingTarget = group?.anchor ?? targetTile;
    if (this.pendingTarget === pendingTarget) return;
    this.cancelPendingRearrange();
    this.pendingTarget = pendingTarget;
    const swap = (targetTile.element === element && areSameSize) ||
      (isFullWidth && targetTile.width() === columns);

    this.rearrangeTimer = setTimeout(() => {
      this.rearrangeTimer = undefined;
      this.pendingTarget = undefined;
      if (this.element() !== draggedElement || this.order() !== order) return;
      const newOrder = group && slots
        ? exchangeTileGroup(slots, draggedTile, sourceRect, group, gridStyle?.direction === 'rtl')
        : (swap ? tilesSwap : this.reorder)(order, draggedVisualIndex, targetVisualIndex);
      if (newOrder === order) return;
      this.lastRearrange = { x: event.clientX, y: event.clientY };
      this.order.set(new Map(newOrder));

      const result = new Map<number, number>();
      tiles.forEach((tile, index) => {
        result.set(index, newOrder.get(tile) ?? index);
      });
      this.orderChange.emit(result);
    }, 50);
  }

  private cancelPendingRearrange(): void {
    clearTimeout(this.rearrangeTimer);
    this.rearrangeTimer = undefined;
    this.pendingTarget = undefined;
  }
}
