import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChildren,
  ElementRef,
  OnDestroy,
  input,
  viewChildren,
  ViewContainerRef,
  inject,
  numberAttribute,
  viewChild,
  AfterViewInit,
  effect,
  PLATFORM_ID,
  output, signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Tab } from '../tab/tab';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { Ripple } from '@ngstarter/components/core';
import { Subscription, fromEvent, debounceTime } from 'rxjs';

export interface TabChangeEvent {
  index: number;
  tab: Tab;
}

@Component({
  selector: 'ngs-tab-group',
  standalone: true,
  imports: [CommonModule, PortalModule, Ripple],
  templateUrl: './tab-group.html',
  styleUrl: './tab-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-tab-group',
    '[class.ngs-tab-group-inverted]': 'headerPosition() === "below"',
    '[style.--ngs-tab-group-animation-duration]': 'animationDuration()',
  }
})
export class TabGroup implements AfterViewInit, OnDestroy {
  private _viewContainerRef = inject(ViewContainerRef);
  private _cdr = inject(ChangeDetectorRef);
  private _platformId = inject(PLATFORM_ID);
  private _tabsSubscription = Subscription.EMPTY;
  private _resizeSubscription = Subscription.EMPTY;
  private _resizeObserver: ResizeObserver | null = null;

  _tabs = contentChildren(Tab);
  _tabLabels = viewChildren<ElementRef>('tabLabel');

  _tabListContainer = viewChild<ElementRef>('tabListContainer');
  _tabList = viewChild<ElementRef>('tabList');

  _showPaginationControls = signal(false);
  _disableScrollBefore = signal(true);
  _disableScrollAfter = signal(true);

  selectedIndex = input(0, {
    transform: numberAttribute
  });

  headerPosition = input<'above' | 'below'>('above');
  preserveContent = input(false, { transform: booleanAttribute });
  stretchTabs = input(true, {
    alias: 'ngs-stretch-tabs',
    transform: booleanAttribute
  });
  alignTabs = input<'start' | 'center' | 'end'>('start', {
    alias: 'ngs-align-tabs'
  });
  disableRipple = input(false, { transform: booleanAttribute });

  animationDuration = input('500ms', {
    transform: (value: string | number) => {
      return /^\d+$/.test(value + '') ? value + 'ms' : value + '';
    }
  });

  enterAnimation = input('', { alias: 'animate.enter' });
  leaveAnimation = input('', { alias: 'animate.leave' });

  selectedIndexChange = output<number>();
  selectedTabChange = output<TabChangeEvent>();
  focusChange = output<TabChangeEvent>();

  _isActive: { [key: number]: boolean } = {};
  protected _selectedIndex = 0;
  private _prevIndex = 0;
  private _isInitialized = false;

  constructor() {
    this._selectedIndex = this.selectedIndex();
    this._prevIndex = this._selectedIndex;
    this._isActive[this._selectedIndex] = true;
    effect((onCleanup) => {
      const selectedIndex = this.selectedIndex();

      if (this._selectedIndex !== selectedIndex) {
        this._prevIndex = this._selectedIndex;
        this._isActive[this._prevIndex] = true;
        this._selectedIndex = selectedIndex;
        this._isActive[this._selectedIndex] = true;
        this._cdr.markForCheck();

        const prevIndex = this._prevIndex;
        const timeout = setTimeout(() => {
          delete this._isActive[prevIndex];
          this._cdr.markForCheck();
        }, parseInt(this.animationDuration()));
        onCleanup(() => clearTimeout(timeout));
      }

      setTimeout(() => {
        if (this._isInitialized) {
          this._scrollToTab(this._selectedIndex);
        }
        this._updatePagination();
      });
    });

    this._tabsSubscription = toObservable(this._tabs).subscribe(() => {
      this._clampIndex();
      this._cdr.markForCheck();
      setTimeout(() => {
        this._updatePagination();
      });
    });

    effect(() => {
      this._tabs();
      setTimeout(() => {
        this._updatePagination();
      });
    });
  }

  ngAfterViewInit() {
    this._isInitialized = true;
    if (isPlatformBrowser(this._platformId)) {
      this._resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => {
          this._updatePagination();
        });

      this._resizeObserver = new ResizeObserver(() => {
        this._updatePagination();
      });
      this._resizeObserver.observe(this._tabListContainer()?.nativeElement);
      this._resizeObserver.observe(this._tabList()?.nativeElement);
    }

    setTimeout(() => {
      this._updatePagination();
    });
  }

  ngOnDestroy() {
    this._tabsSubscription.unsubscribe();
    this._resizeSubscription.unsubscribe();
    this._resizeObserver?.disconnect();
  }

  protected _clampIndex() {
    if (this._tabs().length === 0) {
      this._selectedIndex = 0;
      return;
    }
    this._selectedIndex = Math.max(0, Math.min(this._selectedIndex, this._tabs().length - 1));
  }

  _updatePagination() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const containerEl = this._tabListContainer()?.nativeElement;
    const listEl = this._tabList()?.nativeElement;

    if (containerEl && listEl) {
      const showPaginationControls = listEl.scrollWidth > containerEl.clientWidth;

      if (showPaginationControls !== this._showPaginationControls()) {
        this._showPaginationControls.set(showPaginationControls);
        this._cdr.detectChanges();
      }

      this._updateScrollButtonsState();
    }
  }

  _updateScrollButtonsState() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const containerEl = this._tabListContainer()?.nativeElement;

    if (containerEl) {
      const scrollLeft = containerEl.scrollLeft;
      const disableScrollBefore = scrollLeft <= 0;
      const disableScrollAfter = Math.ceil(scrollLeft + containerEl.clientWidth) >= containerEl.scrollWidth;

      if (disableScrollBefore !== this._disableScrollBefore() || disableScrollAfter !== this._disableScrollAfter()) {
        this._disableScrollBefore.set(disableScrollBefore);
        this._disableScrollAfter.set(disableScrollAfter);
        this._cdr.detectChanges();
      }
    }
  }

  private _scrollToTab(index: number) {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const labels = this._tabLabels();
    const containerEl = this._tabListContainer()?.nativeElement;

    if (labels[index] && containerEl) {
      const labelEl = labels[index].nativeElement;
      const containerRect = containerEl.getBoundingClientRect();
      const labelRect = labelEl.getBoundingClientRect();

      if (labelRect.left < containerRect.left) {
        containerEl.scrollBy({ left: labelRect.left - containerRect.left, behavior: 'smooth' });
      } else if (labelRect.right > containerRect.right) {
        containerEl.scrollBy({ left: labelRect.right - containerRect.right, behavior: 'smooth' });
      }
    }
  }

  _scrollBefore() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const containerEl = this._tabListContainer()?.nativeElement;

    if (containerEl) {
      containerEl.scrollBy({ left: -containerEl.clientWidth / 2, behavior: 'smooth' });
    }
  }

  _scrollAfter() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    const containerEl = this._tabListContainer()?.nativeElement;

    if (containerEl) {
      containerEl.scrollBy({ left: containerEl.clientWidth / 2, behavior: 'smooth' });
    }
  }

  _handleScroll() {
    this._updateScrollButtonsState();
  }

  _onTabHeaderClick(index: number) {
    const tabs = this._tabs();
    const labels = this._tabLabels();

    if (tabs[index].disabled() || this._selectedIndex === index) {
      return;
    }

    this._prevIndex = this._selectedIndex;
    this._selectedIndex = index;
    this._isActive[this._prevIndex] = true;
    this._isActive[this._selectedIndex] = true;
    this.selectedIndexChange.emit(index);
    this.selectedTabChange.emit({
      index,
      tab: tabs[index]
    });
    this._cdr.markForCheck();

    const prevIndex = this._prevIndex;
    setTimeout(() => {
      delete this._isActive[prevIndex];
      this._cdr.markForCheck();
    }, parseInt(this.animationDuration()));

    if (labels[index]) {
      this._scrollToTab(index);
    }
  }

  _getTabContent(tab: Tab) {
    return tab._prepareContent(this._viewContainerRef);
  }

  _getEnterAnimation(index: number): string {
    let direction = '';
    const selectedIndex = this._selectedIndex;

    if (this._prevIndex > selectedIndex) {
      direction = 'left';
    } else if (this._prevIndex < selectedIndex) {
      direction = 'right';
    }

    if (this.enterAnimation()) {
      return this.enterAnimation();
    }

    if (direction === '' || index !== selectedIndex) {
      return '';
    }

    // If moving right (prev < current), the new tab should slide in from the RIGHT
    return `ngs-tab-group-enter-${direction}`;
  }

  _getLeaveAnimation(index: number): string {
    let direction = '';
    const selectedIndex = this._selectedIndex;

    if (this._prevIndex > selectedIndex) {
      direction = 'left';
    } else if (this._prevIndex < selectedIndex) {
      direction = 'right';
    }

    if (this.leaveAnimation()) {
      return this.leaveAnimation();
    }

    if (direction === '' || index !== this._prevIndex || index === selectedIndex) {
      return '';
    }

    // If moving right (prev < current), the old tab should slide out to the LEFT
    const leaveDirection = direction === 'right' ? 'left' : 'right';
    return `ngs-tab-group-leave-${leaveDirection}`;
  }

  _onKeydown(event: KeyboardEvent) {
    const tabs = this._tabs();
    const labels = this._tabLabels();

    let newIndex = this._selectedIndex;
    if (event.key === 'ArrowRight') {
      newIndex = (this._selectedIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      newIndex = (this._selectedIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      newIndex = 0;
    } else if (event.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    // Skip disabled tabs
    const direction = (newIndex >= this._selectedIndex) ? 1 : -1;
    const startIndex = newIndex;
    while (tabs[newIndex].disabled()) {
      newIndex = (newIndex + direction + tabs.length) % tabs.length;
      if (newIndex === startIndex) break; // All tabs disabled or looped back
    }

    if (newIndex !== this._selectedIndex && !tabs[newIndex].disabled()) {
      this._prevIndex = this._selectedIndex;
      this._selectedIndex = newIndex;
      this._isActive[this._prevIndex] = true;
      this._isActive[this._selectedIndex] = true;
      this.selectedIndexChange.emit(newIndex);
      this.selectedTabChange.emit({
        index: newIndex,
        tab: tabs[newIndex]
      });
      this._cdr.markForCheck();

      const prevIndex = this._prevIndex;
      setTimeout(() => {
        delete this._isActive[prevIndex];
        this._cdr.markForCheck();
      }, parseInt(this.animationDuration()));

      if (isPlatformBrowser(this._platformId)) {
        labels[newIndex].nativeElement.focus({ preventScroll: true });
        this._scrollToTab(newIndex);
      }
    }
  }
}
