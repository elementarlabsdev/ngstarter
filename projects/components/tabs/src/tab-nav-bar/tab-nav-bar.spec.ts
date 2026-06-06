import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TabLink } from '../tab-link/tab-link';
import { TabNavPanel } from '../tab-nav-panel/tab-nav-panel';
import { TabNavBar } from './tab-nav-bar';

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

@Component({
  standalone: true,
  template: 'Route content',
})
class RouteTarget {}

@Component({
  standalone: true,
  imports: [RouterLink, TabLink, TabNavBar, TabNavPanel],
  template: `
    <ngs-tab-nav-panel #panel="ngsTabNavPanel">Panel content</ngs-tab-nav-panel>

    <nav
      ngs-tab-nav-bar
      [tabPanel]="panel"
      [disableRipple]="disableRipple()"
      [activator]="activator()"
    >
      <a ngs-tab-link routerLink="/overview">Overview</a>
      <a ngs-tab-link routerLink="/settings" [disabled]="settingsDisabled()">Settings</a>
      <a ngs-tab-link href="/external" [ngsRippleDisabled]="externalRippleDisabled()">External</a>
    </nav>
  `,
})
class RouterTabsHost {
  readonly disableRipple = signal(false);
  readonly settingsDisabled = signal(false);
  readonly externalRippleDisabled = signal(false);
  readonly activator = signal<((link: TabLink) => boolean) | undefined>(undefined);
}

@Component({
  standalone: true,
  imports: [TabLink, TabNavBar],
  template: `
    <nav ngs-tab-nav-bar>
      <a ngs-tab-link href="/one">One</a>
      <a ngs-tab-link href="/two">Two</a>
      <a ngs-tab-link href="/three">Three</a>
    </nav>
  `,
})
class PaginatedNavHost {}

@Component({
  standalone: true,
  imports: [TabLink],
  template: `<a ngs-tab-link href="/standalone">Standalone</a>`,
})
class StandaloneLinkHost {}

describe('TabNavBar', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('marks the router link matching the current route as active and wires aria-controls to the panel', async () => {
    const { fixture, router } = await createRouterFixture();

    await router.navigateByUrl('/overview');
    fixture.detectChanges();
    await settle(fixture);

    const links = tabLinks(fixture);
    const panel = hostElement(fixture).querySelector('ngs-tab-nav-panel') as HTMLElement;

    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(links[0].classList.contains('ngs-tab-link-active')).toBe(true);
    expect(links[0].getAttribute('aria-selected')).toBe('true');
    expect(links[0].getAttribute('aria-controls')).toBe(panel.id);
    expect(links[1].classList.contains('ngs-tab-link-active')).toBe(false);

    await router.navigateByUrl('/settings');
    fixture.detectChanges();
    await settle(fixture);

    expect(links[0].classList.contains('ngs-tab-link-active')).toBe(false);
    expect(links[0].getAttribute('aria-controls')).toBeNull();
    expect(links[1].classList.contains('ngs-tab-link-active')).toBe(true);
  });

  it('supports a custom activator function for active state', async () => {
    const { fixture } = await createRouterFixture();

    fixture.componentInstance.activator.set(link =>
      link.elementRef.nativeElement.textContent?.trim() === 'External'
    );
    fixture.detectChanges();
    await settle(fixture);

    const links = tabLinks(fixture);
    expect(links.map(link => link.classList.contains('ngs-tab-link-active'))).toEqual([false, false, true]);
    expect(links[2].getAttribute('aria-selected')).toBe('true');
  });

  it('sets disabled link semantics and prevents disabled link clicks', async () => {
    const { fixture } = await createRouterFixture();
    fixture.componentInstance.settingsDisabled.set(true);
    fixture.detectChanges();
    await settle(fixture);

    const settings = tabLinks(fixture)[1];
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    const dispatched = settings.dispatchEvent(click);

    expect(settings.classList.contains('ngs-tab-link-disabled')).toBe(true);
    expect(settings.getAttribute('aria-disabled')).toBe('true');
    expect(settings.getAttribute('tabindex')).toBe('-1');
    expect(click.defaultPrevented).toBe(true);
    expect(dispatched).toBe(false);
  });

  it('combines link, parent, and disabled ripple states', async () => {
    const { fixture } = await createRouterFixture();
    const links = tabLinkInstances(fixture);

    expect(links.map(link => link.ngsRippleDisabled)).toEqual([false, false, false]);

    fixture.componentInstance.externalRippleDisabled.set(true);
    fixture.detectChanges();
    expect(tabLinkInstances(fixture)[2].ngsRippleDisabled).toBe(true);

    fixture.componentInstance.disableRipple.set(true);
    fixture.detectChanges();
    expect(tabLinkInstances(fixture).map(link => link.ngsRippleDisabled)).toEqual([true, true, true]);

    fixture.componentInstance.disableRipple.set(false);
    fixture.componentInstance.settingsDisabled.set(true);
    fixture.detectChanges();
    expect(tabLinkInstances(fixture)[1].ngsRippleDisabled).toBe(true);
  });

  it('renders inactive standalone tab links without requiring a parent nav bar', async () => {
    await TestBed.configureTestingModule({
      imports: [StandaloneLinkHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(StandaloneLinkHost);
    fixture.detectChanges();

    const link = tabLinks(fixture)[0];
    expect(link.classList.contains('ngs-tab-link-active')).toBe(false);
    expect(link.getAttribute('aria-selected')).toBe('false');
    expect(link.getAttribute('aria-controls')).toBeNull();
  });

  it('shows pagination controls and updates disabled state for overflowing nav links', async () => {
    const fixture = await createPaginationFixture();
    const navBar = tabNavBarInstance(fixture);
    const header = tabList(fixture);
    const list = tabHeaderList(fixture);

    defineReadonlyNumber(header, 'clientWidth', 100);
    defineReadonlyNumber(header, 'scrollWidth', 260);
    defineReadonlyNumber(list, 'scrollWidth', 260);
    (navBar as any)._updatePagination();
    fixture.detectChanges();

    expect(paginationControls(fixture).length).toBe(2);
    expect(paginationControls(fixture)[0].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(true);
    expect(paginationControls(fixture)[1].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(false);

    setWritableNumber(header, 'scrollLeft', 160);
    navBar._handleScroll();
    fixture.detectChanges();

    expect(paginationControls(fixture)[0].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(false);
    expect(paginationControls(fixture)[1].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(true);
  });

  it('scrolls paginated nav links before and after by the visible width', async () => {
    const fixture = await createPaginationFixture();
    const navBar = tabNavBarInstance(fixture);
    const header = tabList(fixture);
    const scrollBy = vi.fn();

    defineReadonlyNumber(header, 'clientWidth', 150);
    Object.defineProperty(header, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    });

    navBar._scrollAfter();
    navBar._scrollBefore();

    expect(scrollBy).toHaveBeenCalledWith({ left: 150, behavior: 'smooth' });
    expect(scrollBy).toHaveBeenCalledWith({ left: -150, behavior: 'smooth' });
  });

  it('does not show pagination controls when nav links fit', async () => {
    const fixture = await createPaginationFixture();
    const navBar = tabNavBarInstance(fixture);
    const header = tabList(fixture);
    const list = tabHeaderList(fixture);

    defineReadonlyNumber(header, 'clientWidth', 260);
    defineReadonlyNumber(header, 'scrollWidth', 260);
    defineReadonlyNumber(list, 'scrollWidth', 260);
    (navBar as any)._updatePagination();
    fixture.detectChanges();

    expect(paginationControls(fixture).length).toBe(0);
  });
});

async function createRouterFixture(): Promise<{
  fixture: ComponentFixture<RouterTabsHost>;
  router: Router;
}> {
  await TestBed.configureTestingModule({
    imports: [RouterTabsHost],
    providers: [
      provideRouter([
        { path: 'overview', component: RouteTarget },
        { path: 'settings', component: RouteTarget },
      ]),
    ],
  }).compileComponents();

  const router = TestBed.inject(Router);
  const fixture = TestBed.createComponent(RouterTabsHost);
  fixture.detectChanges();
  await settle(fixture);

  return { fixture, router };
}

async function createPaginationFixture(): Promise<ComponentFixture<PaginatedNavHost>> {
  await TestBed.configureTestingModule({
    imports: [PaginatedNavHost],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(PaginatedNavHost);
  fixture.detectChanges();
  await settle(fixture);

  return fixture;
}

async function settle<T>(fixture: ComponentFixture<T>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
  fixture.detectChanges();
}

function hostElement<T>(fixture: ComponentFixture<T>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function tabNavBarInstance<T>(fixture: ComponentFixture<T>): TabNavBar {
  return fixture.debugElement.query(By.directive(TabNavBar)).componentInstance as TabNavBar;
}

function tabLinkInstances<T>(fixture: ComponentFixture<T>): TabLink[] {
  return fixture.debugElement
    .queryAll(By.directive(TabLink))
    .map(debugElement => debugElement.componentInstance as TabLink);
}

function tabLinks<T>(fixture: ComponentFixture<T>): HTMLAnchorElement[] {
  return Array.from(hostElement(fixture).querySelectorAll('a[ngs-tab-link]')) as HTMLAnchorElement[];
}

function tabList<T>(fixture: ComponentFixture<T>): HTMLElement {
  return hostElement(fixture).querySelector('.ngs-tab-group-header') as HTMLElement;
}

function tabHeaderList<T>(fixture: ComponentFixture<T>): HTMLElement {
  return hostElement(fixture).querySelector('.ngs-tab-group-header-list') as HTMLElement;
}

function paginationControls<T>(fixture: ComponentFixture<T>): HTMLElement[] {
  return Array.from(
    hostElement(fixture).querySelectorAll('.ngs-tab-group-pagination-control')
  ) as HTMLElement[];
}

function defineReadonlyNumber(element: HTMLElement, property: 'clientWidth' | 'scrollWidth', value: number): void {
  Object.defineProperty(element, property, {
    configurable: true,
    get: () => value,
  });
}

function setWritableNumber(element: HTMLElement, property: 'scrollLeft', value: number): void {
  Object.defineProperty(element, property, {
    configurable: true,
    writable: true,
    value,
  });
}
