import {
  Component,
  Directive,
  ElementRef,
  inject,
  input,
  untracked,
  effect,
  OnDestroy,
  OnInit,
  contentChild,
  ChangeDetectionStrategy,
  forwardRef,
  signal,
  computed,
  model,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { DateAdapter } from '../../core/datetime/date-adapter';
import { Subject } from 'rxjs';
import type { DateRangePicker } from '../../date-range-picker/date-range-picker';
import { DateRange } from '../../core/datetime/date-range';
import { FormField } from '@ngstarter-ui/components/form-field';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';

@Directive({
  selector: 'input[ngsStartDate]',
  host: {
    'class': 'ngs-date-range-input-start',
    '(input)': '_onInput($any($event).target.value)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
})
export class StartDate<D> {
  private _elementRef = inject(ElementRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  _rangeInput!: DateRangeInput<D>;

  _onInput(value: string) {
    let date: D | null;
    try { date = this._dateAdapter.parse(value, null); } catch { date = this._dateAdapter.invalid(); }
    this._rangeInput._startUpdated(date);
    this._rangeInput._inputUpdated();
  }

  _formatValue(value: D | null) {
    this._elementRef.nativeElement.value = value && this._dateAdapter.isValid(value) ? this._dateAdapter.format(value, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    this._rangeInput._inputUpdated();
  }

  _onFocus() {
    this._rangeInput._handleFocus();
  }

  _onBlur() {
    this._rangeInput._handleBlur();
  }

  isEmpty() {
    return !this._elementRef.nativeElement.value;
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}

@Directive({
  selector: 'input[ngsEndDate]',
  host: {
    'class': 'ngs-date-range-input-end',
    '(input)': '_onInput($any($event).target.value)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
})
export class EndDate<D> {
  private _elementRef = inject(ElementRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  _rangeInput!: DateRangeInput<D>;

  _onInput(value: string) {
    let date: D | null;
    try { date = this._dateAdapter.parse(value, null); } catch { date = this._dateAdapter.invalid(); }
    this._rangeInput._endUpdated(date);
    this._rangeInput._inputUpdated();
  }

  _formatValue(value: D | null) {
    this._elementRef.nativeElement.value = value && this._dateAdapter.isValid(value) ? this._dateAdapter.format(value, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
    this._rangeInput._inputUpdated();
  }

  _onFocus() {
    this._rangeInput._handleFocus();
  }

  _onBlur() {
    this._rangeInput._handleBlur();
  }

  isEmpty() {
    return !this._elementRef.nativeElement.value;
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}

@Component({
  selector: 'ngs-date-range-input',
  exportAs: 'ngsDateRangeInput',
  templateUrl: './date-range-input.html',
  styleUrl: './date-range-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-date-range-input',
    '[attr.id]': 'id',
    '[class.ngs-date-range-input-floating]': 'shouldLabelFloat',
    '(click)': 'focus()',
  },
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => DateRangeInput)
    }
  ]
})
export class DateRangeInput<D> implements OnDestroy, OnInit, FormFieldControl<DateRange<D>> {
  private _elementRef = inject(ElementRef);
  private _formField = inject(FormField, { optional: true });
  readonly rangePicker = input.required<DateRangePicker<D>>();
  readonly separator = input<string>('–');
  /** Calendar range shared by typed inputs and picker selection. */
  readonly range = model<DateRange<D> | null>(null);
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  _startInput = contentChild(StartDate);
  _endInput = contentChild(EndDate);

  _value: DateRange<D> | null = null;

  get value() {
    return this._value;
  }

  private _focused = signal(false);
  get focused(): boolean {
    return this._focused();
  }

  private _empty = computed(() => {
    this._inputStateChanges();
    const startInput = this._startInput();
    const endInput = this._endInput();
    return (!this._value || (!this._value.start && !this._value.end)) &&
      (!startInput || startInput.isEmpty()) &&
      (!endInput || endInput.isEmpty());
  });
  get empty(): boolean {
    return this._empty();
  }

  private _shouldLabelFloat = computed(() => {
    return this.focused || !this.empty;
  });
  get shouldLabelFloat(): boolean {
    return this._shouldLabelFloat();
  }

  readonly stateChanges = new Subject<void>();
  private _inputStateChanges = signal(0);
  id = `ngs-date-range-input-${nextUniqueId++}`;
  placeholder = '';
  required = false;
  disabled = false;
  errorState = false;

  constructor() {
    let previousStart = this._startInput();
    let previousEnd = this._endInput();
    effect(() => {
      const range = this.range();
      const start = this._startInput();
      const end = this._endInput();
      untracked(() => {
        if (start) start._rangeInput = this;
        if (end) end._rangeInput = this;
        if (range !== this._value || start !== previousStart || end !== previousEnd) {
          previousStart = start; previousEnd = end;
          const value = range ?? new DateRange<D>(null, null);
          this._rangeUpdated(value);
          this.rangePicker()._selectedRange.set(value);
        }
      });
    });
    effect(() => {
      const picker = this.rangePicker();
      untracked(() => {
        if (picker) {
          picker._registerInput(this);
        }
      });
    });

  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  _startUpdated(date: D | null) {
    this._value = new DateRange<D>(date, this._value?.end || null);
    this.range.set(this._value);
    this.rangePicker()._selectedRange.set(this._value);
    this.stateChanges.next();
  }

  _endUpdated(date: D | null) {
    this._value = new DateRange<D>(this._value?.start || null, date);
    this.range.set(this._value);
    this.rangePicker()._selectedRange.set(this._value);
    this.stateChanges.next();
  }

  _rangeUpdated(range: DateRange<D>) {
    const prevStart = this._value?.start;
    this._value = range;
    this.range.set(range);
    this._startInput()?._formatValue(range.start);
    this._endInput()?._formatValue(range.end);
    this.stateChanges.next();

    if (range.start && !range.end && range.start !== prevStart) {
      this._endInput()?.focus();
    }
  }

  _handleFocus() {
    if (!this._focused()) {
      this._focused.set(true);
      this.stateChanges.next();
    }
  }

  _handleBlur() {
    // Use setTimeout to check if focus moved to another input within the same component
    setTimeout(() => {
      if (!this._elementRef.nativeElement.contains(document.activeElement)) {
        this._focused.set(false);
        this.stateChanges.next();
      }
    });
  }

  _inputUpdated() {
    this._inputStateChanges.update(v => v + 1);
    this.stateChanges.next();
  }

  getConnectedOverlayOrigin(): ElementRef {
    if (this._formField) {
      return this._formField.container() as ElementRef;
    }

    return this._elementRef;
  }

  focus(): void {
    const startInput = this._startInput();
    if (startInput && !this.focused) {
      startInput.focus();
    }
  }
}

let nextUniqueId = 0;
