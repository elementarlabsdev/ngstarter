import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[ngsTableColumnsManager]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
  }
})
export class TableColumnsManagerDirective {
  private _elementRef = inject(ElementRef);
  private _destroyRef = inject(DestroyRef);
  private _document = inject(DOCUMENT);

  private _dragging = false;
  private _elementPosition = 0;
  private _cellWidth = 90;

  readonly columnAdded = output();
  readonly columnDeleted = output();
  readonly columnManagingStart = output();
  readonly columnManagingEnd = output();

  constructor() {
    afterNextRender(() => {
      this._initResize();
    });
  }

  protected onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _initResize() {
    fromEvent(this._elementRef.nativeElement, 'mousedown')
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event: any) => {
        this._dragging = true;
        const elementRect = this._elementRef.nativeElement.getBoundingClientRect();
        this._elementPosition = elementRect.x + elementRect.width / 2;
        this.columnManagingStart.emit();
      });
    fromEvent(this._document, 'mousemove')
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event: any) => {
        if (this._dragging) {
          const elementRect = this._elementRef.nativeElement.getBoundingClientRect();
          const elementRightPosition = elementRect.x + elementRect.width;
          const elementLeftPosition = elementRect.x;

          if (event.clientX > (this._elementPosition + this._cellWidth) && event.clientX > (elementRightPosition + this._cellWidth)) {
            this._elementPosition = elementRightPosition + this._cellWidth;
            this.columnAdded.emit();
          } else if (event.clientX < (this._elementPosition - this._cellWidth) && event.clientX < (elementLeftPosition - this._cellWidth)) {
            this._elementPosition = elementLeftPosition - this._cellWidth;
            this.columnDeleted.emit();
          }
        }
      });
    fromEvent(this._document, 'mouseup')
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event: any) => {
        if (this._dragging) {
          this._dragging = false;
          this.columnManagingEnd.emit();
        }
      });
  }
}
