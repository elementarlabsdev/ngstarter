import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  PLATFORM_ID,
  contentChildren,
  DOCUMENT
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SCROLL_SPY_NAV } from '../types';
import { ScrollSpyOn } from '../scroll-spy-on/scroll-spy-on';
import { LAYOUT_CONTENT } from '@ngstarter-ui/components/layout';
import { PANEL_CONTENT } from '@ngstarter-ui/components/panel';

@Component({
  selector: 'ngs-scroll-spy-nav,[ngs-scroll-spy-nav]',
  exportAs: 'ngsScrollSpyNav',
  templateUrl: './scroll-spy-nav.html',
  styleUrl: './scroll-spy-nav.scss',
  providers: [
    {
      provide: SCROLL_SPY_NAV,
      useExisting: ScrollSpyNav
    }
  ],
  host: {
    'class': 'ngs-scroll-spy-nav'
  }
})
export class ScrollSpyNav implements AfterContentInit {
  private document = inject(DOCUMENT);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private panelBody = inject(PANEL_CONTENT, { optional: true });
  private layoutBody = inject(LAYOUT_CONTENT, { optional: true });

  readonly _items = contentChildren(ScrollSpyOn);

  private threshold = 10;
  protected _activeId: string;
  private scrollContainer: HTMLElement;
  private isDocumentScrollContainer = false;

  ngAfterContentInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.scrollContainer = this._getScrollContainer();
    const scrollEventTarget = this._getScrollEventTarget();

    if (this.scrollContainer) {
      this.zone.runOutsideAngular(() => {
        fromEvent(scrollEventTarget, 'scroll')
          .pipe(
            debounceTime(35),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            this._findActiveItem();
          })
        ;
      });
      setTimeout(() => {
        this._findActiveItem();
      }, 10);
    }
  }

  get activeId(): string {
    return this._activeId;
  }

  scrollTo(targetId: string) {
    if (!this.scrollContainer) {
      return;
    }

    const targetElement = this.document.querySelector('#' + targetId) as HTMLElement;

    if (!targetElement) {
      return;
    }

    this._activeId = targetId;
    const targetTop = this._getTargetScrollTop(targetElement);

    this.cdr.detectChanges();
    this.scrollContainer.scroll({
      top: targetTop,
      left: 0,
      behavior: 'smooth'
    });
  }

  private _findActiveItem() {
    let activeId: string | undefined;
    let nextId: string | undefined;
    let nextDistance = Number.POSITIVE_INFINITY;

    for (let item of this._items()) {
      const targetElement = this.document.querySelector('#' + item.targetId()) as HTMLElement;

      if (targetElement) {
        const bounds = this._getTargetBounds(targetElement);

        if (bounds.top <= this.threshold && bounds.bottom > this.threshold) {
          activeId = item.targetId();
          continue;
        }

        if (!activeId && bounds.top > this.threshold && bounds.top < nextDistance) {
          nextId = item.targetId();
          nextDistance = bounds.top;
        }
      }
    }

    const nextActiveId = activeId ?? nextId;

    if (!nextActiveId || this._activeId === nextActiveId) {
      return;
    }

    this.zone.run(() => {
      this._activeId = nextActiveId;
      this.cdr.detectChanges();
    });
  }

  private _getScrollContainer(): HTMLElement {
    if (this.panelBody) {
      this.isDocumentScrollContainer = false;
      return this.panelBody.scrollContainer();
    }

    if (this.layoutBody) {
      this.isDocumentScrollContainer = false;
      return this.layoutBody.scrollContainer();
    }

    this.isDocumentScrollContainer = true;
    return (this.document.scrollingElement as HTMLElement | null) ??
      this.document.documentElement ??
      this.document.body
    ;
  }

  private _getScrollEventTarget(): EventTarget {
    if (this.isDocumentScrollContainer) {
      return this.document.defaultView ?? this.document;
    }

    return this.scrollContainer;
  }

  private _getTargetScrollTop(targetElement: HTMLElement): number {
    const targetBounds = this._getTargetBounds(targetElement);
    return this.scrollContainer.scrollTop + targetBounds.top - this.threshold;
  }

  private _getTargetBounds(targetElement: HTMLElement): Pick<DOMRect, 'top' | 'bottom'> {
    const targetRect = targetElement.getBoundingClientRect();

    if (this.isDocumentScrollContainer) {
      return {
        top: targetRect.top,
        bottom: targetRect.bottom
      };
    }

    const containerRect = this.scrollContainer.getBoundingClientRect();

    return {
      top: targetRect.top - containerRect.top,
      bottom: targetRect.bottom - containerRect.top
    };
  }
}
