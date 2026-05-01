import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  OnDestroy,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TabLink } from '../tab-link/tab-link';
import { TabNavPanel } from '../tab-nav-panel/tab-nav-panel';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-tab-nav-bar, [ngs-tab-nav-bar]',
  exportAs: 'ngsTabNavBar',
  templateUrl: './tab-nav-bar.html',
  styleUrl: './tab-nav-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-tab-nav-bar'
  }
})
export class TabNavBar implements AfterViewInit, OnDestroy, OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  private currentUrl = signal<string>(isPlatformBrowser(inject(PLATFORM_ID)) ? inject(Router).url : '');
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  // Projected links
  _links = contentChildren(TabLink);

  // Scrolling container references
  _tabListContainer = viewChild<ElementRef<HTMLElement>>('tabListContainer');
  _tabList = viewChild<ElementRef<HTMLElement>>('tabList');

  // Pagination state
  _showPaginationControls = signal(false);
  _disableScrollBefore = signal(true);
  _disableScrollAfter = signal(true);

  // External bindings
  tabPanel = input<TabNavPanel | null>(null);
  disableRipple = input(false);

  activator = input<(link: TabLink) => boolean>();

  readonly isActiveFn = computed(() => (link: TabLink): boolean => {
    const activatorFn = this.activator();
    if (activatorFn) {
      return activatorFn(link);
    }
    return this.defaultIsActive(link);
  });

  private _resizeObserver: ResizeObserver | null = null;
  private _resizeSubscription = Subscription.EMPTY;

  private defaultIsActive(link: TabLink): boolean {
    const el = link.elementRef.nativeElement;
    // @ts-ignore
    const routerLink = link['_routerLink'] as RouterLink | null;
    let href = '';
    if (routerLink) {
      href = this._router.serializeUrl(routerLink.urlTree);
    } else {
      href = el.getAttribute('href') || '';
    }

    if (!href || href === '#') {
      return false;
    }
    try {
      const linkPath = new URL(href, window.location.origin).pathname;
      const currentPath = new URL(this.currentUrl(), window.location.origin).pathname;
      return currentPath === linkPath;
    } catch {
      return false;
    }
  }

  constructor() {
    // Update pagination when links change (signal-based)
    effect(() => {
      // Track the projected links array reactively
      this._links();

      // Trigger re-evaluation of currentUrl to ensure links react to projection
      this.currentUrl.set(this._router.url);

      Promise.resolve().then(() => {
        this._updatePagination();
        this._cdr.markForCheck();
      });

      // Fallback: double check after a small delay to ensure routerLink has updated its urlTree
      setTimeout(() => {
        this.currentUrl.set(this._router.url);
        this._cdr.markForCheck();
      }, 0);
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl.set(this._router.url);
      this._router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      ).subscribe(() => {
        this.currentUrl.set(this._router.url);
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Fallback: listen to container resize
      const container = this._tabListContainer()?.nativeElement;
      if (container && 'ResizeObserver' in window) {
        this._resizeObserver = new ResizeObserver(() => this._updatePagination());
        this._resizeObserver.observe(container);
      } else if (container) {
        this._resizeSubscription = fromEvent(window, 'resize')
          .pipe(debounceTime(100))
          .subscribe(() => this._updatePagination());
      }
    }

    this._updatePagination();
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._resizeSubscription.unsubscribe();
  }

  _handleScroll() {
    this._updateScrollButtonsState();
  }

  _scrollBefore() {
    const container = this._tabListContainer()?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
  }

  _scrollAfter() {
    const container = this._tabListContainer()?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
  }

  private _updatePagination() {
    const container = this._tabListContainer()?.nativeElement;
    const list = this._tabList()?.nativeElement;
    if (!container || !list) return;

    const show = list.scrollWidth > container.clientWidth + 1;
    this._showPaginationControls.set(show);
    this._updateScrollButtonsState();
  }

  private _updateScrollButtonsState() {
    const container = this._tabListContainer()?.nativeElement;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    this._disableScrollBefore.set(container.scrollLeft <= 0);
    this._disableScrollAfter.set(container.scrollLeft >= maxScroll);
  }
}
