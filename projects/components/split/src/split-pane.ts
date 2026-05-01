import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';

import { Split } from './split/split';
import { getInputPositiveNumber } from './utils';
import { signal, WritableSignal } from '@angular/core';

@Directive({
  selector: 'ngs-split-pane, [ngs-split-pane]',
  exportAs: 'ngsSplitPane',
  standalone: true,
})
export class SplitPane implements OnDestroy {
  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);
  private split = inject(Split);

  elRef = inject(ElementRef);

  /**
   * Order of the area. Used to maintain the order of areas when toggling their visibility.
   * Toggling area visibility without specifying an `order` leads to weird behavior.
   */
  orderIn = input<number | null, number | string | null>(null, {
    alias: 'order',
    transform: v => getInputPositiveNumber(v, null),
  });

  /**
   * Size of the area in selected unit (percent/pixel).
   * - Percent: All areas sizes should equal to `100`, If not, all areas will have the same size.
   * - Pixel: An area with wildcard size (`size="*"`) is mandatory (only one) and
   *   can't have `visible="false"` or `minSize`/`maxSize`/`lockSize` properties.
   */
  sizeIn = input<number | null, number | string | null>(null, {
    alias: 'size',
    transform: v => getInputPositiveNumber(v, null),
  });

  /** Minimum pixel or percent size, should be equal to or smaller than provided `size`. */
  minSizeIn = input<number | null, number | string | null>(null, {
    alias: 'minSize',
    transform: v => getInputPositiveNumber(v, null),
  });

  /** Maximum pixel or percent size, should be equal to or larger than provided `size`. */
  maxSizeIn = input<number | null, number | string | null>(null, {
    alias: 'maxSize',
    transform: v => getInputPositiveNumber(v, null),
  });

  /** Lock area size, same as `minSize`=`maxSize`=`size`. */
  lockSizeIn = input(false, { alias: 'lockSize', transform: booleanAttribute });

  /** Hide area visually but still present in the DOM, use `ngIf` to completely remove it. */
  visibleIn = input(true, { alias: 'visible', transform: booleanAttribute });

  /** Show handle (three dots) on the gutter adjacent to this pane. */
  withHandleIn = input(false, { alias: 'withHandle', transform: booleanAttribute });

  // Writable state reflecting current effective values (can be changed programmatically by Split)
  private orderSig: WritableSignal<number | null> = signal<number | null>(null, { equal: Object.is });
  private sizeSig: WritableSignal<number | null> = signal<number | null>(null, { equal: Object.is });
  private minSizeSig: WritableSignal<number | null> = signal<number | null>(null, { equal: Object.is });
  private maxSizeSig: WritableSignal<number | null> = signal<number | null>(null, { equal: Object.is });
  private lockSizeSig: WritableSignal<boolean> = signal(false, { equal: Object.is });
  private visibleSig: WritableSignal<boolean> = signal(true, { equal: Object.is });
  private withHandleSig: WritableSignal<boolean> = signal(false, { equal: Object.is });

  private transitionListener!: () => void;
  private readonly lockListeners: (() => void)[] = [];

  constructor() {
    this.renderer.addClass(this.elRef.nativeElement, 'ngs-split-pane');
    this.split.addArea(this);

    this.ngZone.runOutsideAngular(() => {
      this.transitionListener = this.renderer.listen(
        this.elRef.nativeElement,
        'transitionend',
        (event: TransitionEvent) => {
          // Limit only flex-basis transition to trigger the event
          if (event.propertyName === 'flex-basis') {
            this.split.notify('transitionEnd', -1);
          }
        }
      );
    });

    // Sync inputs to writable state
    effect(() => this.orderSig.set(this.orderIn()));
    effect(() => this.sizeSig.set(this.sizeIn()));
    effect(() => this.minSizeSig.set(this.minSizeIn()));
    effect(() => this.maxSizeSig.set(this.maxSizeIn()));
    effect(() => this.lockSizeSig.set(this.lockSizeIn()));
    effect(() => this.withHandleSig.set(this.withHandleIn()));

    // React to visibility changes
    effect(() => {
      const isVisible = this.visibleIn();
      this.visibleSig.set(isVisible);
      if (isVisible) {
        this.split.showArea(this);
        this.renderer.removeClass(this.elRef.nativeElement, 'ngs-split-pane-hidden');
      } else {
        this.split.hideArea(this);
        this.renderer.addClass(this.elRef.nativeElement, 'ngs-split-pane-hidden');
      }
    });

    // React to state changes that require rebuild
    effect(() => {
      this.orderSig();
      if (!this.split.isDraggingPublic()) {
        this.split.updateArea(this, true, false);
      }
    });
    effect(() => {
      this.sizeSig();
      this.minSizeSig();
      this.maxSizeSig();
      this.lockSizeSig();
      if (!this.split.isDraggingPublic()) {
        this.split.updateArea(this, false, true);
      }
    });
    effect(() => {
      this.withHandleSig();
      if (!this.split.isDraggingPublic()) {
        this.split.updateArea(this, false, false);
      }
    });
  }

  // Imperative API used by Split
  getOrder(): number | null { return this.orderSig(); }
  getSize(): number | null { return this.sizeSig(); }
  setSize(v: number | null): void {
    this.sizeSig.set(v);
    this.split.updateAreaInternal(this);
  }
  getMinSize(): number | null { return this.minSizeSig(); }
  getMaxSize(): number | null { return this.maxSizeSig(); }
  isLocked(): boolean { return this.lockSizeSig(); }
  isVisible(): boolean { return this.visibleSig(); }
  hasHandle(): boolean { return this.withHandleSig(); }

  setStyleOrder(value: number): void {
    this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
  }

  setStyleFlex(grow: number, shrink: number, basis: string, isMin: boolean, isMax: boolean): void {
    // Need 3 separated properties to work on IE11 (https://github.com/angular/flex-layout/issues/323)
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis);

    if (basis === '0px' || basis === '0%') {
      this.renderer.setStyle(this.elRef.nativeElement, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(this.elRef.nativeElement, 'overflow');
    }

    if (isMin === true) {
      this.renderer.addClass(this.elRef.nativeElement, 'ngs-min');
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, 'ngs-min');
    }

    if (isMax === true) {
      this.renderer.addClass(this.elRef.nativeElement, 'ngs-max');
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, 'ngs-max');
    }
  }

  lockEvents(): void {
    this.ngZone.runOutsideAngular(() => {
      this.lockListeners.push(
        this.renderer.listen(this.elRef.nativeElement, 'selectstart', (e: Event) => false)
      );
      this.lockListeners.push(
        this.renderer.listen(this.elRef.nativeElement, 'dragstart', (e: Event) => false)
      );
    });
  }

  unlockEvents(): void {
    while (this.lockListeners.length > 0) {
      const fct = this.lockListeners.pop();
      if (fct) {
        fct();
      }
    }
  }

  ngOnDestroy(): void {
    this.unlockEvents();

    if (this.transitionListener) {
      this.transitionListener();
    }

    this.split.removeArea(this);
  }
}
