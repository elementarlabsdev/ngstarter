import { DOCUMENT } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { typedFromEvent, getActualTarget, isElement } from '@ngstarter-ui/components/core';
import { filter, merge } from 'rxjs';
import { Tile } from './tile/tile';

@Directive({
  selector: '[ngsTileHandle]',
  host: {
    '(pointerdown)': 'onStart($event)'
  },
})
export class TileHandleDirective {
  private readonly doc = inject(DOCUMENT);
  private readonly tile = inject(Tile);
  private x = NaN;
  private y = NaN;
  private startX = NaN;
  private startY = NaN;
  private isActuallyDragging = false;

  protected readonly pointerSub = merge(
    typedFromEvent<PointerEvent>(this.doc, 'pointerup'),
    typedFromEvent<PointerEvent>(this.doc, 'pointermove'),
  )
    .pipe(
      filter(() => !Number.isNaN(this.startX)),
      takeUntilDestroyed(),
    )
    .subscribe((event: PointerEvent) => {
      if (event.type === 'pointerup') {
        this.onPointer(NaN, NaN, true);
      } else {
        const dx = event.x - this.startX;
        const dy = event.y - this.startY;

        if (!this.isActuallyDragging && Math.sqrt(dx * dx + dy * dy) > 2) {
          this.isActuallyDragging = true;
        }

        if (this.isActuallyDragging) {
          this.tile.onDrag([event.x - this.x, event.y - this.y]);
        }
      }
    });

  protected onPointer(x = NaN, y = NaN, end = false): void {
    const {left, top} = this.tile.element.getBoundingClientRect();

    this.x = x - left;
    this.y = y - top;

    if (end) {
      this.startX = NaN;
      this.startY = NaN;
      this.isActuallyDragging = false;
      this.tile.onDrag([NaN, NaN], end);
    }
  }

  protected onStart(event: Event): void {
    const pointerEvent = event as PointerEvent;
    const target = getActualTarget(pointerEvent);
    const {x, y, pointerId} = pointerEvent;

    if (isElement(target)) {
      target.releasePointerCapture(pointerId);
    }

    this.startX = x;
    this.startY = y;
    this.onPointer(x, y);
  }
}
