import '@angular/compiler';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CountrySelect, CountrySelectValue } from './country-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

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
    CountrySelect
  ],
  template: `
    <ngs-country-select
      [formControl]="country()"
      placeholder="Select country"
      [showCountryCode]="showCountryCode()"
      (opened)="opened.set(opened() + 1)"
      (closed)="closed.set(closed() + 1)" />
  `
})
class CountrySelectHost {
  readonly country = signal(new FormControl<string | null>(null));
  readonly showCountryCode = signal(false);
  readonly opened = signal(0);
  readonly closed = signal(0);
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormField,
    Label,
    CountrySelect
  ],
  template: `
    <ngs-form-field>
      <ngs-label>Country</ngs-label>
      <ngs-country-select [formControl]="country" placeholder="Select country" />
    </ngs-form-field>
  `
})
class CountrySelectFormFieldHost {
  readonly country = new FormControl<string | null>(null);
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CountrySelect
  ],
  template: `
    <ngs-country-select
      id="shipping-country"
      [formControl]="country"
      placeholder="Select shipping country"
      clearable
      hideCheckIcon
      aria-label="Shipping country"
      aria-describedby="country-help"
      [tabIndex]="7" />
  `
})
class CountrySelectInputsHost {
  readonly country = new FormControl<string | null>('PL');
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CountrySelect
  ],
  template: `
    <ngs-country-select
      [formControl]="countries"
      placeholder="Select countries"
      multiple
      clearable
      (selectionChange)="changes.set(changes() + 1)" />
  `
})
class MultipleCountrySelectHost {
  readonly countries = new FormControl<string[]>(['PL', 'DE']);
  readonly changes = signal(0);
}

@Component({
  standalone: true,
  imports: [
    CountrySelect
  ],
  template: `
    <ngs-country-select
      [value]="country()"
      (valueChange)="country.set($event)"
      placeholder="Select country"
      clearable />
  `
})
class CountrySelectValueHost {
  readonly country = signal<CountrySelectValue>('PL');
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

function getCountrySelect(fixture: ComponentFixture<unknown>): CountrySelect {
  return fixture.debugElement.children[0].componentInstance as CountrySelect;
}

function getHost(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-country-select') as HTMLElement;
}

function getSelect(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-select') as HTMLElement;
}

function getOverlayRoot(): HTMLElement {
  return overlayContainer?.getContainerElement() as HTMLElement;
}

function getPanel(): HTMLElement {
  return getOverlayRoot().querySelector('.ngs-select-panel') as HTMLElement;
}

function getOptions(): HTMLElement[] {
  return Array.from(getPanel().querySelectorAll('ngs-option'));
}

function openSelect(fixture: ComponentFixture<unknown>): void {
  getSelect(fixture).click();
  fixture.detectChanges();
}

function updateSearchInput(fixture: ComponentFixture<unknown>, value: string): void {
  const searchInput = getPanel().querySelector('ngs-select-header input') as HTMLInputElement;

  searchInput.value = value;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
}

afterEach(() => {
  overlayContainer?.ngOnDestroy();
  overlayContainer = undefined;
  vi.useRealTimers();
});

describe('CountrySelect', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('renders host state and selected country with emoji flag', async () => {
    const fixture = await createHost(CountrySelectHost);
    const component = fixture.componentInstance;
    const host = getHost(fixture);

    expect(host.classList.contains('ngs-country-select')).toBe(true);
    expect(host.getAttribute('tabindex')).toBe('0');
    expect(getSelect(fixture).textContent).not.toContain('Select country');
    expect(getCountrySelect(fixture).empty).toBe(true);

    component.showCountryCode.set(true);
    component.country().setValue('PL');
    fixture.detectChanges();

    expect(getCountrySelect(fixture).value).toBe('PL');
    expect(getCountrySelect(fixture).empty).toBe(false);
    expect(getSelect(fixture).textContent).toContain('🇵🇱');
    expect(getSelect(fixture).textContent).toContain('Poland');
    expect(getSelect(fixture).textContent).toContain('(PL)');
  });

  it('keeps the form field label resting when empty and a placeholder is configured', async () => {
    const fixture = await createHost(CountrySelectFormFieldHost);
    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;

    expect(formField.classList.contains('ngs-form-field-empty')).toBe(true);
    expect(formField.classList.contains('ngs-form-field-should-float')).toBe(false);
    expect(formField.textContent).toContain('Country');
    expect(formField.textContent).not.toContain('Select country');
  });

  it('passes the select inputs through to the inner select', async () => {
    const fixture = await createHost(CountrySelectInputsHost);
    const host = getHost(fixture);
    const select = getSelect(fixture);

    expect(host.id).toBe('shipping-country');
    expect(host.getAttribute('tabindex')).toBe('7');
    expect(select.id).toBe('shipping-country-select');
    expect(select.getAttribute('tabindex')).toBe('7');
    expect(select.getAttribute('aria-label')).toBe('Shipping country');
    expect(select.classList.contains('ngs-select-clearable')).toBe(true);
    expect(select.querySelector('.ngs-select-clear-button')).toBeTruthy();
  });

  it('supports multiple country selection values like select', async () => {
    const fixture = await createHost(MultipleCountrySelectHost);
    const component = fixture.componentInstance;

    expect(getCountrySelect(fixture).value).toEqual(['PL', 'DE']);
    expect(getSelect(fixture).textContent).toContain('Poland');
    expect(getSelect(fixture).textContent).toContain('Germany');

    (getSelect(fixture).querySelector('.ngs-select-clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.countries.value).toEqual([]);
    expect(getCountrySelect(fixture).empty).toBe(true);
    expect(component.changes()).toBe(1);
  });

  it('supports the value input model like select', async () => {
    const fixture = await createHost(CountrySelectValueHost);
    const component = fixture.componentInstance;

    expect(getCountrySelect(fixture).value).toBe('PL');
    expect(getSelect(fixture).textContent).toContain('Poland');

    (getSelect(fixture).querySelector('.ngs-select-clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.country()).toBeNull();
    expect(getCountrySelect(fixture).empty).toBe(true);
  });

  it('renders the selected country before the select scrolls on open', async () => {
    const fixture = await createHost(CountrySelectHost);
    const component = fixture.componentInstance;

    component.country().setValue('PL');
    fixture.detectChanges();
    openSelect(fixture);

    const optionsText = getOptions().map(option => option.textContent || '').join(' ');

    expect(component.opened()).toBe(1);
    expect(optionsText).toContain('Poland');
    expect(getOptions().length).toBeGreaterThan(32);
  });

  it('loads countries progressively after opening', async () => {
    vi.useFakeTimers();
    const fixture = await createHost(CountrySelectHost);

    openSelect(fixture);

    expect(getOptions()).toHaveLength(32);
    expect(getPanel().textContent).toContain('Loading more countries...');

    vi.advanceTimersByTime(50);
    fixture.detectChanges();

    expect(getOptions().length).toBeGreaterThan(32);
  });

  it('filters countries from the select header and clears the search', async () => {
    const fixture = await createHost(CountrySelectHost);

    openSelect(fixture);
    updateSearchInput(fixture, 'Poland');

    const panel = getPanel();
    const searchInput = panel.querySelector('ngs-select-header input') as HTMLInputElement;

    expect(searchInput.value).toBe('Poland');
    expect(panel.textContent).toContain('Poland');
    expect(panel.textContent).toContain('🇵🇱');
    expect(panel.querySelector('.clear-button')).toBeTruthy();

    (panel.querySelector('.clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((panel.querySelector('ngs-select-header input') as HTMLInputElement).value).toBe('');
    expect((getCountrySelect(fixture) as any).searchTerm()).toBe('');
    expect(panel.querySelector('.clear-button')).toBeNull();
  });

  it('shows an empty state when search has no matching countries', async () => {
    const fixture = await createHost(CountrySelectHost);

    openSelect(fixture);
    updateSearchInput(fixture, 'zzzzzz');

    expect(getOptions()).toHaveLength(0);
    expect(getPanel().textContent).toContain('Country not found');
  });

  it('selects a country from the overlay and writes it to the form control', async () => {
    const fixture = await createHost(CountrySelectHost);
    const component = fixture.componentInstance;

    openSelect(fixture);
    updateSearchInput(fixture, 'Poland');
    getOptions()[0].click();
    fixture.detectChanges();

    expect(component.country().value).toBe('PL');
    expect(getCountrySelect(fixture).value).toBe('PL');
    expect(getSelect(fixture).textContent).toContain('🇵🇱');
    expect(getSelect(fixture).textContent).toContain('Poland');
    expect(component.closed()).toBe(1);
  });
});
