import {
  booleanAttribute,
  Component,
  Directive,
  ElementRef,
  inject,
  input,
  untracked,
  effect,
  OnDestroy,
  contentChild,
  ChangeDetectionStrategy,
  forwardRef,
  signal,
  computed,
  model,
  output,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
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
    '(blur)': '_onBlur($event)',
    '[disabled]': '_rangeInput.disabled()',
    '[readOnly]': '_rangeInput.readonly()',
    '[required]': '_rangeInput.required()',
  },
})
export class StartDate<D> {
  private _elementRef = inject(ElementRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  protected readonly _rangeInput = inject<DateRangeInput<D>>(DateRangeInput);

  _onInput(value: string) {
    if (this._rangeInput.disabled() || this._rangeInput.readonly()) return;
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

  _onBlur(event: FocusEvent) {
    this._rangeInput._handleBlur(event);
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
    '(blur)': '_onBlur($event)',
    '[disabled]': '_rangeInput.disabled()',
    '[readOnly]': '_rangeInput.readonly()',
    '[required]': '_rangeInput.required()',
  },
})
export class EndDate<D> {
  private _elementRef = inject(ElementRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  protected readonly _rangeInput = inject<DateRangeInput<D>>(DateRangeInput);

  _onInput(value: string) {
    if (this._rangeInput.disabled() || this._rangeInput.readonly()) return;
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

  _onBlur(event: FocusEvent) {
    this._rangeInput._handleBlur(event);
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
export class DateRangeInput<D> implements OnDestroy, FormFieldControl<DateRange<D>>, FormValueControl<DateRange<D> | null> {
  private _elementRef = inject(ElementRef);
  private _formField = inject(FormField, { optional: true });
  readonly rangePicker = input.required<DateRangePicker<D>>();
  readonly separator = input<string>('–');
  readonly value = model<DateRange<D> | null>(null);
  readonly range = input<DateRange<D> | null>();
  readonly rangeChange = output<DateRange<D> | null>();
  readonly touch = output<void>();
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  _startInput = contentChild(StartDate);
  _endInput = contentChild(EndDate);

  _value: DateRange<D> | null = null;

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
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false);
  readonly touched = input(false);

  get errorState(): boolean {
    return this.invalid() && this.touched();
  }

  constructor() {
    let previousValue: DateRange<D> | null | undefined;
    let previousRange: DateRange<D> | null | undefined;
    let previousStart: StartDate<D> | undefined;
    let previousEnd: EndDate<D> | undefined;
    effect(() => {
      const value = this.value();
      const range = this.range();
      const start = this._startInput();
      const end = this._endInput();
      untracked(() => {
        let next = this._value;
        if (value !== previousValue) {
          next = previousValue === undefined ? value ?? range ?? null : value;
        } else if (range !== previousRange) {
          next = range ?? value;
        }
        previousValue = value;
        previousRange = range;
        const inputsChanged = start !== previousStart || end !== previousEnd;
        previousStart = start;
        previousEnd = end;
        if (next === this._value && !inputsChanged) return;

        this._value = next;
        start?._formatValue(next?.start ?? null);
        end?._formatValue(next?.end ?? null);
        this.rangePicker()._selectedRange.set(next ?? new DateRange<D>(null, null));
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

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  _startUpdated(date: D | null) {
    this._value = new DateRange<D>(date, this._value?.end || null);
    this.value.set(this._value);
    this.rangeChange.emit(this._value);
    this.rangePicker()._selectedRange.set(this._value);
    this.stateChanges.next();
  }

  _endUpdated(date: D | null) {
    this._value = new DateRange<D>(this._value?.start || null, date);
    this.value.set(this._value);
    this.rangeChange.emit(this._value);
    this.rangePicker()._selectedRange.set(this._value);
    this.stateChanges.next();
  }

  _rangeUpdated(range: DateRange<D>) {
    if (this.disabled() || this.readonly()) return;
    const prevStart = this._value?.start;
    this._value = range;
    this.value.set(range);
    this.rangeChange.emit(range);
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

  _handleBlur(event: FocusEvent): void {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Node | null)) {
      this._focused.set(false);
      this.touch.emit();
      this.stateChanges.next();
    }
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
    if (startInput && !this.focused && !this.disabled()) {
      startInput.focus();
    }
  }
}

let nextUniqueId = 0;
