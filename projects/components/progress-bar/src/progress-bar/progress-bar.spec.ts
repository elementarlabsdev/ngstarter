import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ProgressBar, ProgressBarMode } from './progress-bar';

@Component({
  standalone: true,
  imports: [ProgressBar],
  template: `
    <ngs-progress-bar
      [mode]="mode"
      [value]="value"
      [bufferValue]="bufferValue"
      (animationEnd)="events.push($event)"
    />
  `,
})
class ProgressBarHost {
  mode: ProgressBarMode = 'determinate';
  value = 42;
  bufferValue = 68;
  events: Array<{ value: number }> = [];
}

describe('ProgressBar', () => {
  it('renders determinate progressbar semantics and primary transform', async () => {
    const fixture = await createFixture();
    const host = progressBarHost(fixture);

    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuemin')).toBe('0');
    expect(host.getAttribute('aria-valuemax')).toBe('100');
    expect(host.getAttribute('aria-valuenow')).toBe('42');
    expect(host.getAttribute('mode')).toBe('determinate');
    expect(host.classList.contains('ngs-progress-bar')).toBe(true);
    expect(host.classList.contains('ngs-progress-bar-indeterminate')).toBe(false);
    expect(primaryBar(fixture).style.transform).toBe('scaleX(0.42)');
    expect(fixture.nativeElement.querySelector('.ngs-progress-bar-secondary-bar')).toBeNull();
  });

  it('renders buffer mode with scaled buffer and primary bars', async () => {
    const fixture = await createFixture({
      mode: 'buffer',
      value: 35,
      bufferValue: 80,
    });

    expect(progressBarHost(fixture).getAttribute('mode')).toBe('buffer');
    expect(primaryBar(fixture).style.transform).toBe('scaleX(0.35)');
    expect(bufferBar(fixture).style.transform).toBe('scaleX(0.8)');
    expect(fixture.nativeElement.querySelectorAll('.ngs-progress-bar-track').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.ngs-progress-bar-buffer-bar')).toBeTruthy();
  });

  it('renders indeterminate mode without aria-valuenow and with a secondary bar', async () => {
    const fixture = await createFixture({ mode: 'indeterminate' });
    const host = progressBarHost(fixture);

    expect(host.getAttribute('aria-valuenow')).toBeNull();
    expect(host.getAttribute('mode')).toBe('indeterminate');
    expect(host.classList.contains('ngs-progress-bar-indeterminate')).toBe(true);
    expect(primaryBar(fixture).style.transform).toBe('scaleX(1)');
    expect(fixture.nativeElement.querySelector('.ngs-progress-bar-secondary-bar')).toBeTruthy();
  });

  it('treats query mode as indeterminate while preserving the mode attribute', async () => {
    const fixture = await createFixture({ mode: 'query' });
    const host = progressBarHost(fixture);

    expect(host.getAttribute('aria-valuenow')).toBeNull();
    expect(host.getAttribute('mode')).toBe('query');
    expect(host.classList.contains('ngs-progress-bar-indeterminate')).toBe(true);
    expect(fixture.nativeElement.querySelector('.ngs-progress-bar-secondary-bar')).toBeTruthy();
  });

  it('emits animationEnd for determinate and buffer primary bar transitions only', async () => {
    const fixture = await createFixture();

    dispatchTransitionEnd(primaryBar(fixture));
    expect(fixture.componentInstance.events).toEqual([{ value: 42 }]);

    dispatchTransitionEnd(track(fixture));
    expect(fixture.componentInstance.events).toEqual([{ value: 42 }]);

    fixture.componentInstance.mode = 'buffer';
    fixture.componentInstance.value = 75;
    fixture.detectChanges();
    dispatchTransitionEnd(primaryBar(fixture));
    expect(fixture.componentInstance.events).toEqual([{ value: 42 }, { value: 75 }]);

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    dispatchTransitionEnd(primaryBar(fixture));
    expect(fixture.componentInstance.events).toEqual([{ value: 42 }, { value: 75 }]);
  });
});

async function createFixture(
  initialState: Partial<Pick<ProgressBarHost, 'mode' | 'value' | 'bufferValue'>> = {}
): Promise<ComponentFixture<ProgressBarHost>> {
  await TestBed.configureTestingModule({
    imports: [ProgressBarHost],
  }).compileComponents();

  const fixture = TestBed.createComponent(ProgressBarHost);
  Object.assign(fixture.componentInstance, initialState);
  fixture.detectChanges();

  return fixture;
}

function progressBarHost(fixture: ComponentFixture<ProgressBarHost>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-progress-bar') as HTMLElement;
}

function primaryBar(fixture: ComponentFixture<ProgressBarHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.ngs-progress-bar-primary-bar') as HTMLElement;
}

function bufferBar(fixture: ComponentFixture<ProgressBarHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.ngs-progress-bar-buffer-bar') as HTMLElement;
}

function track(fixture: ComponentFixture<ProgressBarHost>): HTMLElement {
  return fixture.nativeElement.querySelector('.ngs-progress-bar-track') as HTMLElement;
}

function dispatchTransitionEnd(element: HTMLElement): void {
  element.dispatchEvent(new Event('transitionend', { bubbles: true }));
}
