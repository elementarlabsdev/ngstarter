import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  inject,
  input, numberAttribute,
  output,
  signal,
} from '@angular/core';
import { injectElement, arrayShallowEquals } from '@ngstarter-ui/components/core';
import { TILES_REORDER } from '../tiles.tokens';
import { Tile } from '../tile/tile';

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

  private rearrangeTimer: any;
  private lastSourceVisualIndex: number | null = null;
  private lastTargetVisualIndex: number | null = null;
  private lastSwapTime = 0;
  private lastSwapX = 0;
  private lastSwapY = 0;
  private initialItems: any[] | null = null;
  private isInitialized = false;
  private isDragging = false;

  constructor() {
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
    if (this.rearrangeTimer) {
      clearTimeout(this.rearrangeTimer);
      this.rearrangeTimer = null;
    }

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

    this.lastSourceVisualIndex = null;
    this.lastTargetVisualIndex = null;
    this.lastSwapTime = 0;
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

    const isMovingForward = draggedVisualIndex < targetVisualIndex;
    const areSameSize = draggedTile.width() === targetTile.width() && draggedTile.height() === targetTile.height();
    const columns = this.columns();
    const isFullWidth = draggedTile.width() === columns || (draggedTile.width() === 1 && columns === 1);

    // Get the actual floating element's position
    const draggedWrapper = (draggedTile as any).wrapper()?.nativeElement;
    if (!draggedWrapper) {
      return;
    }
    const floatingRect = draggedWrapper.getBoundingClientRect();

    // Check if the edge of the floating block has crossed the midpoint of the target tile
    const targetRect = element.getBoundingClientRect();
    const midX = targetRect.left + targetRect.width / 2;
    const midY = targetRect.top + targetRect.height / 2;

    const deltaX = Math.abs(targetRect.left - floatingRect.left);
    const deltaY = Math.abs(targetRect.top - floatingRect.top);

    let shouldRearrange = false;

    if (isFullWidth && !isMovingForward) {
      // Special logic for full-width tiles when moving up:
      // if the top edge of the dragged tile has passed the bottom third of the target tile
      if (floatingRect.top < targetRect.bottom - targetRect.height * 0.3) {
        shouldRearrange = true;
      }
    } else if (isFullWidth && isMovingForward) {
      // Special logic for full-width tiles when moving down:
      // if the bottom edge of the dragged tile has passed the top third of the target tile
      if (floatingRect.bottom > targetRect.top + targetRect.height * 0.3) {
        shouldRearrange = true;
      }
    } else if (deltaX > deltaY) {
      // Primarily horizontal movement
      const edgeX = isMovingForward ? floatingRect.right : floatingRect.left;
      const threshold = areSameSize ? (isMovingForward ? targetRect.left + targetRect.width * 0.2 : targetRect.right - targetRect.width * 0.2) : midX;
      if (isMovingForward ? edgeX >= threshold : edgeX <= threshold) {
        shouldRearrange = true;
      }
    } else {
      // Primarily vertical movement
      const edgeY = isMovingForward ? floatingRect.bottom : floatingRect.top;
      const threshold = areSameSize ? (isMovingForward ? targetRect.top + targetRect.height * 0.2 : targetRect.bottom - targetRect.height * 0.2) : midY;
      if (isMovingForward ? edgeY >= threshold : edgeY <= threshold) {
        shouldRearrange = true;
      }
    }

    if (!shouldRearrange) {
      return;
    }

    // Adjustment for full-width tiles to displace the entire row
    if (isFullWidth) {
      const targetTop = targetRect.top;
      let finalTargetVisualIndex = targetVisualIndex;
      tiles.forEach((t) => {
        const tIndex = order.get(t);
        if (tIndex !== undefined) {
          if (isMovingForward ? tIndex > finalTargetVisualIndex : tIndex < finalTargetVisualIndex) {
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

    // Recalculate size equality after potential adjustment
    const areSameSizeNow = draggedTile.width() === targetTile.width() && draggedTile.height() === targetTile.height();

    // Prevent bouncing: if we just swapped with this tile, don't swap back
    // unless the pointer has moved significantly in the opposite direction.
    const now = Date.now();
    if (now - this.lastSwapTime < 500 && this.lastTargetVisualIndex === draggedVisualIndex && this.lastSourceVisualIndex === targetVisualIndex) {
      const movementX = event.clientX - this.lastSwapX;
      const movementY = event.clientY - this.lastSwapY;

      // If we are moving in the same direction as the original swap, don't swap back
      const wasMovingForward = (this.lastSourceVisualIndex ?? 0) < (this.lastTargetVisualIndex ?? 0);
      if (deltaX > deltaY) {
        if (wasMovingForward ? movementX > -10 : movementX < 10) {
          return;
        }
      } else {
        if (wasMovingForward ? movementY > -10 : movementY < 10) {
          return;
        }
      }
    }

    // Skip if this is the exact same target we've already started to rearrange to
    if (this.rearrangeTimer && this.lastTargetVisualIndex === targetVisualIndex) {
      return;
    }

    if (this.rearrangeTimer) {
      clearTimeout(this.rearrangeTimer);
    }

    this.lastSourceVisualIndex = draggedVisualIndex;
    this.lastTargetVisualIndex = targetVisualIndex;

    this.rearrangeTimer = setTimeout(() => {
      const orderAtTimeOfExecution = this.order();
      let newOrder: Map<Tile, number>;

      this.lastSwapTime = Date.now();
      this.lastSwapX = event.clientX;
      this.lastSwapY = event.clientY;

      if (areSameSizeNow || (isFullWidth && targetTile.width() === 12)) {
        // Use swap for tiles of the same size or full-width tiles swapping with other full-width tiles
        newOrder = new Map(orderAtTimeOfExecution);
        newOrder.set(draggedTile, targetVisualIndex);
        newOrder.set(targetTile, draggedVisualIndex);
      } else {
        newOrder = this.reorder(orderAtTimeOfExecution, draggedVisualIndex, targetVisualIndex);
      }

      this.order.set(new Map(newOrder));

      const result = new Map<number, number>();
      tiles.forEach((tile, index) => {
        result.set(index, newOrder.get(tile) ?? index);
      });
      this.orderChange.emit(result);
      this.rearrangeTimer = null;
    }, 50);
  }
}
