import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { afterEach, describe, expect, it } from 'vitest';
import { Option } from '@ngstarter-ui/components/option';
import { Autocomplete } from './autocomplete';
import { AutocompleteTrigger } from '../autocomplete-trigger';

@Component({
  imports: [Autocomplete, AutocompleteTrigger, Option],
  template: `
    <input [ngsAutocomplete]="autocomplete" aria-label="Search people" [disabled]="disabled()">
    <button>Next control</button>
    <ngs-autocomplete #autocomplete="ngsAutocomplete" [autoActiveFirstOption]="autoActive()"
      (optionSelected)="selections.set(selections() + 1)">
      @for (option of options(); track option.value) {
        <ngs-option [value]="option.value" [disabled]="option.disabled ?? false">{{ option.label }}</ngs-option>
      }
    </ngs-autocomplete>
  `,
})
class AutocompleteHost {
  readonly options = signal([
    { value: 'ada', label: 'Ada' },
    { value: 'blocked', label: 'Disabled', disabled: true },
    { value: 'grace', label: 'Grace' },
  ]);
  readonly disabled = signal(false);
  readonly autoActive = signal(false);
  readonly selections = signal(0);
}

let overlay: OverlayContainer;
async function createHost(): Promise<ComponentFixture<AutocompleteHost>> {
  await TestBed.configureTestingModule({ imports: [OverlayModule, AutocompleteHost] }).compileComponents();
  const fixture = TestBed.createComponent(AutocompleteHost);
  overlay = TestBed.inject(OverlayContainer);
  fixture.detectChanges();
  return fixture;
}

function input(fixture: ComponentFixture<AutocompleteHost>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input');
}

function keydown(element: HTMLElement, key: string): KeyboardEvent {
  const codes: Record<string, number> = {
    ArrowDown: 40, ArrowUp: 38, Home: 36, End: 35, Enter: 13, ' ': 32, Escape: 27, Tab: 9, g: 71,
  };
  const event = new KeyboardEvent('keydown', { key, keyCode: codes[key], bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

function options(): HTMLElement[] {
  return Array.from(overlay.getContainerElement().querySelectorAll('ngs-option'));
}

afterEach(() => overlay?.ngOnDestroy());

describe('Autocomplete keyboard access', () => {
  it('keeps focus on the input, skips disabled suggestions, and selects with Enter', async () => {
    const fixture = await createHost();
    const field = input(fixture);
    field.focus();
    fixture.detectChanges();
    keydown(field, 'ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-controls')).toBe(overlay.getContainerElement().querySelector('[role=listbox]')?.id);
    expect(field.getAttribute('aria-activedescendant')).toBe(options()[0].id);
    keydown(field, 'ArrowDown');
    fixture.detectChanges();
    expect(field.getAttribute('aria-activedescendant')).toBe(options()[2].id);
    keydown(field, 'Enter');
    fixture.detectChanges();
    expect(field.value).toBe('Grace');
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(field.getAttribute('aria-activedescendant')).toBeNull();
    expect(fixture.componentInstance.selections()).toBe(1);
    expect(keydown(field, 'Enter').defaultPrevented).toBe(false);
  });

  it('navigates the current filtered list rather than stale options', async () => {
    const fixture = await createHost();
    const field = input(fixture);
    field.focus();
    fixture.detectChanges();
    keydown(field, 'ArrowDown');
    fixture.detectChanges();
    fixture.componentInstance.options.set([{ value: 'new', label: 'New person' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    keydown(field, 'ArrowDown');
    fixture.detectChanges();
    keydown(field, 'Enter');
    fixture.detectChanges();
    expect(field.value).toBe('New person');
    expect(fixture.componentInstance.selections()).toBe(1);
  });

  it('preserves text editing and closes on Escape or Tab without selection', async () => {
    const fixture = await createHost();
    const field = input(fixture);
    fixture.componentInstance.autoActive.set(true);
    fixture.detectChanges();
    field.focus();
    fixture.detectChanges();
    const firstId = field.getAttribute('aria-activedescendant');
    for (const key of [' ', 'Home', 'End', 'g']) {
      expect(keydown(field, key).defaultPrevented).toBe(false);
    }
    await new Promise(resolve => setTimeout(resolve, 250));
    fixture.detectChanges();
    expect(field.getAttribute('aria-activedescendant')).toBe(firstId);
    expect(keydown(field, 'Escape').defaultPrevented).toBe(true);
    fixture.detectChanges();
    expect(field.getAttribute('aria-expanded')).toBe('false');
    keydown(field, 'ArrowDown');
    fixture.detectChanges();
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(keydown(field, 'Tab').defaultPrevented).toBe(false);
    fixture.detectChanges();
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.selections()).toBe(0);
  });

  it('does not open a disabled input', async () => {
    const fixture = await createHost();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    keydown(input(fixture), 'ArrowDown');
    fixture.detectChanges();
    expect(options()).toHaveLength(0);
  });
});
