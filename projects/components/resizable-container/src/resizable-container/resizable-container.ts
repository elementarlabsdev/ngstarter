import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject, input,
  NgZone,
  numberAttribute,
  OnInit,
  Renderer2,
  viewChild,
  DOCUMENT,
  output
} from '@angular/core';
import { fromEvent, throttleTime } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-resizable-container',
  exportAs: 'ngsResizableContainer',
  templateUrl: './resizable-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './resizable-container.scss',
  host: {
    'class': 'ngs-resizable-container'
  }
})
export class ResizableContainer implements OnInit {
  private _renderer = inject(Renderer2);
  private _elementRef = inject(ElementRef);
  private _cdr = inject(ChangeDetectorRef);
  private _ngZone = inject(NgZone);
  private _destroyRef = inject(DestroyRef);
  private _document = inject(DOCUMENT);
  private _resizing = false;
  private _maxWidth: number;
  private _clientX: number;
  private _initialWidth: number;

  readonly handlerRef = viewChild.required<ElementRef>('handler');

  minWidth = input(0, {
    transform: numberAttribute
  });

  readonly resized = output<{ width: number }>();

  ngOnInit() {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(this.handlerRef().nativeElement, 'mousedown')
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((event: MouseEvent) => {
          this._resizing = true;
          this._maxWidth = this._elementRef.nativeElement.parentElement.getBoundingClientRect().width;
          this._clientX = event.clientX;
          this._initialWidth = this._elementRef.nativeElement.getBoundingClientRect().width;

          // Prevent text selection during resize
          this._document.body.style.userSelect = 'none';
          this._document.body.style.cursor = 'ew-resize';

          this._cdr.detectChanges();
        })
      ;
      fromEvent<MouseEvent>(this._document, 'mousemove')
        .pipe(
          throttleTime(5),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe((event: MouseEvent) => {
          if (this._resizing) {
            let width = this._initialWidth - (this._clientX - event.clientX);

            if (width <= this.minWidth()) {
              width = this.minWidth();
            } else if (width >= this._maxWidth) {
              width = this._maxWidth;
            }

            this._renderer.setStyle(this._elementRef.nativeElement, 'width', width + 'px');
            this.resized.emit({ width });
          }
        })
      ;
      fromEvent(this._document, 'mouseup')
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(event => {
          this._resizing = false;
          this._document.body.style.userSelect = '';
          this._document.body.style.cursor = '';
          this._cdr.detectChanges();
        })
      ;
    });
  }
}
