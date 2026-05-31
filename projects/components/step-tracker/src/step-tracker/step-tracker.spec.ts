import '@angular/compiler';
import { By } from '@angular/platform-browser';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeAll, afterEach, vi } from 'vitest';
import {
  provideStepTracker,
  STEP_TRACKER_CONFIG
} from '../config';
import { StepTrackerCompletedIcon } from '../step-tracker-completed-icon/step-tracker-completed-icon';
import { StepTrackerDescription } from '../step-tracker-description/step-tracker-description';
import { StepTrackerErrorIcon } from '../step-tracker-error-icon/step-tracker-error-icon';
import {
  StepTrackerItem,
  StepTrackerResolvedItemState
} from '../step-tracker-item/step-tracker-item';
import { StepTrackerLabel } from '../step-tracker-label/step-tracker-label';
import { StepTracker } from './step-tracker';

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

@Component({
  standalone: true,
  imports: [StepTracker, StepTrackerItem],
  template: `
    <ngs-step-tracker [activeIndex]="activeIndex()" [orientation]="orientation()">
      <ngs-step-tracker-item label="Created" description="Request opened"/>
      <ngs-step-tracker-item label="Review" description="Waiting on finance"/>
      <ngs-step-tracker-item state="error" label="Documents" description="Missing file"/>
      <ngs-step-tracker-item label="Approval" description="Not started"/>
      <ngs-step-tracker-item state="disabled" label="Success" description="Locked"/>
    </ngs-step-tracker>
  `,
})
class StatefulTrackerHost {
  activeIndex = signal<number | null>(1);
  orientation = signal<'vertical' | 'horizontal'>('vertical');
}

@Component({
  standalone: true,
  imports: [StepTracker, StepTrackerItem],
  template: `
    <ngs-step-tracker [(activeIndex)]="activeIndex">
      <ngs-step-tracker-item label="First"/>
      <ngs-step-tracker-item label="Second"/>
      <ngs-step-tracker-item label="Third"/>
    </ngs-step-tracker>
  `,
})
class ModelTrackerHost {
  activeIndex: number | null = null;
}

@Component({
  standalone: true,
  imports: [StepTracker, StepTrackerItem, StepTrackerLabel, StepTrackerDescription],
  template: `
    <ngs-step-tracker>
      <ngs-step-tracker-item state="current">
        <ngs-step-tracker-label>
          <span class="projected-label">Projected label</span>
        </ngs-step-tracker-label>
        <ngs-step-tracker-description>
          <span class="projected-description">Projected description</span>
        </ngs-step-tracker-description>
      </ngs-step-tracker-item>
    </ngs-step-tracker>
  `,
})
class ProjectedContentHost {}

@Component({
  standalone: true,
  imports: [
    StepTracker,
    StepTrackerCompletedIcon,
    StepTrackerErrorIcon,
    StepTrackerItem,
  ],
  template: `
    <ngs-step-tracker>
      <ng-template ngsStepTrackerCompletedIcon>
        <span class="custom-completed-icon">done</span>
      </ng-template>

      <ng-template ngsStepTrackerErrorIcon>
        <span class="custom-error-icon">blocked</span>
      </ng-template>

      <ngs-step-tracker-item state="completed" label="Created"/>
      <ngs-step-tracker-item state="error" label="Documents"/>
    </ngs-step-tracker>
  `,
})
class CustomIconsHost {}

@Component({
  standalone: true,
  imports: [StepTracker, StepTrackerItem],
  template: `
    <ngs-step-tracker>
      <ngs-step-tracker-item state="completed" label="Created"/>
      <ngs-step-tracker-item state="error" label="Documents"/>
    </ngs-step-tracker>
  `,
})
class ConfiguredIconsHost {}

function queryTracker<T>(fixture: ComponentFixture<T>): StepTracker {
  return fixture.debugElement.query(By.directive(StepTracker)).componentInstance as StepTracker;
}

function queryItems<T>(fixture: ComponentFixture<T>): StepTrackerItem[] {
  return fixture.debugElement
    .queryAll(By.directive(StepTrackerItem))
    .map(debugElement => debugElement.componentInstance as StepTrackerItem);
}

function queryItemElements<T>(fixture: ComponentFixture<T>): HTMLElement[] {
  return Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('ngs-step-tracker-item')
  );
}

function itemStates<T>(fixture: ComponentFixture<T>): StepTrackerResolvedItemState[] {
  return queryItems(fixture).map(item => item.resolvedState());
}

async function createFixture<T>(component: new () => T): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}

describe('StepTracker', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    });

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 0),
    });

    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      value: (id: number) => window.clearTimeout(id),
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the list semantics, labels, descriptions, and vertical orientation by default', async () => {
    const fixture = await createFixture(StatefulTrackerHost);
    const host = fixture.nativeElement as HTMLElement;
    const trackerElement = host.querySelector('ngs-step-tracker') as HTMLElement;

    expect(trackerElement.getAttribute('role')).toBe('list');
    expect(trackerElement.classList.contains('ngs-step-tracker-vertical')).toBe(true);
    expect(trackerElement.classList.contains('ngs-step-tracker-horizontal')).toBe(false);
    expect(host.textContent).toContain('Created');
    expect(host.textContent).toContain('Request opened');
    expect(host.querySelectorAll('ngs-step-tracker-item[role="listitem"]').length).toBe(5);
  });

  it('resolves auto item states from activeIndex and preserves explicit item states', async () => {
    const fixture = await createFixture(StatefulTrackerHost);
    const hostComponent = fixture.componentInstance;
    const itemElements = queryItemElements(fixture);

    expect(itemStates(fixture)).toEqual([
      'completed',
      'current',
      'error',
      'pending',
      'disabled',
    ]);
    expect(itemElements[1].getAttribute('aria-current')).toBe('step');
    expect(itemElements[4].getAttribute('aria-disabled')).toBe('true');

    hostComponent.activeIndex.set(4);
    fixture.detectChanges();

    expect(itemStates(fixture)).toEqual([
      'completed',
      'completed',
      'error',
      'completed',
      'disabled',
    ]);
  });

  it('clamps activeIndex to the valid item range and supports the all-completed index', async () => {
    const fixture = await createFixture(ModelTrackerHost);
    const tracker = queryTracker(fixture);

    tracker.setActiveIndex(-5);
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(0);
    expect(fixture.componentInstance.activeIndex).toBe(0);
    expect(itemStates(fixture)).toEqual(['current', 'pending', 'pending']);

    tracker.setActiveIndex(99);
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(3);
    expect(fixture.componentInstance.activeIndex).toBe(3);
    expect(itemStates(fixture)).toEqual(['completed', 'completed', 'completed']);
  });

  it('updates activeIndex through next and previous methods', async () => {
    const fixture = await createFixture(ModelTrackerHost);
    const tracker = queryTracker(fixture);

    tracker.next();
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(0);
    expect(itemStates(fixture)).toEqual(['current', 'pending', 'pending']);

    tracker.next();
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(1);
    expect(itemStates(fixture)).toEqual(['completed', 'current', 'pending']);

    tracker.previous();
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(0);
    expect(itemStates(fixture)).toEqual(['current', 'pending', 'pending']);

    tracker.previous();
    fixture.detectChanges();
    expect(tracker.activeIndex()).toBe(0);
  });

  it('switches orientation classes when the layout changes', async () => {
    const fixture = await createFixture(StatefulTrackerHost);
    const hostComponent = fixture.componentInstance;
    const trackerElement = (fixture.nativeElement as HTMLElement).querySelector(
      'ngs-step-tracker'
    ) as HTMLElement;

    hostComponent.orientation.set('horizontal');
    fixture.detectChanges();

    expect(trackerElement.classList.contains('ngs-step-tracker-horizontal')).toBe(true);
    expect(trackerElement.classList.contains('ngs-step-tracker-vertical')).toBe(false);
  });

  it('sets and resets horizontal connector CSS variables through item APIs', async () => {
    const fixture = await createFixture(StatefulTrackerHost);
    const item = queryItems(fixture)[0];
    const itemElement = queryItemElements(fixture)[0];

    item.setHorizontalConnector(12.4, 42.6, 18.2);

    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-left')).toBe('12px');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-length')).toBe('43px');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-right')).toBe('auto');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-top')).toBe('18px');

    item.resetHorizontalConnector();

    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-left')).toBe('');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-length')).toBe('');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-right')).toBe('');
    expect(itemElement.style.getPropertyValue('--ngs-step-tracker-connector-top')).toBe('');
  });

  it('renders projected label and description content', async () => {
    const fixture = await createFixture(ProjectedContentHost);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.projected-label')?.textContent?.trim()).toBe('Projected label');
    expect(host.querySelector('.projected-description')?.textContent?.trim()).toBe(
      'Projected description'
    );
    expect(host.querySelector('ngs-step-tracker-label')).toBeTruthy();
    expect(host.querySelector('ngs-step-tracker-description')).toBeTruthy();
  });

  it('uses default configured icon names when no icon templates are projected', async () => {
    const fixture = await createFixture(ConfiguredIconsHost);
    const items = queryItems(fixture);

    expect(items[0].completedIconName).toBe('fluent:checkmark-16-filled');
    expect(items[0].errorIconName).toBe('fluent:error-circle-16-filled');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('ngs-icon').length).toBe(4);
  });

  it('uses global icon names from provideStepTracker', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguredIconsHost],
      providers: [
        provideStepTracker({
          completedIconName: 'fluent:shield-checkmark-24-regular',
          errorIconName: 'fluent:warning-24-regular',
        }),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfiguredIconsHost);
    fixture.detectChanges();
    const items = queryItems(fixture);

    expect(items[0].completedIconName).toBe('fluent:shield-checkmark-24-regular');
    expect(items[0].errorIconName).toBe('fluent:warning-24-regular');
    expect(TestBed.inject(STEP_TRACKER_CONFIG).completedIconName).toBe(
      'fluent:shield-checkmark-24-regular'
    );
  });

  it('registers tracker-level completed and error icon templates on every item', async () => {
    const fixture = await createFixture(CustomIconsHost);
    const host = fixture.nativeElement as HTMLElement;
    const items = queryItems(fixture);

    expect(items.every(item => item.completedIconTemplate())).toBe(true);
    expect(items.every(item => item.errorIconTemplate())).toBe(true);
    expect(host.querySelectorAll('.custom-completed-icon').length).toBe(2);
    expect(host.querySelectorAll('.custom-error-icon').length).toBe(2);
    expect(host.querySelector('ngs-icon')).toBeNull();
  });
});
