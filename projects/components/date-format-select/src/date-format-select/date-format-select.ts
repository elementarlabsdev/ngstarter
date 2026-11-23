import {
  Component,
  inject,
  input,
  model,
  output,
  booleanAttribute,
  OnDestroy,
  signal, viewChild, OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';
import { Select, Option, SelectChange } from '@ngstarter-ui/components/select';
import { Subject, takeUntil } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';

export type DateFormat = {
  value: string;
  name: string;
};

@Component({
  selector: 'ngs-date-format-select',
  exportAs: 'ngsDateFormatSelect',
  imports: [
    Select,
    Option
  ],
  templateUrl: './date-format-select.html',
  styleUrl: './date-format-select.scss',
  providers: [{
    provide: FormFieldControl,
    useExisting: DateFormatSelect
  }],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[attr.aria-readonly]': 'readonly() || null',
    '[id]': 'id',
    '[attr.required]': 'required() || null',
  },
})
export class DateFormatSelect implements FormFieldControl<string>, FormValueControl<string | null>, OnDestroy, OnInit {
  private static nextId = 0;

  readonly matSelect = viewChild.required(Select);

  readonly dateFormats = input<DateFormat[]>([
    { value: 'MM/dd/yyyy', name: 'MM/DD/YYYY' },
    { value: 'dd.MM.yyyy', name: 'DD.MM.YYYY' },
    { value: 'yyyy-MM-dd', name: 'YYYY-MM-DD' },
  ]);

  readonly value = model<string | null>(null);
  private readonly _focused = signal(false);
  readonly _describedBy = signal('');

  readonly stateChanges = new Subject<void>();
  readonly id = `date-format-input-${DateFormatSelect.nextId++}`;
  readonly controlType = 'date-format-input';
  readonly autofilled = false;

  get focused(): boolean {
    return this._focused();
  }

  get empty(): boolean {
    return !this.value();
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    return !!(this.invalid() || this.ngControl?.invalid) && this.touched();
  }

  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  readonly ngControl = inject(NgControl, { self: true, optional: true });
  readonly placeholderInput = input<string>('', { alias: 'placeholder' });

  get placeholder(): string {
    return this.placeholderInput();
  }

  private readonly _destroy$ = new Subject<void>();

  ngOnInit(): void {
    outputToObservable(this.matSelect().closed)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._focused.set(this.matSelect().focused);
        this.stateChanges.next();
      });
  }

  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.stateChanges.complete();
  }

  onFocus(): void {
    if (!this.focused) {
      this._focused.set(true);
      this.stateChanges.next();
    }
  }

  onBlur(): void {
    if (!this.matSelect().panelOpen()) {
      this._focused.set(false);
      this.stateChanges.next();
    }
  }

  onSelectionChange(event: SelectChange): void {
    this.value.set(event.value);
  }

  setDescribedByIds(ids: string[]): void {
    this._describedBy.set(ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.matSelect().onContainerClick(event);
    }
  }

  focus(): void {
    this.matSelect().focus();
  }
}
