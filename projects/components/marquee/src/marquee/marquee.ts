import {
  Component,
  ElementRef,
  input,
  viewChild,
  AfterViewInit,
  inject,
  PLATFORM_ID,
  booleanAttribute,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'ngs-marquee',
  exportAs: 'ngsMarquee',
  templateUrl: './marquee.html',
  styleUrl: './marquee.scss',
  host: {
    'class': 'ngs-marquee'
  }
})
export class Marquee implements AfterViewInit, OnChanges, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _platformId = inject(PLATFORM_ID);
  private _intersectionObserver?: IntersectionObserver;
  private _resizeObserver?: ResizeObserver;
  private _mutationObserver?: MutationObserver;
  private _measureFrame = 0;

  reverse = input(false, {
    transform: booleanAttribute
  });
  pauseOnHover = input(false, {
    transform: booleanAttribute
  });

  protected isInView = false;

  readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  readonly sourceItem = viewChild.required<ElementRef<HTMLElement>>('sourceItem');

  protected get nativeElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reverse']) {
      this.nativeElement.style.setProperty('--ngs-marquee-reverse', changes['reverse'].currentValue ? 'reverse' : '');
    }

    if (changes['pauseOnHover']) {
      this.nativeElement.style.setProperty('--ngs-marquee-pause', changes['pauseOnHover'].currentValue ? 'paused' : 'running');
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    this._intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!this.isInView) {
          this.isInView = true;
        }
      } else if (this.isInView) {
        this.isInView = false;
      }
    });
    this._intersectionObserver.observe(this.nativeElement);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._queueRepeatMeasure();
      });
      this._resizeObserver.observe(this.nativeElement);
      this._resizeObserver.observe(this.sourceItem().nativeElement);
    }

    if (typeof MutationObserver !== 'undefined') {
      this._mutationObserver = new MutationObserver(() => {
        this._queueRepeatMeasure();
      });
      this._mutationObserver.observe(this.sourceItem().nativeElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
      });
    }

    this._queueRepeatMeasure();
  }

  ngOnDestroy(): void {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }

    if (this._measureFrame) {
      cancelAnimationFrame(this._measureFrame);
    }
  }

  private _queueRepeatMeasure(): void {
    if (this._measureFrame) {
      cancelAnimationFrame(this._measureFrame);
    }

    this._measureFrame = requestAnimationFrame(() => {
      this._measureFrame = 0;
      this._syncRepeatItems();
    });
  }

  private _syncRepeatItems(): void {
    const viewport = this.nativeElement.querySelector<HTMLElement>('.content');
    const item = this.sourceItem().nativeElement;

    if (!viewport) {
      return;
    }

    const viewportWidth = viewport.getBoundingClientRect().width;
    const itemWidth = item.getBoundingClientRect().width;

    if (viewportWidth <= 0 || itemWidth <= 0) {
      return;
    }

    const repeatGap = Math.max(0, viewportWidth - itemWidth);

    this.nativeElement.style.setProperty('--ngs-marquee-item-width', `${itemWidth}px`);
    this.nativeElement.style.setProperty('--ngs-marquee-repeat-gap', `${repeatGap}px`);
    this._renderClone();
  }

  private _renderClone(): void {
    const track = this.track().nativeElement;
    const sourceItem = this.sourceItem().nativeElement;

    track.querySelectorAll('[data-ngs-marquee-clone]').forEach(clone => clone.remove());

    track.appendChild(this._createItemClone(sourceItem));
  }

  private _createItemClone(sourceItem: HTMLElement): HTMLElement {
    const clone = sourceItem.cloneNode(true) as HTMLElement;

    clone.dataset['ngsMarqueeClone'] = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');

    return clone;
  }
}
