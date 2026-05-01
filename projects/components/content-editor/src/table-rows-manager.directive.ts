import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ngsTableRowsManager]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
  }
})
export class TableRowsManagerDirective {
  private _elementRef = inject(ElementRef);
  private _destroyRef = inject(DestroyRef);
  private _document = inject(DOCUMENT);

  private _dragging = false;
  private _elementPosition = 0;
  private _cellHeight = 24;

  readonly rowManagingStart = output();
  readonly rowManagingEnd = output();
  readonly rowAdded = output();
  readonly rowDeleted = output();

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
        this._elementPosition = elementRect.y + elementRect.height / 2;
        this.rowManagingStart.emit();
      });
    fromEvent(this._document, 'mousemove')
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event: any) => {
        if (this._dragging) {
          const elementRect = this._elementRef.nativeElement.getBoundingClientRect();
          const elementBottomPosition = elementRect.y + elementRect.height;
          const elementTopPosition = elementRect.y;

          if (event.clientY > (this._elementPosition + this._cellHeight) && event.clientY > (elementBottomPosition + this._cellHeight)) {
            this._elementPosition = elementBottomPosition + this._cellHeight;
            this.rowAdded.emit();
          } else if (event.clientY < (this._elementPosition - this._cellHeight) && event.clientY < (elementTopPosition - this._cellHeight)) {
            this._elementPosition = elementTopPosition - this._cellHeight;
            this.rowDeleted.emit();
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
          this.rowManagingEnd.emit();
        }
      });
  }
}
