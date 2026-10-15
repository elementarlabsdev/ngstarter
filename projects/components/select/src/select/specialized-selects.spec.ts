import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { CurrencySelect } from '@ngstarter-ui/components/currency-select';
import { DateFormatSelect } from '@ngstarter-ui/components/date-format-select';
import { TimezoneSelect } from '@ngstarter-ui/components/timezone-select';
import { CountrySelect } from '@ngstarter-ui/components/country-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Select, Option } from '@ngstarter-ui/components/select';

@Component({
  imports: [ReactiveFormsModule, CurrencySelect, DateFormatSelect, TimezoneSelect],
  template: `
    <button class="before">Before</button>
    <ngs-currency-select [formControl]="currency" />
    <ngs-date-format-select [formControl]="format" />
    <ngs-timezone-select [formControl]="timezone" />
    <button class="after">After</button>
  `,
})
class SpecializedSelectsHost {
  readonly currency = new FormControl<string | null>(null);
  readonly format = new FormControl<string | null>(null);
  readonly timezone = new FormControl<string | null>(null);
}

@Component({
  imports: [
    ReactiveFormsModule, CountrySelect, CurrencySelect, DateFormatSelect, TimezoneSelect,
    FormField, Label, Select, Option,
  ],
  template: `
    <button class="before">Before</button>
    <ngs-form-field class="ordinary" labelMode="floating">
      <ngs-label>Ordinary</ngs-label>
      <ngs-select placeholder="Choose a value"><ngs-option value="one">One</ngs-option></ngs-select>
    </ngs-form-field>
    <ngs-form-field class="country" labelMode="floating">
      <ngs-label>Country</ngs-label>
      <ngs-country-select [formControl]="country" placeholder="Choose country" />
    </ngs-form-field>
    <ngs-form-field class="currency" labelMode="floating">
      <ngs-label>Currency</ngs-label>
      <ngs-currency-select [formControl]="currency" placeholder="Choose currency" />
    </ngs-form-field>
    <ngs-form-field class="format" labelMode="floating">
      <ngs-label>Date format</ngs-label>
      <ngs-date-format-select [formControl]="format" placeholder="Choose format" />
    </ngs-form-field>
    <ngs-form-field class="timezone" labelMode="floating">
      <ngs-label>Timezone</ngs-label>
      <ngs-timezone-select [formControl]="timezone" placeholder="Choose timezone" />
    </ngs-form-field>
    <button class="after">After</button>
  `,
  styles: [`:host {
    --ngs-field-border-focus-color: rgb(17, 34, 51);
    --ngs-field-border-color: rgb(120, 120, 120);
    --ngs-field-container-height: 40px;
    --ngs-field-floating-container-height: 56px;
    --ngs-field-input-height: 24px;
    --ngs-field-border-width: 1px;
  }`],
})
class FocusedFieldsHost {
  readonly country = new FormControl<string | null>(null);
  readonly currency = new FormControl<string | null>(null);
  readonly format = new FormControl<string | null>(null);
  readonly timezone = new FormControl<string | null>(null);
}

let overlay: OverlayContainer;
afterEach(() => overlay?.ngOnDestroy());

describe('Specialized select keyboard access', () => {
  it('shows the same field focus as an ordinary select on Tab without opening the panels', async () => {
    await TestBed.configureTestingModule({ imports: [OverlayModule, FocusedFieldsHost] }).compileComponents();
    const fixture = TestBed.createComponent(FocusedFieldsHost);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.before') as HTMLElement).focus();
    let previous: HTMLElement | null = null;
    for (const name of ['ordinary', 'country', 'currency', 'format', 'timezone']) {
      await userEvent.tab();
      fixture.detectChanges();
      const field = fixture.nativeElement.querySelector(`.${name}`) as HTMLElement;
      const select = field.querySelector('ngs-select') as HTMLElement;
      const container = field.querySelector('.ngs-form-field-container') as HTMLElement;
      expect(document.activeElement).toBe(select);
      expect(select.getAttribute('aria-expanded')).toBe('false');
      expect(field.classList.contains('ngs-form-field-focused')).toBe(true);
      expect(field.classList.contains('ngs-form-field-should-float')).toBe(true);
      await expect.poll(() => getComputedStyle(container).boxShadow).toBe('rgb(17, 34, 51) 0px 0px 0px 1px');
      if (previous) {
        expect(previous.classList.contains('ngs-form-field-focused')).toBe(false);
      }
      if (name !== 'ordinary') {
        await userEvent.keyboard('{Enter}');
        fixture.detectChanges();
        await userEvent.keyboard('{Escape}');
        fixture.detectChanges();
        expect(document.activeElement).toBe(select);
        expect(select.getAttribute('aria-expanded')).toBe('false');
        expect(field.classList.contains('ngs-form-field-focused')).toBe(true);
      }
      previous = field;
    }
    await userEvent.tab();
    fixture.detectChanges();
    expect(previous?.classList.contains('ngs-form-field-focused')).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.after'));
  });
  it('gives each control one Tab stop and delegates keyboard selection to Select', async () => {
    await TestBed.configureTestingModule({ imports: [OverlayModule, SpecializedSelectsHost] }).compileComponents();
    const fixture = TestBed.createComponent(SpecializedSelectsHost);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
    const select = (tag: string): HTMLElement => fixture.nativeElement.querySelector(`${tag} ngs-select`);
    (fixture.nativeElement.querySelector('.before') as HTMLElement).focus();
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(select('ngs-currency-select'));
    expect(select('ngs-currency-select').getAttribute('aria-expanded')).toBe('false');
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(select('ngs-currency-select').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.tagName).toBe('INPUT');
    await userEvent.keyboard('{Escape}');
    fixture.detectChanges();
    expect(document.activeElement).toBe(select('ngs-currency-select'));
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(select('ngs-date-format-select'));
    expect(select('ngs-date-format-select').getAttribute('aria-expanded')).toBe('false');
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(select('ngs-date-format-select').getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    fixture.detectChanges();
    expect(fixture.componentInstance.format.value).toBe('dd.MM.yyyy');
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(select('ngs-timezone-select'));
    expect(select('ngs-timezone-select').getAttribute('aria-expanded')).toBe('false');
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(select('ngs-timezone-select').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.tagName).toBe('INPUT');
    await userEvent.keyboard('Asia/Tokyo');
    fixture.detectChanges();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    fixture.detectChanges();
    expect(fixture.componentInstance.timezone.value).toBe('Asia/Tokyo');
    await userEvent.tab();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.after'));
  });
});
