import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  inject,
  forwardRef,
  viewChild,
  TemplateRef,
  OnDestroy,
  Type,
  contentChild,
  ViewContainerRef,
  computed,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Calendar } from '../calendar/calendar/calendar';
import { DateAdapter } from '../core/datetime/date-adapter';
import { DateRange } from '../core/datetime/date-range';
import { DatepickerActions } from '../datepicker/datepicker-actions';
import { DatepickerPreset } from '../core/datetime/datepicker-preset';
import type { DateRangeInput } from '../datepicker-input/date-range-input/date-range-input';
import { DATEPICKER_ACTION_TARGET } from '../datepicker-action-target';

@Component({
  selector: 'ngs-date-range-picker',
  exportAs: 'ngsDateRangePicker',
  imports: [
    OverlayModule,
    Calendar
  ],
  providers: [{ provide: DATEPICKER_ACTION_TARGET, useExisting: forwardRef(() => DateRangePicker) }],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-date-range-picker',
  }
})
export class DateRangePicker<D> implements OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  readonly startAt = input<D | null>(null);
  readonly calendarHeaderComponent = input<Type<any> | null>(null);
  readonly quickPresets = input<DatepickerPreset<D>[] | null>(null);
  readonly showQuickPresets = input<boolean>(false);
  readonly calendarCount = input<1 | 2, unknown>(1, {
    transform: value => numberAttribute(value, 1) === 2 ? 2 : 1,
  });
  readonly extended = input(false, { transform: booleanAttribute });
  readonly _portalTemplate = viewChild.required<TemplateRef<any>>('portal');
  readonly actions = contentChild(DatepickerActions);

  _datepickerInput?: DateRangeInput<D>;
  _selectedRange = signal<DateRange<D>>(new DateRange<D>(null, null));
  _isAbove = signal(false);

  readonly _visibleCalendars = computed(() => this.extended() ? 2 : this.calendarCount());

  readonly _effectivePresets = computed(() => {
    const userPresets = this.quickPresets();
    if (userPresets) {
      return userPresets;
    }

    const today = this._dateAdapter.today();
    return [
      {
        label: 'Today',
        value: new DateRange(today, today)
      },
      {
        label: 'Last 7 Days',
        value: new DateRange(this._dateAdapter.addCalendarDays(today, -6), today)
      },
      {
        label: 'Last 30 Days',
        value: new DateRange(this._dateAdapter.addCalendarDays(today, -29), today)
      },
      {
        label: 'This Month',
        value: () => {
          const year = this._dateAdapter.getYear(today);
          const month = this._dateAdapter.getMonth(today);
          const start = this._dateAdapter.createDate(year, month, 1);
          const daysInMonth = this._dateAdapter.getNumDaysInMonth(start);
          const end = this._dateAdapter.createDate(year, month, daysInMonth);
          return new DateRange(start, end);
        }
      }
    ].map(p => ({
      ...p,
      value: typeof p.value === 'function' ? p.value() : p.value
    })) as DatepickerPreset<D>[];
  });

  private _overlayRef: OverlayRef | null = null;

  ngOnDestroy() {
    this.close();
  }

  _registerInput(input: DateRangeInput<D>): void {
    this._datepickerInput = input;
  }

  open() {
    if (this._overlayRef || !this._datepickerInput || this._datepickerInput.disabled() || this._datepickerInput.readonly()) return;
    this._selectedRange.set(this._datepickerInput._value ?? new DateRange<D>(null, null));

    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._datepickerInput.getConnectedOverlayOrigin())
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      ]);

    strategy.positionChanges.subscribe(change => {
      this._isAbove.set(change.connectionPair.overlayY === 'bottom');
    });

    this._overlayRef = this._overlay.create({
      positionStrategy: strategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this._overlayRef.backdropClick().subscribe(() => this.close());

    const portal = new TemplatePortal(this._portalTemplate()!, this._viewContainerRef);
    this._overlayRef.attach(portal);
  }

  close() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this._overlayRef = null;
      this._selectedRange.set(this._datepickerInput?._value ?? new DateRange<D>(null, null));
    }
  }

  _select(date: D) {
    const currentRange = this._selectedRange();
    let newRange: DateRange<D>;

    if (!currentRange.start || (currentRange.start && currentRange.end)) {
      newRange = new DateRange<D>(date, null);
    } else {
      if (this._dateAdapter.compareDate(date, currentRange.start) < 0) {
        newRange = new DateRange<D>(date, currentRange.start);
      } else {
        newRange = new DateRange<D>(currentRange.start, date);
      }
    }

    this._updateSelectedRange(newRange);
  }

  _selectPreset(preset: DatepickerPreset<D>) {
    const value = preset.value;
    if (value instanceof DateRange) {
      this._updateSelectedRange(value);
    } else if (value) {
      this._updateSelectedRange(new DateRange<D>(value, null));
    } else {
      this._updateSelectedRange(new DateRange<D>(null, null));
    }
  }

  private _updateSelectedRange(newRange: DateRange<D>) {
    this._selectedRange.set(newRange);
    if (this.actions()) return;

    this._datepickerInput?._rangeUpdated(newRange);

    if (newRange.start && newRange.end) {
      this.close();
    }
  }

  apply() {
    const range = this._selectedRange();
    const input = this._datepickerInput;
    const previous = input?._value;
    if (input && (!this._dateAdapter.sameDate(range.start, previous?.start ?? null) ||
                  !this._dateAdapter.sameDate(range.end, previous?.end ?? null))) {
      input._rangeUpdated(range);
    }
    this.close();
  }
}
