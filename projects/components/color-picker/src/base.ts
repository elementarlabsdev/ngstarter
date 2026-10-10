import { Directive, ElementRef, inject, DOCUMENT, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subject, takeUntil } from 'rxjs';

@Directive()
export abstract class BaseComponent implements OnDestroy {
  private readonly dragEnd = new Subject<void>();
  private readonly destroyed = new Subject<void>();
  private readonly document = inject(DOCUMENT);
  protected readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    merge(
      fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown'),
      fromEvent<TouchEvent>(this.elementRef.nativeElement, 'touchstart', { passive: true })
    ).pipe(takeUntil(this.destroyed)).subscribe(event => this.startDrag(event));
  }

  public abstract movePointer(coordinates: { x: number; y: number; height: number; width: number }): void;

  private startDrag(event: MouseEvent | TouchEvent): void {
    if (event instanceof MouseEvent && event.button !== 0) {
      return;
    }
    this.dragEnd.next();
    this.calculateCoordinates(event);

    merge(
      fromEvent(this.document, 'mouseup'),
      fromEvent(this.document, 'touchend'),
      fromEvent(this.document, 'touchcancel')
    ).pipe(takeUntil(this.dragEnd), takeUntil(this.destroyed))
      .subscribe(() => this.dragEnd.next());

    merge(
      fromEvent<MouseEvent>(this.document, 'mousemove'),
      fromEvent<TouchEvent>(this.document, 'touchmove', { passive: true })
    ).pipe(takeUntil(this.dragEnd), takeUntil(this.destroyed))
      .subscribe(move => this.calculateCoordinates(move));
  }

  private calculateCoordinates(event: MouseEvent | TouchEvent): void {
    const point = 'touches' in event ? event.touches[0] : event;
    if (!point) {
      return;
    }
    const { width, height, top, left } = this.elementRef.nativeElement.getBoundingClientRect();
    if (width <= 0 || height <= 0) {
      return;
    }
    const x = Math.max(0, Math.min(point.clientX - left, width));
    const y = Math.max(0, Math.min(point.clientY - top, height));
    this.movePointer({ x, y, height, width });
  }

  ngOnDestroy(): void {
    this.dragEnd.next();
    this.destroyed.next();
    this.dragEnd.complete();
    this.destroyed.complete();
  }
}
