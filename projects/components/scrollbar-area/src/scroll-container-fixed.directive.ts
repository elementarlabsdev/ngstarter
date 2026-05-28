import {
  AfterViewInit,
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  NgZone,
  numberAttribute,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { auditTime, fromEvent, merge, Observable, startWith, Subject } from 'rxjs';

@Directive({
  selector: '[ngsScrollContainerFixed]',
  exportAs: 'ngsScrollContainerFixed',
  standalone: true,
  host: {
    '[style.box-sizing]': '"border-box"',
    '[style.height.px]': 'height()',
    '[style.min-height.px]': 'enabled() ? minHeight() : null',
  },
})
export class ScrollContainerFixed implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshChanges = new Subject<void>();

  readonly enabled = input(true, {
    alias: 'ngsScrollContainerFixed',
    transform: booleanAttribute,
  });
  readonly bottomOffset = input(0, {
    alias: 'ngsScrollContainerFixedBottomOffset',
    transform: numberAttribute,
  });
  readonly minHeight = input(0, {
    alias: 'ngsScrollContainerFixedMinHeight',
    transform: numberAttribute,
  });

  readonly height = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.enabled();
      this.bottomOffset();
      this.minHeight();
      this.refresh();
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      merge(...this.getResizeStreams())
        .pipe(
          startWith(null),
          auditTime(0),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => this.updateHeight());
    });
  }

  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.refreshChanges.next();
  }

  private updateHeight(): void {
    if (!this.enabled()) {
      this.height.set(null);
      return;
    }

    const elementTop = this.elementRef.nativeElement.getBoundingClientRect().top;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const nextHeight = Math.max(
      this.minHeight(),
      Math.floor(viewportHeight - elementTop - this.bottomOffset()),
    );

    this.height.set(nextHeight);
  }

  private getResizeStreams(): Observable<unknown>[] {
    const streams: Observable<unknown>[] = [
      this.refreshChanges.asObservable(),
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange'),
      this.observeElement(this.elementRef.nativeElement),
    ];

    if (this.elementRef.nativeElement.parentElement) {
      streams.push(this.observeElement(this.elementRef.nativeElement.parentElement));
    }

    if (window.visualViewport) {
      streams.push(
        fromEvent(window.visualViewport, 'resize'),
        fromEvent(window.visualViewport, 'scroll'),
      );
    }

    return streams;
  }

  private observeElement(element: Element): Observable<ResizeObserverEntry[]> {
    return new Observable<ResizeObserverEntry[]>(observer => {
      if (typeof ResizeObserver === 'undefined') {
        observer.complete();
        return undefined;
      }

      const resizeObserver = new ResizeObserver(entries => observer.next(entries));
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    });
  }
}
