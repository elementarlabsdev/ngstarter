import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ButtonToggleGroup } from '../button-toggle-group/button-toggle-group';
import { ButtonToggle } from './button-toggle';

@Component({
  imports: [ButtonToggle, ButtonToggleGroup],
  template: `
    <ngs-button-toggle-group [value]="value()">
      <ngs-button-toggle value="red">Red</ngs-button-toggle>
      <ngs-button-toggle value="green">Green</ngs-button-toggle>
      <ngs-button-toggle value="blue">Blue</ngs-button-toggle>
    </ngs-button-toggle-group>
  `,
})
class ButtonToggleHost {
  readonly value = signal('green');
}

describe('ButtonToggle', () => {
  it('renders the selection indicator only in the selected toggle', async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleHost],
    }).compileComponents();

    const fixture: ComponentFixture<ButtonToggleHost> = TestBed.createComponent(ButtonToggleHost);
    fixture.detectChanges();

    expect(selectionIndicatorLabels(fixture)).toEqual(['Green']);
    expect(selectedIndicatorDisplay(fixture)).not.toBe('none');

    fixture.componentInstance.value.set('blue');
    fixture.detectChanges();

    expect(selectionIndicatorLabels(fixture)).toEqual(['Blue']);

    toggleButton(fixture, 'Red').click();
    fixture.detectChanges();

    expect(selectionIndicatorLabels(fixture)).toEqual(['Red']);
  });
});

function toggleButton(
  fixture: ComponentFixture<ButtonToggleHost>,
  label: string,
): HTMLButtonElement {
  const host = fixture.nativeElement as HTMLElement;
  const button = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );

  if (!button) {
    throw new Error(`Button toggle "${label}" was not found`);
  }

  return button;
}

function selectedIndicatorDisplay(fixture: ComponentFixture<ButtonToggleHost>): string {
  const host = fixture.nativeElement as HTMLElement;
  const indicator = host.querySelector<HTMLElement>(
    '.ngs-button-toggle-checked .ngs-button-toggle-selection-indicator',
  );

  if (!indicator) {
    throw new Error('Selected button toggle indicator was not found');
  }

  return getComputedStyle(indicator).display;
}

function selectionIndicatorLabels(fixture: ComponentFixture<ButtonToggleHost>): string[] {
  const host = fixture.nativeElement as HTMLElement;

  return Array.from(
    host.querySelectorAll<HTMLElement>('ngs-button-toggle'),
  )
    .filter((toggle) => toggle.querySelector('.ngs-button-toggle-selection-indicator'))
    .map((toggle) => toggle.textContent?.trim() ?? '');
}
