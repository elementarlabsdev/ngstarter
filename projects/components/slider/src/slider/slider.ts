import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Directionality } from '@angular/cdk/bidi';
import { SliderThumb } from '../slider-thumb';
import { filter, fromEvent, merge, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'ngs-slider',
  exportAs: 'ngsSlider',
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-slider',
    '[class.ngs-slider-disabled]': 'disabled()',
    '[class.ngs-slider-discrete]': 'discrete()',
    '[class.ngs-slider-show-tick-marks]': 'showTickMarks()',
  },
})
export class Slider {
  private elementRef = inject(ElementRef);
  readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dir = inject(Directionality, { optional: true });
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);

  disabled = input(false, { transform: booleanAttribute });
  discrete = input(false, { transform: booleanAttribute });
  showTickMarks = input(false, { transform: booleanAttribute });
  min = input(0, { transform: numberAttribute });
  max = input(100, { transform: numberAttribute });
  step = input(1, { transform: numberAttribute });
  displayWith = input<(value: number) => string>((value: number) => `${value}`);

  _allThumbs = contentChildren(SliderThumb, { descendants: true });

  _trackLeft = computed(() => {
    const thumbs = this._allThumbs();
    if (thumbs.length === 2) {
      const p1 = thumbs[0].percentage || 0;
      const p2 = thumbs[1].percentage || 0;
      return Math.min(p1, p2) * 100;
    }
    return 0;
  });

  _trackRight = computed(() => {
    const thumbs = this._allThumbs();
    if (thumbs.length === 2) {
      const p1 = thumbs[0].percentage || 0;
      const p2 = thumbs[1].percentage || 0;
      return (1 - Math.max(p1, p2)) * 100;
    }
    const thumb = thumbs[0];
    return (1 - (thumb?.percentage || 0)) * 100;
  });

  _activeThumb = signal<SliderThumb | null>(null);
  _isDragging = signal(false);
  _tickMarks = computed(() => {
    if (!this.showTickMarks() || this.step() <= 0) {
      return [];
    }

    const count = Math.floor((this.max() - this.min()) / this.step()) + 1;
    return Array(count).fill(1); // 1 = inactive by default
  });

  _isRtl = false;

  constructor() {
    if (this._dir) {
      this._dir.change.pipe(takeUntilDestroyed()).subscribe(() => {
        this._isRtl = this._dir!.value === 'rtl';
        this._cdr.markForCheck();
      });
      this._isRtl = this._dir.value === 'rtl';
    }

    effect(() => {
      this._allThumbs();
      this._cdr.markForCheck();
    });

    this._initializeEvents();
  }

  private _initializeEvents() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const sliderElement = this.elementRef.nativeElement as HTMLElement;

    const pointerDown$ = merge(
      fromEvent<MouseEvent>(sliderElement, 'mousedown'),
      fromEvent<TouchEvent>(sliderElement, 'touchstart', { passive: false })
    ).pipe(
      filter((event) => {
        if (this.disabled()) return false;
        return !(event instanceof MouseEvent && event.button !== 0);
      })
    );

    const pointerMove$ = merge(
      fromEvent<MouseEvent>(this._document, 'mousemove'),
      fromEvent<TouchEvent>(this._document, 'touchmove', { passive: false })
    );

    const pointerUp$ = merge(
      fromEvent<MouseEvent>(this._document, 'mouseup'),
      fromEvent<TouchEvent>(this._document, 'touchend', { passive: false }),
      fromEvent<TouchEvent>(this._document, 'touchcancel', { passive: false })
    );

    pointerDown$
      .pipe(
        filter(() => !this.disabled()),
        tap((event) => {
          if (event instanceof TouchEvent) {
            event.preventDefault();
          }
          this._isDragging.set(true);
          this._onPointerDown(event);
          this._cdr.markForCheck();
        }),
        switchMap(() =>
          pointerMove$.pipe(
            tap((event) => {
              if (event instanceof TouchEvent) {
                event.preventDefault();
              }
            }),
            takeUntil(
              pointerUp$.pipe(
                tap(() => {
                  this._isDragging.set(false);
                  this._cdr.markForCheck();
                })
              )
            )
          )
        ),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event) => {
        this._onPointerMove(event);
      });

    merge(
      fromEvent<MouseEvent>(sliderElement, 'mousemove'),
      fromEvent<TouchEvent>(sliderElement, 'touchmove', { passive: false })
    )
      .pipe(
        filter(() => !this.disabled() && !this._isDragging()),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event) => {
        this._onPointerMove(event);
      });
  }

  _onValueChange(thumb: SliderThumb) {
    this._cdr.markForCheck();
  }

  private _findClosestThumb(percentage: number): SliderThumb | null {
    const thumbs = this._allThumbs();
    if (thumbs.length === 0) {
      return null;
    }

    let closestThumb = thumbs[0];
    let minDistance = Math.abs(thumbs[0].percentage - percentage);

    for (let i = 1; i < thumbs.length; i++) {
      const distance = Math.abs(thumbs[i].percentage - percentage);

      if (distance < minDistance) {
        minDistance = distance;
        closestThumb = thumbs[i];
      } else if (distance === minDistance) {
        // If distances are equal (e.g., thumbs are at the same point)
        if (percentage > thumbs[i].percentage) {
          // If click is to the right of the overlap point, select the "right" thumb
          // (in the array thumbs[1] is usually the end thumb)
          closestThumb = thumbs[i];
        } else if (percentage < thumbs[i].percentage) {
          // If click is to the left
          closestThumb = thumbs[i-1];
        } else {
          // If click is exactly at the overlap point
          // give priority to the already active one
          if (thumbs[i] === this._activeThumb()) {
            closestThumb = thumbs[i];
          }
        }
      }
    }

    return closestThumb;
  }

  _onPointerDown(event: MouseEvent | TouchEvent) {
    if (this.disabled()) {
      return;
    }

    const percentage = this._calculatePercentage(event);
    const closestThumb = this._findClosestThumb(percentage);

    if (closestThumb) {
      this._activeThumb.set(closestThumb);

      const value = this._calculateValueFromPercentage(percentage);
      closestThumb._updateValueFromUser(value);
      closestThumb.focus();
      this._cdr.markForCheck();
    }
  }

  _onPointerMove(event: MouseEvent | TouchEvent) {
    if (this.disabled()) {
      return;
    }

    const percentage = this._calculatePercentage(event);
    const isDragging = this._isDragging();
    const activeThumb = this._activeThumb();

    if (isDragging && activeThumb) {
      const value = this._calculateValueFromPercentage(percentage);
      activeThumb._updateValueFromUser(value);
      this._cdr.markForCheck();
    } else if (!isDragging) {
      const closestThumb = this._findClosestThumb(percentage);

      if (closestThumb && activeThumb !== closestThumb) {
        this._activeThumb.set(closestThumb);
        this._cdr.markForCheck();
      }
    }
  }

  private _calculatePercentage(event: MouseEvent | TouchEvent): number {
    const sliderElement = this.elementRef.nativeElement as HTMLElement;
    const wrapper = sliderElement.querySelector('.ngs-slider-wrapper') as HTMLElement;
    const rect = (wrapper || sliderElement).getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;

    let position = (clientX - rect.left) / rect.width;
    position = Math.max(0, Math.min(1, position));

    return this._isRtl ? 1 - position : position;
  }

  private _calculateValueFromPercentage(percentage: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step();

    const rawValue = min + percentage * (max - min);
    let value = rawValue;

    if (step > 0) {
      value = Math.round(rawValue / step) * step;
    }

    return Math.max(min, Math.min(max, value));
  }
}
