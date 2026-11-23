import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DateRange } from '../core/datetime/date-range';
import { DateAdapter } from '../core/datetime/date-adapter';
import { NativeDateAdapter } from '../core/datetime/native-date-adapter';
import { DatepickerToggle } from '../datepicker-toggle/datepicker-toggle';
import { DateRangeInput, EndDate, StartDate } from '../datepicker-input/date-range-input/date-range-input';
import { DatepickerActions } from '../datepicker/datepicker-actions';
import { DatepickerApply, DatepickerCancel } from '../datepicker/datepicker-directives';
import { DateRangePicker } from './date-range-picker';

@Component({
  imports: [
    DateRangeInput, EndDate, StartDate, DateRangePicker, DatepickerToggle,
    DatepickerActions, DatepickerApply, DatepickerCancel,
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
  template: `
    <ngs-date-range-input [rangePicker]="picker" [(value)]="range" (rangeChange)="changes.push($event)">
      <input ngsStartDate>
      <input ngsEndDate>
    </ngs-date-range-input>
    <ngs-datepicker-toggle [for]="picker"/>
    <ngs-date-range-picker #picker [startAt]="startAt" [quickPresets]="presets" [showQuickPresets]="true">
      <ngs-datepicker-actions>
        <button type="button" ngsDatepickerCancel>Cancel</button>
        <button type="button" ngsDatepickerApply>Apply</button>
      </ngs-datepicker-actions>
    </ngs-date-range-picker>
  `,
})
class DateRangeWithActions {
  readonly startAt = new Date(2026, 4, 1);
  readonly presets = [{ label: 'Clear range', value: null }];
  range: DateRange<Date> | null = new DateRange(new Date(2026, 4, 2), new Date(2026, 4, 5));
  readonly changes: (DateRange<Date> | null)[] = [];
}

describe('DateRangePicker actions', () => {
  it('discards a draft on Cancel and emits a range only on Apply', () => {
    const fixture = TestBed.createComponent(DateRangeWithActions);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const initialRange = host.range;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const click = (element: HTMLElement) => {
      element.click();
      fixture.detectChanges();
    };
    const open = () => click(fixture.nativeElement.querySelector('.ngs-datepicker-toggle-button'));
    const select = (day: number) => click(Array.from(overlay.querySelectorAll<HTMLElement>('.ngs-calendar-cell'))
      .find(cell => cell.textContent?.trim() === String(day))!);

    open();
    select(12);
    select(14);
    expect(host.range).toBe(initialRange);
    expect(host.changes).toEqual([]);
    click(overlay.querySelector('[ngsDatepickerCancel]')!);
    expect(host.range).toBe(initialRange);

    open();
    select(18);
    select(20);
    expect(host.changes).toEqual([]);
    click(overlay.querySelector('[ngsDatepickerApply]')!);
    const expected = new DateRange(new Date(2026, 4, 18), new Date(2026, 4, 20));
    expect(host.range).toEqual(expected);
    expect(host.changes).toEqual([expected]);

    open();
    click(overlay.querySelector('.ngs-datepicker-preset')!);
    expect(host.range).toEqual(expected);
    click(overlay.querySelector('[ngsDatepickerApply]')!);
    expect(host.range).toEqual(new DateRange(null, null));
  });
});
