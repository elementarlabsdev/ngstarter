import {
  Component,
  input,
  signal,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  DestroyRef,
  effect,
  computed,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Icon } from '@ngstarter-ui/components/icon';
import { fromEvent, merge, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-comparison-slider',
  exportAs: 'ngsComparisonSlider',
  imports: [
    Icon,
  ],
  templateUrl: './comparison-slider.html',
  styleUrl: './comparison-slider.scss',
  host: {
    'class': 'ngs-comparison-slider not-prose',
    '(contextmenu)': 'onContextMenu($event)',
    '(dragstart)': 'onDragStart($event)'
  }
})
export class ComparisonSlider implements AfterViewInit, OnDestroy {
  private resizeObserver: ResizeObserver | null = null;
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private sliderContainerRef = viewChild.required<ElementRef<HTMLDivElement>>('sliderContainer');
  private handleRef = viewChild.required<ElementRef<HTMLDivElement>>('handle');

  initialPosition = input<number>(50);

  sliderPosition = signal<number>(0);
  isDragging = signal<boolean>(false);
  private containerRect: DOMRect | null = null;

  handleLeftStyle = computed(() => `${this.sliderPosition()}%`);
  afterImageClipStyle = computed(() => `inset(0 ${100 - this.sliderPosition()}% 0 0)`);

  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(() => {
      const initial = this.initialPosition();
      this.sliderPosition.set(Math.max(0, Math.min(100, initial)));
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.updateContainerRect();

      if (typeof ResizeObserver !== 'undefined' && this.sliderContainerRef() && this.sliderContainerRef().nativeElement) {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateContainerRect();
        });
        this.resizeObserver.observe(this.sliderContainerRef().nativeElement);
      }

      this.initDragStreams();
    }
  }

  private initDragStreams(): void {
    const container = this.sliderContainerRef().nativeElement;
    const handle = this.handleRef().nativeElement;

    this.ngZone.runOutsideAngular(() => {
      const mouseDown$ = fromEvent<MouseEvent>(handle, 'mousedown');
      const touchStart$ = fromEvent<TouchEvent>(handle, 'touchstart');
      const containerMouseDown$ = fromEvent<MouseEvent>(container, 'mousedown');
      const containerTouchStart$ = fromEvent<TouchEvent>(container, 'touchstart');

      const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove');
      const touchMove$ = fromEvent<TouchEvent>(window, 'touchmove', { passive: false });
      const mouseUp$ = fromEvent<MouseEvent>(window, 'mouseup');
      const touchEnd$ = fromEvent<TouchEvent>(window, 'touchend');

      const start$ = merge(mouseDown$, touchStart$);
      const move$ = merge(mouseMove$, touchMove$);
      const end$ = merge(mouseUp$, touchEnd$);

      merge(start$, containerMouseDown$, containerTouchStart$)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event: MouseEvent | TouchEvent) => {
          if (event instanceof MouseEvent && event.button !== 0) {
            return;
          }

          if (event.currentTarget === container && handle.contains(event.target as Node)) {
            return;
          }

          this.ngZone.run(() => {
            this.isDragging.set(true);
            this.updateContainerRect();

            const clientX = event instanceof MouseEvent ? event.clientX : (event.touches.length > 0 ? event.touches[0].clientX : 0);
            this.updateSliderPosition(clientX);
          });

          const moveSubscription = move$
            .pipe(
              takeUntil(end$)
            )
            .subscribe((moveEvent: MouseEvent | TouchEvent) => {
              if (moveEvent.cancelable) {
                moveEvent.preventDefault();
              }

              const clientX = moveEvent instanceof MouseEvent ? moveEvent.clientX : (moveEvent.touches.length > 0 ? moveEvent.touches[0].clientX : 0);
              this.ngZone.run(() => {
                this.updateSliderPosition(clientX);
              });
            });

          const endSubscription = end$
            .pipe(
              takeUntil(start$)
            )
            .subscribe(() => {
              moveSubscription.unsubscribe();
              endSubscription.unsubscribe();
              this.ngZone.run(() => {
                this.isDragging.set(false);
              });
            });
        });
    });
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateContainerRect(): void {
    if (this.isBrowser && this.sliderContainerRef()) {
      this.containerRect = this.sliderContainerRef().nativeElement.getBoundingClientRect();
    } else {
      this.containerRect = null;
    }
  }

  private updateSliderPosition(clientX: number): void {
    const rect = this.containerRect;

    if (!rect) {
      return;
    }

    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    this.sliderPosition.set(percentage);
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onDragStart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
