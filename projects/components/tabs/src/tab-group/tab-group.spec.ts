import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Tab } from '../tab/tab';
import { TabContent, TabLabel } from '../tab/tab-directives';
import { TabGroup, TabChangeEvent } from './tab-group';

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

@Component({
  standalone: true,
  imports: [Tab, TabGroup],
  template: `
    <ngs-tab-group
      [selectedIndex]="selectedIndex()"
      [preserveContent]="preserveContent()"
      [headerPosition]="headerPosition()"
      [ngs-stretch-tabs]="stretchTabs()"
      [ngs-align-tabs]="alignTabs()"
      [disableRipple]="disableRipple()"
      [animationDuration]="animationDuration()"
      (selectedIndexChange)="selectedIndexChanges.set([...selectedIndexChanges(), $event])"
      (selectedTabChange)="selectedTabChanges.set([...selectedTabChanges(), $event])"
    >
      @if (showFirstTab()) {
        <ngs-tab
          label="First"
          aria-label="First aria"
          aria-labelledby="first-labelledby"
          [disabled]="firstDisabled()"
        >
          First content
        </ngs-tab>
      }

      <ngs-tab label="Second" [disabled]="secondDisabled()">
        Second content
      </ngs-tab>

      <ngs-tab label="Third">
        Third content
      </ngs-tab>
    </ngs-tab-group>
  `,
})
class BasicTabsHost {
  readonly selectedIndex = signal(0);
  readonly preserveContent = signal(false);
  readonly headerPosition = signal<'above' | 'below'>('above');
  readonly stretchTabs = signal(true);
  readonly alignTabs = signal<'start' | 'center' | 'end'>('start');
  readonly disableRipple = signal(false);
  readonly animationDuration = signal('10ms');
  readonly firstDisabled = signal(false);
  readonly secondDisabled = signal(false);
  readonly showFirstTab = signal(true);
  readonly selectedIndexChanges = signal<number[]>([]);
  readonly selectedTabChanges = signal<TabChangeEvent[]>([]);
}

@Component({
  standalone: true,
  imports: [Tab, TabContent, TabGroup, TabLabel],
  template: `
    <ngs-tab-group [preserveContent]="preserveContent()">
      <ngs-tab>
        <ng-template ngsTabLabel>
          <span class="custom-label">Custom label</span>
        </ng-template>

        <ng-template ngsTabContent>
          <span class="explicit-content">Explicit content</span>
        </ng-template>

        <span class="implicit-content">Implicit fallback</span>
      </ngs-tab>

      <ngs-tab label="Plain">
        <span class="plain-content">Plain content</span>
      </ngs-tab>
    </ngs-tab-group>
  `,
})
class ProjectedTabsHost {
  readonly preserveContent = signal(false);
}

describe('TabGroup', () => {
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

  it('renders tablist semantics, labels, aria attributes, and the initially selected panel', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const host = hostElement(fixture);
    const labels = tabLabels(fixture);
    const panels = tabPanels(fixture);

    expect(tabList(fixture).getAttribute('role')).toBe('tablist');
    expect(labels.map(label => label.textContent?.trim())).toEqual(['First', 'Second', 'Third']);
    expect(labels.map(label => label.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
    expect(labels[0].getAttribute('aria-selected')).toBe('true');
    expect(labels[0].getAttribute('aria-label')).toBe('First aria');
    expect(labels[0].getAttribute('aria-labelledby')).toBe('first-labelledby');
    expect(labels[0].getAttribute('tabindex')).toBe('0');
    expect(labels[1].getAttribute('tabindex')).toBe('-1');
    expect(panels.length).toBe(1);
    expect(panels[0].getAttribute('role')).toBe('tabpanel');
    expect(panels[0].textContent).toContain('First content');
    expect(host.querySelector('ngs-tab-group')?.classList.contains('ngs-tab-group-inverted')).toBe(false);
  });

  it('selects tabs from header clicks and emits selected index and tab change events', async () => {
    const fixture = await createFixture(BasicTabsHost);

    tabLabels(fixture)[1].click();
    fixture.detectChanges();
    await settle(fixture);

    expect(activeLabelText(fixture)).toBe('Second');
    expect(activePanelText(fixture)).toContain('Second content');
    expect(fixture.componentInstance.selectedIndexChanges()).toEqual([1]);
    expect(fixture.componentInstance.selectedTabChanges().map(change => change.index)).toEqual([1]);
    expect(fixture.componentInstance.selectedTabChanges()[0].tab.label()).toBe('Second');
  });

  it('does not select or emit for disabled or already-selected tab headers', async () => {
    const fixture = await createFixture(BasicTabsHost);
    fixture.componentInstance.secondDisabled.set(true);
    fixture.detectChanges();
    await settle(fixture);

    tabLabels(fixture)[1].click();
    tabLabels(fixture)[0].click();
    fixture.detectChanges();

    expect(activeLabelText(fixture)).toBe('First');
    expect(fixture.componentInstance.selectedIndexChanges()).toEqual([]);
    expect(tabLabels(fixture)[1].classList.contains('ngs-tab-label-disabled')).toBe(true);
    expect(tabLabels(fixture)[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('reacts to selectedIndex input changes without emitting user selection events', async () => {
    const fixture = await createFixture(BasicTabsHost);

    fixture.componentInstance.selectedIndex.set(2);
    fixture.detectChanges();
    await settle(fixture);

    expect(activeLabelText(fixture)).toBe('Third');
    expect(activePanelText(fixture)).toContain('Third content');
    expect(fixture.componentInstance.selectedIndexChanges()).toEqual([]);
    expect(fixture.componentInstance.selectedTabChanges()).toEqual([]);
  });

  it('clamps the selected index when projected tabs are removed', async () => {
    const fixture = await createFixture(BasicTabsHost);

    fixture.componentInstance.selectedIndex.set(2);
    fixture.detectChanges();
    await settle(fixture);
    fixture.componentInstance.showFirstTab.set(false);
    fixture.detectChanges();
    await settle(fixture);

    expect(tabLabels(fixture).map(label => label.textContent?.trim())).toEqual(['Second', 'Third']);
    expect(activeLabelText(fixture)).toBe('Third');
  });

  it('supports custom labels and explicit tab content templates', async () => {
    const fixture = await createFixture(ProjectedTabsHost);
    const host = hostElement(fixture);

    expect(host.querySelector('.custom-label')?.textContent?.trim()).toBe('Custom label');
    expect(host.querySelector('.explicit-content')?.textContent?.trim()).toBe('Explicit content');
    expect(host.querySelector('.implicit-content')).toBeNull();

    tabLabels(fixture)[1].click();
    fixture.detectChanges();
    await settle(fixture);

    expect(host.querySelector('.plain-content')?.textContent?.trim()).toBe('Plain content');
  });

  it('preserves inactive panel content when preserveContent is enabled', async () => {
    const fixture = await createFixture(ProjectedTabsHost);

    fixture.componentInstance.preserveContent.set(true);
    fixture.detectChanges();
    await settle(fixture);

    expect(tabPanels(fixture).length).toBe(2);
    expect(hostElement(fixture).querySelector('.explicit-content')).toBeTruthy();
    expect(hostElement(fixture).querySelector('.plain-content')).toBeTruthy();
  });

  it('applies header position, alignment, stretch, and animation duration inputs', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const group = hostElement(fixture).querySelector('ngs-tab-group') as HTMLElement;

    fixture.componentInstance.headerPosition.set('below');
    fixture.componentInstance.alignTabs.set('center');
    fixture.componentInstance.stretchTabs.set(false);
    fixture.componentInstance.animationDuration.set(25 as unknown as string);
    fixture.detectChanges();
    await settle(fixture);

    expect(group.classList.contains('ngs-tab-group-inverted')).toBe(true);
    expect(group.style.getPropertyValue('--ngs-tab-group-animation-duration')).toBe('25ms');
    expect(tabHeaderList(fixture).classList.contains('ngs-tab-group-header-list-align-center')).toBe(true);
    expect(tabLabels(fixture).every(label => !label.classList.contains('ngs-tab-label-stretched'))).toBe(true);
  });

  it('uses custom enter and leave animation input aliases when provided', async () => {
    await TestBed.configureTestingModule({
      imports: [TabGroup],
    }).compileComponents();

    const fixture = TestBed.createComponent(TabGroup);
    fixture.componentRef.setInput('animate.enter', 'custom-enter');
    fixture.componentRef.setInput('animate.leave', 'custom-leave');
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component._getEnterAnimation(0)).toBe('custom-enter');
    expect(component._getLeaveAnimation(0)).toBe('custom-leave');
  });

  it('navigates with keyboard shortcuts and skips disabled tabs', async () => {
    const fixture = await createFixture(BasicTabsHost);
    fixture.componentInstance.secondDisabled.set(true);
    fixture.detectChanges();
    await settle(fixture);

    dispatchKey(fixture, 'ArrowRight');
    expect(activeLabelText(fixture)).toBe('Third');
    expect(fixture.componentInstance.selectedIndexChanges()).toEqual([2]);

    dispatchKey(fixture, 'ArrowRight');
    expect(activeLabelText(fixture)).toBe('First');

    dispatchKey(fixture, 'ArrowLeft');
    expect(activeLabelText(fixture)).toBe('Third');

    dispatchKey(fixture, 'Home');
    expect(activeLabelText(fixture)).toBe('First');

    dispatchKey(fixture, 'End');
    expect(activeLabelText(fixture)).toBe('Third');
  });

  it('ignores keyboard events that are not tab navigation shortcuts', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    tabList(fixture).dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(false);
    expect(activeLabelText(fixture)).toBe('First');
  });

  it('shows pagination controls and updates scroll button state from scroll position', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const component = tabGroupInstance(fixture);
    const header = tabList(fixture);
    const list = tabHeaderList(fixture);

    defineReadonlyNumber(header, 'clientWidth', 100);
    defineReadonlyNumber(header, 'scrollWidth', 300);
    defineReadonlyNumber(list, 'scrollWidth', 300);
    component._updatePagination();
    fixture.detectChanges();

    expect(paginationControls(fixture).length).toBe(2);
    expect(paginationControls(fixture)[0].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(true);
    expect(paginationControls(fixture)[1].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(false);

    setWritableNumber(header, 'scrollLeft', 200);
    component._handleScroll();
    fixture.detectChanges();

    expect(paginationControls(fixture)[0].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(false);
    expect(paginationControls(fixture)[1].classList.contains('ngs-tab-group-pagination-control-disabled')).toBe(true);
  });

  it('scrolls the paginated header before and after by half the visible width', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const component = tabGroupInstance(fixture);
    const header = tabList(fixture);
    const scrollBy = vi.fn();

    defineReadonlyNumber(header, 'clientWidth', 120);
    Object.defineProperty(header, 'scrollBy', {
      configurable: true,
      value: scrollBy,
    });

    component._scrollAfter();
    component._scrollBefore();

    expect(scrollBy).toHaveBeenCalledWith({ left: 60, behavior: 'smooth' });
    expect(scrollBy).toHaveBeenCalledWith({ left: -60, behavior: 'smooth' });
  });

  it('does not show pagination controls when tabs fit the available width', async () => {
    const fixture = await createFixture(BasicTabsHost);
    const component = tabGroupInstance(fixture);
    const header = tabList(fixture);
    const list = tabHeaderList(fixture);

    defineReadonlyNumber(header, 'clientWidth', 300);
    defineReadonlyNumber(header, 'scrollWidth', 300);
    defineReadonlyNumber(list, 'scrollWidth', 300);
    component._updatePagination();
    fixture.detectChanges();

    expect(paginationControls(fixture).length).toBe(0);
  });
});

async function createFixture<T>(component: new () => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
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

function tabGroupInstance<T>(fixture: ComponentFixture<T>): TabGroup {
  return fixture.debugElement.query(By.directive(TabGroup)).componentInstance as TabGroup;
}

function tabList<T>(fixture: ComponentFixture<T>): HTMLElement {
  return hostElement(fixture).querySelector('.ngs-tab-group-header') as HTMLElement;
}

function tabHeaderList<T>(fixture: ComponentFixture<T>): HTMLElement {
  return hostElement(fixture).querySelector('.ngs-tab-group-header-list') as HTMLElement;
}

function tabLabels<T>(fixture: ComponentFixture<T>): HTMLElement[] {
  return Array.from(hostElement(fixture).querySelectorAll('.ngs-tab-label')) as HTMLElement[];
}

function tabPanels<T>(fixture: ComponentFixture<T>): HTMLElement[] {
  return Array.from(hostElement(fixture).querySelectorAll('.ngs-tab-panel')) as HTMLElement[];
}

function paginationControls<T>(fixture: ComponentFixture<T>): HTMLElement[] {
  return Array.from(
    hostElement(fixture).querySelectorAll('.ngs-tab-group-pagination-control')
  ) as HTMLElement[];
}

function activeLabelText<T>(fixture: ComponentFixture<T>): string {
  return tabLabels(fixture)
    .find(label => label.classList.contains('ngs-tab-label-active'))
    ?.textContent?.trim() ?? '';
}

function activePanelText<T>(fixture: ComponentFixture<T>): string {
  return tabPanels(fixture)
    .find(panel => panel.classList.contains('ngs-tab-panel-active'))
    ?.textContent?.trim() ?? '';
}

function dispatchKey<T>(fixture: ComponentFixture<T>, key: string): void {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  tabList(fixture).dispatchEvent(event);
  fixture.detectChanges();
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
