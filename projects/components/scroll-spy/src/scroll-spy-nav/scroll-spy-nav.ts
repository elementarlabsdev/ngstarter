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
import { LAYOUT_CONTENT } from '@ngstarter/components/layout';
import { PANEL_CONTENT } from '@ngstarter/components/panel';

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

  ngAfterContentInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.panelBody) {
      this.scrollContainer = this.panelBody.scrollContainer();
    } else if (this.layoutBody) {
      this.scrollContainer = this.layoutBody.scrollContainer();
    } else {
      this.scrollContainer = this.document.body;
    }

    if (this.scrollContainer) {
      this.zone.runOutsideAngular(() => {
        fromEvent(this.scrollContainer, 'scroll')
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

    this._activeId = targetId;
    const targetElement = this.document.querySelector('#' + targetId) as HTMLElement;
    const offsetTopFix = parseInt(getComputedStyle(targetElement).marginTop) +
      parseInt(getComputedStyle(targetElement).height) + this.threshold
    ;
    this.cdr.detectChanges();
    this.scrollContainer.scroll({
      top: targetElement.offsetTop - offsetTopFix,
      left: 0,
      behavior: 'smooth'
    });
  }

  private _findActiveItem() {
    for (let item of this._items()) {
      const targetElement = this.document.querySelector('#' + item.targetId()) as HTMLElement;

      if (targetElement) {
        if (this._elementIsVisibleInViewport(this.scrollContainer, targetElement)) {
          if (this._activeId === item.targetId()) {
            return;
          }

          this.zone.run(() => {
            this._activeId = item.targetId();
            this.cdr.detectChanges();
          });
          break;
        }
      }
    }
  }

  private _elementIsVisibleInViewport(container: HTMLElement, targetEl: HTMLElement, partiallyVisible = false) {
    const { top, left, bottom, right } = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const innerWidth = containerRect.width;
    const innerHeight = containerRect.height;
    return partiallyVisible
      ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
      ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
      : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  }
}
