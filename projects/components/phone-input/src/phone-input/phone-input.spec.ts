import '@angular/compiler';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Country } from '../model/country.model';
import { PhoneInput } from './phone-input';

vi.mock('uuid', () => ({ v7: () => 'test-icon-id' }));

(globalThis as any).$localize = (messageParts: TemplateStringsArray, ...expressions: unknown[]) => {
  return messageParts.reduce((message, part, index) => {
    return `${message}${expressions[index - 1] ?? ''}${part}`;
  });
};

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PhoneInput
  ],
  template: `
    <ngs-phone-input
      [formControl]="phone()"
      placeholder="Phone number"
      [preferredCountries]="preferredCountries()"
      [onlyCountries]="onlyCountries()"
      [defaultSelectedCountryCode]="defaultCountry()"
      (countryChanged)="countries.set([...countries(), $event])" />
  `
})
class PhoneInputHost {
  readonly phone = signal(new FormControl<string | null>(null));
  readonly preferredCountries = signal<string[]>([]);
  readonly onlyCountries = signal<string[]>([]);
  readonly defaultCountry = signal('us');
  readonly countries = signal<Country[]>([]);
}

let overlayContainer: OverlayContainer | undefined;

async function createHost<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [
      OverlayModule,
      component
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  overlayContainer = TestBed.inject(OverlayContainer);
  fixture.detectChanges();

  return fixture;
}

function getPhoneInput(fixture: ComponentFixture<unknown>): PhoneInput {
  return fixture.debugElement.children[0].componentInstance as PhoneInput;
}

function getHost(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-phone-input') as HTMLElement;
}

function getCountryTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('.country-selector') as HTMLButtonElement;
}

function getNativeInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
}

function getOverlayRoot(): HTMLElement {
  return overlayContainer?.getContainerElement() as HTMLElement;
}

function getMenuPanel(): HTMLElement {
  return getOverlayRoot().querySelector('.ngs-menu-panel') as HTMLElement;
}

function getCountryOptions(): HTMLButtonElement[] {
  return Array.from(getMenuPanel().querySelectorAll('.ngs-menu-content button[ngs-menu-item]'));
}

function openCountryMenu(fixture: ComponentFixture<unknown>): void {
  getCountryTrigger(fixture).click();
  fixture.detectChanges();
}

function updateSearchInput(fixture: ComponentFixture<unknown>, value: string): void {
  const searchInput = getMenuPanel().querySelector('ngs-menu-header input') as HTMLInputElement;

  searchInput.value = value;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
}

afterEach(() => {
  overlayContainer?.ngOnDestroy();
  overlayContainer = undefined;
  vi.useRealTimers();
});

describe('PhoneInput', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('initializes the default country trigger with an emoji flag and phone code', async () => {
    const fixture = await createHost(PhoneInputHost);
    const component = fixture.componentInstance;
    const host = getHost(fixture);
    const trigger = getCountryTrigger(fixture);
    const input = getNativeInput(fixture);

    expect(host.classList.contains('ngs-phone-input')).toBe(true);
    expect(input.placeholder).toBe('Phone number');
    expect(input.autocomplete).toBe('on');
    expect(trigger.textContent).toContain('🇺🇸');
    expect(trigger.textContent).toContain('+1');
    expect(component.countries()[component.countries().length - 1].shortCode).toBe('us');
  });

  it('writes and formats external form values through ControlValueAccessor', async () => {
    const fixture = await createHost(PhoneInputHost);
    const component = fixture.componentInstance;
    const phoneInput = getPhoneInput(fixture);

    component.phone().setValue('+14155552671');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(phoneInput.value).toBe('+14155552671');
    expect(phoneInput.selectedCountry()?.shortCode).toBe('us');
    expect(getNativeInput(fixture).value).toBe('4155552671');
    expect(getCountryTrigger(fixture).textContent).toContain('🇺🇸');
  });

  it('propagates typed phone numbers to the form control', async () => {
    const fixture = await createHost(PhoneInputHost);
    const component = fixture.componentInstance;
    const nativeInput = getNativeInput(fixture);

    nativeInput.value = '4155552671';
    nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(component.phone().value).toBe('+14155552671');
  });

  it('renders country search in the menu header and loads countries progressively', async () => {
    vi.useFakeTimers();
    const fixture = await createHost(PhoneInputHost);

    openCountryMenu(fixture);

    const panel = getMenuPanel();
    const header = panel.querySelector('ngs-menu-header') as HTMLElement;
    const content = panel.querySelector('.ngs-menu-content') as HTMLElement;

    expect(header).toBeTruthy();
    expect(header.querySelector('input')?.getAttribute('placeholder')).toBe('Search...');
    expect(content.querySelector('ngs-menu-header')).toBeNull();
    expect(getCountryOptions()).toHaveLength(32);
    expect(panel.textContent).toContain('Loading more countries...');

    vi.advanceTimersByTime(50);
    fixture.detectChanges();

    expect(getCountryOptions().length).toBeGreaterThan(32);
  });

  it('filters countries from the menu header and clears the search term', async () => {
    const fixture = await createHost(PhoneInputHost);

    openCountryMenu(fixture);
    updateSearchInput(fixture, 'Poland');

    const panel = getMenuPanel();
    const searchInput = panel.querySelector('ngs-menu-header input') as HTMLInputElement;

    expect(searchInput.value).toBe('Poland');
    expect(panel.textContent).toContain('Poland');
    expect(panel.textContent).toContain('+48');
    expect(panel.querySelector('.clear-button')).toBeTruthy();

    (panel.querySelector('.clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((panel.querySelector('ngs-menu-header input') as HTMLInputElement).value).toBe('');
    expect(getPhoneInput(fixture).searchTerm()).toBe('');
    expect(panel.querySelector('.clear-button')).toBeNull();
  });

  it('selects a searched country and emits countryChanged', async () => {
    const fixture = await createHost(PhoneInputHost);
    const component = fixture.componentInstance;

    openCountryMenu(fixture);
    updateSearchInput(fixture, 'Poland');
    getCountryOptions()[0].click();
    fixture.detectChanges();

    expect(getPhoneInput(fixture).selectedCountry()?.shortCode).toBe('pl');
    expect(component.countries()[component.countries().length - 1].shortCode).toBe('pl');
    expect(getCountryTrigger(fixture).textContent).toContain('🇵🇱');
    expect(getCountryTrigger(fixture).textContent).toContain('+48');
  });
});
