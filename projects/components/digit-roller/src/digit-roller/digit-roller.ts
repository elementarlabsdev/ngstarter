import { isPlatformBrowser } from '@angular/common';
import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { canAnimateDigitRoller } from '../digit-roller-capabilities';
import { getDigitRollerGlyphs, formatDigitRollerValue } from '../digit-roller-formatter';
import { DIGIT_ROLLER_GROUP } from '../digit-roller-group.token';
import {
  DIGIT_ROLLER_EMPTY_FORMATTED,
  DigitRollerDigits,
  DigitRollerEasing,
  DigitRollerFormattedNumber,
  DigitRollerTiming,
  DigitRollerTrend,
} from '../digit-roller.types';

const SPIN_EASING =
  'linear(0,.005,.019,.039,.066,.096,.129,.165,.202,.24,.278,.316,.354,.39,.426,.461,' +
  '.494,.526,.557,.586,.614,.64,.665,.689,.711,.731,.751,.769,.786,.802,.817,.831,.844,' +
  '.856,.867,.877,.887,.896,.904,.912,.919,.925,.931,.937,.942,.947,.951,.955,.959,.962,' +
  '.965,.968,.971,.973,.976,.978,.98,.981,.983,.984,.986,.987,.988,.989,.99,.991,.992,' +
  '.992,.993,.994,.994,.995,.995,.996,.996,.9963,.9967,.9969,.9972,.9975,.9977,.9979,' +
  '.9981,.9982,.9984,.9985,.9987,.9988,.9989,1)';

const EASING_PRESETS: Record<string, string> = {
  default: SPIN_EASING,
  spring: SPIN_EASING,
  overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

@Component({
  selector: 'ngs-digit-roller',
  exportAs: 'ngsDigitRoller',
  templateUrl: './digit-roller.html',
  styleUrl: './digit-roller.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-digit-roller',
    '[attr.data-animated]': 'animated()',
  },
})
export class DigitRoller {
  value = input.required<number>();
  format = input<Intl.NumberFormatOptions>({});
  locales = input<string | string[] | undefined>(undefined);
  prefix = input('');
  suffix = input('');
  animated = input(true);

  duration = input<number | undefined>(undefined);
  opacityDuration = input<number | undefined>(undefined);
  transformTiming = input<DigitRollerTiming | undefined>(undefined);
  spinTiming = input<DigitRollerTiming | undefined>(undefined);
  opacityTiming = input<DigitRollerTiming | undefined>(undefined);

  spinEasing = input<DigitRollerEasing | undefined>(undefined);
  flipEasing = input<DigitRollerEasing | undefined>(undefined);
  trend = input<DigitRollerTrend | undefined>(undefined);

  continuous = input(false);
  digits = input<DigitRollerDigits>({});
  respectMotionPreference = input(true);
  stagger = input(0);
  colorOnIncrease = input<string | undefined>(undefined);
  colorOnDecrease = input<string | undefined>(undefined);

  animationsStart = output<void>();
  animationsFinish = output<void>();

  protected data = signal<DigitRollerFormattedNumber>(DIGIT_ROLLER_EMPTY_FORMATTED);
  protected digitGlyphs = computed(() => getDigitRollerGlyphs(this.locales(), this.format()));
  protected formattedPlainText = computed(() =>
    new Intl.NumberFormat(this.locales(), this.format()).format(this.value()),
  );
  protected effectiveSettings = computed(() => {
    const duration = this.duration() ?? 900;

    return {
      duration,
      opacityDuration: this.opacityDuration() ?? 450,
      spinEasing: this.resolveEasing(this.spinEasing()),
      flipEasing: this.resolveEasing(this.flipEasing()),
      transformTiming: this.transformTiming(),
      spinTiming: this.spinTiming(),
      opacityTiming: this.opacityTiming(),
    };
  });

  private platformId = inject(PLATFORM_ID);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  private group = inject(DIGIT_ROLLER_GROUP, { optional: true });

  private prevRects = new Map<string, DOMRect>();
  private prevInnerHTML = new Map<string, string>();
  private prevDigitD = new Map<string, string>();
  private prevDigitCurrent = new Map<string, string>();
  private prevDigitValues = new Map<string, number>();
  private prevDigitOrder: string[] = [];
  private prevNumberLeft = 0;
  private prevNumberWidth = 0;
  private prevNumericValue = 0;

  private animCount = 0;
  private pending = false;
  private destroyed = false;
  private hasRenderedValue = false;
  private liveAnimations: Animation[] = [];
  private spinCount = new Map<HTMLElement, number>();
  private animationsFinishAbort?: AbortController;
  private pendingCanAnimate = false;
  private pendingHostFont = '';
  private pendingHostColor = '';
  private pendingKeyedEls: Array<{ el: HTMLElement; key: string; newRect: DOMRect }> = [];
  private pendingNumberRect: DOMRect | null = null;
  private pendingNumberOffsetWidth = 0;
  private isNearViewport = true;
  private viewportObserver?: IntersectionObserver;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.animationsFinishAbort?.abort();
      this.viewportObserver?.disconnect();

      for (const animation of this.liveAnimations) {
        try {
          animation.cancel();
        } catch {
          /* Animation cancellation can throw AbortError in some browsers. */
        }
      }

      this.liveAnimations = [];
    });

    effect(() => {
      const value = this.value();
      const format = this.format();
      const locales = this.locales();
      const prefix = this.prefix();
      const suffix = this.suffix();

      if (!this.hasRenderedValue) {
        untracked(() => this.data.set(formatDigitRollerValue(value, format, locales, prefix, suffix)));
        this.prevNumericValue = value;
        this.hasRenderedValue = true;
        return;
      }

      const canAnimateThisUpdate =
        isPlatformBrowser(this.platformId) && this.animated() && this.canAnimateNow();

      if (canAnimateThisUpdate) {
        const handledByGroup = this.group?.requestGroupedUpdate(this, () => {
          untracked(() => this.data.set(formatDigitRollerValue(value, format, locales, prefix, suffix)));
        });

        if (handledByGroup) {
          return;
        }

        this.snapshot();
        untracked(() => this.data.set(formatDigitRollerValue(value, format, locales, prefix, suffix)));
        this.pending = true;
      } else {
        untracked(() => this.data.set(formatDigitRollerValue(value, format, locales, prefix, suffix)));
        this.prevNumericValue = value;
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      if (typeof IntersectionObserver !== 'undefined') {
        this.viewportObserver = new IntersectionObserver(
          (entries) => {
            this.isNearViewport = entries[entries.length - 1].isIntersecting;
          },
          { rootMargin: '240px' },
        );
        this.viewportObserver.observe(this.elementRef.nativeElement);
      }

      afterEveryRender({
        earlyRead: () => {
          if (this.pending) {
            this.readAnimationState();
          }
        },
        write: () => {
          if (this.pending) {
            this.pending = false;
            this.fireAnimations();
          }
        },
      });
    }
  }

  canGroupAnimateNow(): boolean {
    return isPlatformBrowser(this.platformId) && this.animated() && this.canAnimateNow();
  }

  prepareGroupedUpdate(): void {
    this.snapshot();
  }

  queueGroupedAnimation(): void {
    this.pending = true;
  }

  private snapshot(): void {
    const host = this.elementRef.nativeElement;
    this.prevRects.clear();
    this.prevInnerHTML.clear();
    this.prevDigitD.clear();
    this.prevDigitCurrent.clear();
    this.prevDigitValues.clear();
    this.prevDigitOrder = [];

    const number = host.querySelector<HTMLElement>('.ngs-digit-roller__number');
    if (number) {
      const numberRect = number.getBoundingClientRect();
      this.prevNumberLeft = numberRect.left;
      this.prevNumberWidth = numberRect.width;
    }

    untracked(() => {
      [...this.data().integer, ...this.data().fraction].forEach((part) => {
        if (part.type === 'integer' || part.type === 'fraction') {
          this.prevDigitValues.set(part.key, this.getPartDigitValue(part));
          this.prevDigitOrder.push(part.key);
        }
      });
    });

    host.querySelectorAll<HTMLElement>('[data-key]').forEach((element) => {
      const key = element.getAttribute('data-key')!;
      this.prevRects.set(key, element.getBoundingClientRect());
      this.prevInnerHTML.set(key, element.innerHTML);

      if (element.classList.contains('ngs-digit-roller__digit')) {
        const styles = getComputedStyle(element);
        this.prevDigitD.set(key, styles.getPropertyValue('--_ngs-digit-roller-d').trim() || '0');
        this.prevDigitCurrent.set(
          key,
          (element.style.getPropertyValue('--_ngs-digit-roller-current') || '0').trim(),
        );
      }
    });
  }

  private readAnimationState(): void {
    if (this.destroyed || !this.canAnimateNow()) {
      this.pendingCanAnimate = false;
      return;
    }

    this.pendingCanAnimate = true;
    const host = this.elementRef.nativeElement;
    const hostStyles = getComputedStyle(host);

    this.pendingHostFont = hostStyles.font;
    this.pendingHostColor = hostStyles.color;
    this.pendingKeyedEls = [];

    host.querySelectorAll<HTMLElement>('[data-key]').forEach((element) => {
      this.pendingKeyedEls.push({
        el: element,
        key: element.getAttribute('data-key')!,
        newRect: element.getBoundingClientRect(),
      });
    });

    const number = host.querySelector<HTMLElement>('.ngs-digit-roller__number');
    this.pendingNumberRect = number ? number.getBoundingClientRect() : null;
    this.pendingNumberOffsetWidth = number ? number.offsetWidth : 0;
  }

  private fireAnimations(): void {
    if (this.destroyed) {
      return;
    }

    const host = this.elementRef.nativeElement;
    const newNumericValue = untracked(() => this.value());

    if (!this.pendingCanAnimate) {
      this.prevNumericValue = newNumericValue;
      return;
    }

    const settings = this.effectiveSettings();
    const duration = settings.duration;
    const opacityDuration = settings.opacityDuration;
    const trend = this.resolveTrend(this.prevNumericValue, newNumericValue);
    const staggerMs = this.stagger();

    const baseTransformTiming = settings.transformTiming ?? {
      duration,
      easing: settings.flipEasing,
    };
    const spinOptions: KeyframeAnimationOptions = {
      ...baseTransformTiming,
      easing: settings.spinEasing,
      ...(settings.spinTiming ?? {}),
      duration: settings.spinTiming?.duration ?? baseTransformTiming.duration,
      fill: 'none',
      composite: 'accumulate',
    };
    const flipOptions: KeyframeAnimationOptions = {
      ...baseTransformTiming,
      duration: baseTransformTiming.duration,
      fill: 'none',
      composite: 'accumulate',
    };
    const fadeOptions: KeyframeAnimationOptions = {
      duration: opacityDuration,
      easing: 'ease-out',
      fill: 'none',
      composite: 'accumulate',
      ...(settings.opacityTiming ?? {}),
    };

    const continuousStartPosition =
      this.continuous() && duration > 0 && trend !== 0 ? this.getContinuousStartPosition() : undefined;

    const batch: Animation[] = [];
    const newKeys = new Set<string>();
    let elementIndex = 0;
    const number = host.querySelector<HTMLElement>('.ngs-digit-roller__number');

    for (const { el, key, newRect } of this.pendingKeyedEls) {
      newKeys.add(key);
      const prevRect = this.prevRects.get(key);
      const staggerDelay = staggerMs > 0 ? elementIndex * staggerMs : 0;
      elementIndex++;

      if (el.classList.contains('ngs-digit-roller__digit')) {
        const digit = this.getDigitValue(key);
        const fromDigit = this.prevDigitValues.has(key) ? this.prevDigitValues.get(key)! : 0;
        const rawDelta = this.getTrendDelta(fromDigit, digit, trend, this.getDigitLength(key));
        const digitPosition = this.getDigitPosition(key);
        const isLowerUnchanged =
          this.continuous() &&
          rawDelta === 0 &&
          continuousStartPosition !== undefined &&
          digitPosition !== undefined &&
          continuousStartPosition >= digitPosition;
        const delta = isLowerUnchanged ? this.getDigitLength(key) * trend : rawDelta;

        if (delta !== 0 && duration > 0) {
          this.incrementSpin(el);
          const animation = el.animate(
            { '--_ngs-digit-roller-d': [-delta, 0] } as PropertyIndexedKeyframes,
            spinOptions,
          );
          batch.push(animation);
          animation.finished.then(() => this.decrementSpin(el)).catch(() => this.decrementSpin(el));
        }

        this.animatePositionOrFade(el, prevRect, newRect, flipOptions, fadeOptions, staggerDelay, batch);
      } else {
        this.animatePositionOrFade(el, prevRect, newRect, flipOptions, fadeOptions, staggerDelay, batch);
      }
    }

    let exitIndex = 0;
    this.prevRects.forEach((rect, key) => {
      if (newKeys.has(key)) {
        return;
      }

      const ghost = this.buildGhost(key, rect, this.pendingHostFont, this.pendingHostColor);
      host.appendChild(ghost);
      ghost.style.setProperty('--_ngs-digit-roller-d-opacity', '-0.999');

      const staggerDelay = staggerMs > 0 ? exitIndex * staggerMs : 0;
      exitIndex++;

      const animation = ghost.animate(
        { '--_ngs-digit-roller-d-opacity': [0.999, 0] } as PropertyIndexedKeyframes,
        this.addStaggerDelay(fadeOptions, staggerDelay),
      );
      batch.push(animation);
      animation.finished.then(() => ghost.remove()).catch(() => ghost.remove());
    });

    if (number && this.pendingNumberRect) {
      const rect = this.pendingNumberRect;
      const dx = this.prevNumberLeft - rect.left;
      const width = rect.width || this.pendingNumberOffsetWidth;
      const dWidth = this.prevNumberWidth - width;

      number.style.setProperty('--_ngs-digit-roller-width', String(width || this.prevNumberWidth || 1));

      if (Math.abs(dx) > 0.5 || Math.abs(dWidth) > 0.5) {
        batch.push(
          number.animate(
            {
              '--_ngs-digit-roller-dx': [`${dx}px`, '0px'],
              '--_ngs-digit-roller-d-width': [dWidth, 0],
            } as PropertyIndexedKeyframes,
            flipOptions,
          ),
        );
      }
    }

    if (duration > 0) {
      const colorIncrease = this.colorOnIncrease();
      const colorDecrease = this.colorOnDecrease();

      if (trend > 0 && colorIncrease) {
        batch.push(
          host.animate([{ color: colorIncrease }, { color: '' }], {
            duration: Math.max(duration, 400),
            easing: 'ease-out',
            fill: 'none',
          }),
        );
      } else if (trend < 0 && colorDecrease) {
        batch.push(
          host.animate([{ color: colorDecrease }, { color: '' }], {
            duration: Math.max(duration, 400),
            easing: 'ease-out',
            fill: 'none',
          }),
        );
      }
    }

    this.prevNumericValue = newNumericValue;

    if (batch.length === 0) {
      return;
    }

    this.liveAnimations.push(...batch);
    this.animCount++;

    if (this.animationsFinishAbort) {
      this.animationsFinishAbort.abort();
    } else {
      this.animationsStart.emit();
    }

    const finishController = new AbortController();
    this.animationsFinishAbort = finishController;

    Promise.allSettled(batch.map((animation) => animation.finished)).then(() => {
      const batchSet = new Set(batch);
      this.liveAnimations = this.liveAnimations.filter((animation) => !batchSet.has(animation));
      this.animCount--;

      if (this.animCount === 0 && !this.destroyed && this.animationsFinishAbort) {
        this.animationsFinish.emit();
        this.animationsFinishAbort = undefined;
      }
    });
  }

  private animatePositionOrFade(
    element: HTMLElement,
    prevRect: DOMRect | undefined,
    newRect: DOMRect,
    flipOptions: KeyframeAnimationOptions,
    fadeOptions: KeyframeAnimationOptions,
    staggerDelay: number,
    batch: Animation[],
  ): void {
    if (prevRect) {
      const dx = prevRect.left - newRect.left;

      if (Math.abs(dx) > 0.5) {
        batch.push(
          element.animate(
            [{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }],
            flipOptions,
          ),
        );
      }
    } else {
      batch.push(
        element.animate(
          { '--_ngs-digit-roller-d-opacity': [-0.9999, 0] } as PropertyIndexedKeyframes,
          this.addStaggerDelay(fadeOptions, staggerDelay),
        ),
      );
    }
  }

  private getDigitValue(key: string): number {
    const part = [...this.data().integer, ...this.data().fraction].find((item) => item.key === key);
    return part ? this.getPartDigitValue(part) : 0;
  }

  private getPartDigitValue(part: { value: string; numericValue?: number }): number {
    return part.numericValue ?? Number(part.value);
  }

  private resolveTrend(oldValue: number, newValue: number): number {
    const configured = this.trend();
    const trend =
      typeof configured === 'function'
        ? configured(oldValue, newValue)
        : (configured ?? Math.sign(newValue - oldValue));
    return Math.sign(trend);
  }

  private canAnimateNow(): boolean {
    const host = this.elementRef.nativeElement;

    return (
      canAnimateDigitRoller({ respectMotionPreference: this.respectMotionPreference() }) &&
      this.animated() &&
      host.ownerDocument.visibilityState === 'visible' &&
      this.isHostNearViewport(host)
    );
  }

  private isHostNearViewport(host: HTMLElement): boolean {
    if (this.viewportObserver) {
      return this.isNearViewport;
    }

    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    const windowRef = host.ownerDocument.defaultView;
    if (!windowRef) {
      return true;
    }

    const margin = 240;
    return (
      rect.bottom >= -margin &&
      rect.right >= -margin &&
      rect.top <= windowRef.innerHeight + margin &&
      rect.left <= windowRef.innerWidth + margin
    );
  }

  private resolveEasing(easing: DigitRollerEasing | undefined): string {
    return easing ? (EASING_PRESETS[easing] ?? easing) : SPIN_EASING;
  }

  private getContinuousStartPosition(): number | undefined {
    const current = new Map<string, number>();
    const currentOrder: string[] = [];

    untracked(() => {
      [...this.data().integer, ...this.data().fraction].forEach((part) => {
        if (part.type === 'integer' || part.type === 'fraction') {
          current.set(part.key, this.getPartDigitValue(part));
          currentOrder.push(part.key);
        }
      });
    });

    const firstChangedPrev = this.prevDigitOrder.find(
      (key) => current.get(key) !== this.prevDigitValues.get(key),
    );
    const firstChangedCurrent = currentOrder.find(
      (key) => current.get(key) !== this.prevDigitValues.get(key),
    );
    const start = Math.max(
      this.getDigitPosition(firstChangedPrev) ?? -Infinity,
      this.getDigitPosition(firstChangedCurrent) ?? -Infinity,
    );

    return Number.isFinite(start) ? start : undefined;
  }

  private getDigitPosition(key?: string): number | undefined {
    if (!key) {
      return undefined;
    }

    if (key.startsWith('i')) {
      return Number(key.slice(1));
    }

    if (key.startsWith('f')) {
      return -Number(key.slice(1));
    }

    return undefined;
  }

  private getDigitLength(key: string): number {
    if (!key.startsWith('i')) {
      return 10;
    }

    const position = Number(key.slice(1));
    const max = this.digits()[position]?.max;
    return max !== undefined ? max + 1 : 10;
  }

  protected digitLengthForKey(key: string): number {
    return this.getDigitLength(key);
  }

  protected digitGlyphsForKey(key: string): { value: number; glyph: string }[] {
    return this.digitGlyphs().slice(0, this.getDigitLength(key));
  }

  private addStaggerDelay(
    options: KeyframeAnimationOptions,
    staggerDelay: number,
  ): KeyframeAnimationOptions {
    const currentDelay = typeof options.delay === 'number' ? options.delay : 0;
    return { ...options, delay: currentDelay + staggerDelay };
  }

  private getTrendDelta(from: number, to: number, trend: number, length = 10): number {
    const diff = to - from;
    const resolvedTrend = trend || Math.sign(diff);

    if (resolvedTrend > 0 && to < from) {
      return length - from + to;
    }

    if (resolvedTrend < 0 && to > from) {
      return to - length - from;
    }

    return diff;
  }

  private incrementSpin(element: HTMLElement): void {
    const count = (this.spinCount.get(element) ?? 0) + 1;
    this.spinCount.set(element, count);

    if (count === 1) {
      element.classList.add('ngs-digit-roller__digit--spinning');
    }
  }

  private decrementSpin(element: HTMLElement): void {
    const count = Math.max(0, (this.spinCount.get(element) ?? 1) - 1);

    if (count === 0) {
      this.spinCount.delete(element);
      element.classList.remove('ngs-digit-roller__digit--spinning');
    } else {
      this.spinCount.set(element, count);
    }
  }

  private buildGhost(key: string, rect: DOMRect, font: string, color: string): HTMLElement {
    const ghost = document.createElement('span');
    ghost.style.cssText =
      `position:fixed;left:${rect.left}px;top:${rect.top}px;` +
      `width:${rect.width}px;height:${rect.height}px;` +
      `pointer-events:none;overflow:hidden;display:inline-flex;` +
      `align-items:center;font:${font};color:${color}`;
    ghost.className = 'ngs-digit-roller__ghost';

    const savedHTML = this.prevInnerHTML.get(key);
    if (savedHTML) {
      ghost.innerHTML = savedHTML;

      const savedD = this.prevDigitD.get(key);
      const savedCurrent = this.prevDigitCurrent.get(key);

      if (savedD !== undefined) {
        ghost.style.setProperty('--_ngs-digit-roller-d', savedD);
      }

      if (savedCurrent !== undefined) {
        ghost.style.setProperty('--_ngs-digit-roller-current', savedCurrent);
      }

      ghost.querySelectorAll<HTMLElement>('[inert]').forEach((element) => {
        element.style.display = 'none';
      });
    }

    return ghost;
  }
}
