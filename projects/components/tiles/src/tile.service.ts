import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, type OnDestroy, PLATFORM_ID } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  zonefreeScheduler,
  injectElement,
  arrayShallowEquals,
  px,
  ResizeObserverService,
  MutationObserverService
} from '@ngstarter/components/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  type Observable,
  startWith,
  Subscription,
} from 'rxjs';

import { Tiles } from './tiles/tiles';

@Injectable()
export class TileService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly el = injectElement();
  private readonly tiles = inject(Tiles);
  private readonly sub = new Subscription();
  private readonly offset$ = new BehaviorSubject<readonly [number, number]>([NaN, NaN]);
  private readonly resize$ = inject(ResizeObserverService).observe(this.el);
  private readonly mutations$ = inject(MutationObserverService).observe(this.el, {childList: true});
  private lastRect: DOMRect | null = null;

  private readonly position$: Observable<{offset: readonly [number, number], order: Map<any, number>}> = combineLatest([
    this.offset$.pipe(distinctUntilChanged(arrayShallowEquals)),
    this.resize$.pipe(startWith(null as any)),
    this.mutations$.pipe(startWith(null as any)),
    toObservable(this.tiles.order).pipe(debounceTime(0, zonefreeScheduler())),
  ]).pipe(
    debounceTime(0, zonefreeScheduler()),
    map(([offset, _, __, order]) => ({offset, order}))
  );

  public init(element?: HTMLElement): void {
    if (this.isBrowser && element) {
      this.sub.add(
        this.position$.subscribe(({offset, order}) => {
          this.animate(element);
          this.setPosition(element, offset);
          this.setRect(element, offset);
        }),
      );
    } else {
      this.el.style.setProperty('position', 'relative');
    }
  }

  private animate(element: HTMLElement): void {
    const isDragging = !Number.isNaN(this.offset$.value[0]);
    const currentRect = this.el.getBoundingClientRect();

    if (isDragging || (element.style.position === 'fixed' && !element.style.transition.includes('top'))) {
      this.lastRect = currentRect;
      return;
    }

    if (this.lastRect) {
      const dx = this.lastRect.left - currentRect.left;
      const dy = this.lastRect.top - currentRect.top;

      if (dx !== 0 || dy !== 0) {
        element.style.setProperty('transition', 'none');
        element.style.setProperty('transform', `translate(${px(dx)}, ${px(dy)})`);

        // Trigger reflow
        element.offsetHeight;

        element.style.removeProperty('transition');
        element.style.removeProperty('transform');
      }
    }
    this.lastRect = currentRect;
  }

  public setOffset(offset: readonly [number, number]): void {
    this.offset$.next(offset);
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private getRect([left, top]: readonly [number, number]): DOMRect {
    const elTop = Number.isNaN(top) ? this.el.offsetTop : top;
    const elLeft = Number.isNaN(left) ? this.el.offsetLeft : left;

    const rect = {
      top: elTop,
      left: elLeft,
      width: this.el.clientWidth,
      height: this.el.clientHeight,
      right: NaN,
      bottom: NaN,
      y: elTop,
      x: elLeft,
    };

    return {
      ...rect,
      toJSON: () => JSON.stringify(rect),
    };
  }

  private setRect({style}: HTMLElement, offset: readonly [number, number]): void {
    const isDragging = !Number.isNaN(offset[0]);

    if (!isDragging) {
      return;
    }

    const {top, left, width, height} = this.getRect(offset);

    style.width = px(width);
    style.height = px(height);
    style.top = px(top);
    style.left = px(left);
  }

  private setPosition(element: HTMLElement, [left]: readonly [number, number]): void {
    const isDragging = !Number.isNaN(left);

    if (isDragging) {
      element.style.setProperty('transition', 'none');
      element.style.setProperty('position', 'fixed');
      element.style.setProperty('z-index', '100');
      // This inline style will override the CSS class, making the floating tile visible
      element.style.setProperty('opacity', '1');
      element.style.setProperty('pointer-events', 'none');
    } else if (element.style.position === 'fixed') {
      const {top, left, width, height} = this.el.getBoundingClientRect();
      const currentTop = parseFloat(element.style.top);
      const currentLeft = parseFloat(element.style.left);

      // If already at target, clean up immediately
      if (Math.abs(currentTop - top) < 1 && Math.abs(currentLeft - left) < 1) {
        this.cleanup(element);
        return;
      }

      // Transition for smooth return
      element.style.setProperty('transition', 'top 300ms cubic-bezier(0.2, 0, 0, 1), left 300ms cubic-bezier(0.2, 0, 0, 1), width 300ms cubic-bezier(0.2, 0, 0, 1), height 300ms cubic-bezier(0.2, 0, 0, 1), transform 300ms cubic-bezier(0.2, 0, 0, 1)');

      element.style.top = px(top);
      element.style.left = px(left);
      element.style.width = px(width);
      element.style.height = px(height);

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName === 'top' || event.propertyName === 'left') {
          element.removeEventListener('transitionend', onTransitionEnd);
          this.cleanup(element);
        }
      };

      element.addEventListener('transitionend', onTransitionEnd);

      // Fallback cleanup if transitionend doesn't fire
      setTimeout(() => {
        element.removeEventListener('transitionend', onTransitionEnd);
        this.cleanup(element);
      }, 400);
    }
  }

  private cleanup(element: HTMLElement): void {
    element.style.removeProperty('transition');
    element.style.removeProperty('position');
    element.style.removeProperty('z-index');
    element.style.removeProperty('opacity');
    element.style.removeProperty('pointer-events');
    element.style.removeProperty('top');
    element.style.removeProperty('left');
    element.style.removeProperty('width');
    element.style.removeProperty('height');
  }
}
