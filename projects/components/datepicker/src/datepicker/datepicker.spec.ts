import '@angular/compiler';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { DateAdapter } from '../core/datetime/date-adapter';
import { DatepickerPreset } from '../core/datetime/datepicker-preset';
import { NativeDateAdapter } from '../core/datetime/native-date-adapter';
import { DatepickerActions } from './datepicker-actions';
import { DatepickerApply, DatepickerCancel } from './datepicker-directives';
import { DatepickerInput } from '../datepicker-input/datepicker-input';
import { DatepickerToggle } from '../datepicker-toggle/datepicker-toggle';
import { Datepicker } from './datepicker';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Datepicker, DatepickerInput, DatepickerToggle],
  template: `
    <input class="date-input" [formControl]="date" [ngsDatepicker]="picker" />
    <ngs-datepicker-toggle [for]="picker" />
    <ngs-datepicker
      #picker
      [startAt]="startAt"
      [quickPresets]="quickPresets"
      [showQuickPresets]="showQuickPresets()"
    />
  `,
})
class DatepickerHost {
  date = new FormControl<Date | null>(null);
  startAt = new Date(2026, 4, 1);
  showQuickPresets = signal(false);
  quickPresets: DatepickerPreset<Date>[] = [
    {
      label: 'Independence Day',
      value: new Date(2026, 6, 4),
    },
  ];
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Datepicker,
    DatepickerActions,
    DatepickerApply,
    DatepickerCancel,
    DatepickerInput,
    DatepickerToggle,
  ],
  template: `
    <input class="date-input" [formControl]="date" [ngsDatepicker]="picker" />
    <ngs-datepicker-toggle [for]="picker" />
    <ngs-datepicker #picker [startAt]="startAt">
      <ngs-datepicker-actions>
        <button class="apply-action" type="button" ngsDatepickerApply>Apply</button>
        <button class="cancel-action" type="button" ngsDatepickerCancel>Cancel</button>
      </ngs-datepicker-actions>
    </ngs-datepicker>
  `,
})
class DatepickerWithActionsHost {
  date = new FormControl<Date | null>(null);
  startAt = new Date(2026, 4, 1);
}

let overlayContainer: OverlayContainer | undefined;

async function createHost<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component],
    providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  overlayContainer = TestBed.inject(OverlayContainer);
  fixture.detectChanges();

  return fixture;
}

function overlayRoot(): HTMLElement {
  return overlayContainer?.getContainerElement() as HTMLElement;
}

function overlayContent(): HTMLElement | null {
  return overlayRoot().querySelector('.ngs-datepicker-content');
}

function openPicker(fixture: ComponentFixture<unknown>): void {
  const toggle = fixture.nativeElement.querySelector('.ngs-datepicker-toggle-button') as HTMLButtonElement;

  toggle.click();
  fixture.detectChanges();
  detectOverlayChanges();
}

function clickDay(fixture: ComponentFixture<unknown>, day: number): void {
  dayCell(day).click();
  fixture.detectChanges();
  detectOverlayChanges();
}

function dayCell(day: number): HTMLElement {
  const label = day.toString();
  const cell = Array.from(overlayRoot().querySelectorAll('.ngs-calendar-cell')).find(
    (item) => item.textContent?.trim() === label
  ) as HTMLElement | undefined;

  if (!cell) {
    throw new Error(`Could not find calendar day ${label}`);
  }

  return cell;
}

function input(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('.date-input') as HTMLInputElement;
}

function detectOverlayChanges(): void {
  TestBed.inject(ApplicationRef).tick();
}

function expectDate(value: Date | null | undefined, year: number, month: number, date: number): void {
  expect(value).toBeTruthy();
  expect(value?.getFullYear()).toBe(year);
  expect(value?.getMonth()).toBe(month);
  expect(value?.getDate()).toBe(date);
}

afterEach(() => {
  overlayContainer?.ngOnDestroy();
  overlayContainer = undefined;
  TestBed.resetTestingModule();
});

describe('Datepicker', () => {
  it('opens the calendar overlay from the toggle', async () => {
    const fixture = await createHost(DatepickerHost);

    expect(overlayContent()).toBeNull();

    openPicker(fixture);

    expect(overlayContent()).toBeTruthy();
    expect(overlayContent()?.classList.contains('ngs-datepicker-below')).toBe(true);
    expect(overlayRoot().querySelector('ngs-calendar')).toBeTruthy();
    expect(overlayRoot().querySelectorAll('.ngs-calendar-cell').length).toBeGreaterThan(0);
  });

  it('selects a date, writes it to the input, and closes when no actions are projected', async () => {
    const fixture = await createHost(DatepickerHost);

    openPicker(fixture);
    clickDay(fixture, 20);

    expectDate(fixture.componentInstance.date.value, 2026, 4, 20);
    expect(input(fixture).value).toBe('05/20/2026');
    expect(overlayContent()).toBeNull();
  });

  it('renders quick presets and applies the selected preset immediately', async () => {
    const fixture = await createHost(DatepickerHost);
    fixture.componentInstance.showQuickPresets.set(true);
    fixture.detectChanges();

    openPicker(fixture);
    const preset = overlayRoot().querySelector('.ngs-datepicker-preset') as HTMLButtonElement;

    expect(preset.textContent?.trim()).toBe('Independence Day');

    preset.click();
    fixture.detectChanges();
    detectOverlayChanges();

    expectDate(fixture.componentInstance.date.value, 2026, 6, 4);
    expect(input(fixture).value).toBe('07/04/2026');
    expect(overlayContent()).toBeNull();
  });

  it('keeps the overlay open with projected actions until apply is clicked', async () => {
    const fixture = await createHost(DatepickerWithActionsHost);

    openPicker(fixture);
    clickDay(fixture, 20);

    expect(fixture.componentInstance.date.value).toBeNull();
    expect(overlayContent()).toBeTruthy();

    (overlayRoot().querySelector('.apply-action') as HTMLButtonElement).click();
    fixture.detectChanges();
    detectOverlayChanges();

    expectDate(fixture.componentInstance.date.value, 2026, 4, 20);
    expect(overlayContent()).toBeNull();
  });

  it('closes projected actions without applying the pending selection when cancel is clicked', async () => {
    const fixture = await createHost(DatepickerWithActionsHost);

    openPicker(fixture);
    clickDay(fixture, 20);
    (overlayRoot().querySelector('.cancel-action') as HTMLButtonElement).click();
    fixture.detectChanges();
    detectOverlayChanges();

    expect(fixture.componentInstance.date.value).toBeNull();
    expect(overlayContent()).toBeNull();
  });
});
