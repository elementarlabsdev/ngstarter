import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DoCheck,
  ElementRef, forwardRef,
  inject, input, model,
  numberAttribute,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { FormValueControl, transformedValue } from '@angular/forms/signals';
import { DecreaseControlDirective } from '../decrease-control.directive';
import { IncreaseControlDirective } from '../increase-control.directive';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';
import { Subject } from 'rxjs';
import { Ripple } from '@ngstarter-ui/components/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-number-input',
  exportAs: 'ngsNumberInput',
  imports: [
    Ripple,
    NgTemplateOutlet
  ],
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => NumberInput),
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-input.html',
  styleUrl: './number-input.scss',
  host: {
    'class': 'ngs-number-input',
    '[class.floating]': 'shouldLabelFloat',
    'id': 'id'
  }
})
export class NumberInput implements FormFieldControl<number | undefined>, FormValueControl<number | null | undefined>, OnDestroy, DoCheck {
  private _parentForm = inject(NgForm, {
    optional: true,
  });
  private _parentFormGroup = inject(FormGroupDirective, {
    optional: true,
  });
  private _elementRef = inject(ElementRef);
  readonly disableAutomaticLabeling: boolean = false;

  private _input = viewChild.required<ElementRef>('input');
  readonly _decreaseControlRef = contentChild<DecreaseControlDirective>(DecreaseControlDirective);
  readonly _increaseControlRef = contentChild<IncreaseControlDirective>(IncreaseControlDirective);

  min = input<number | undefined, unknown>(undefined, {
    transform: value => value == null ? undefined : numberAttribute(value)
  });
  max = input<number | undefined, unknown>(undefined, {
    transform: value => value == null ? undefined : numberAttribute(value)
  });
  step = input(1, {
    transform: numberAttribute
  });
  readonly = input(false, {
    transform: booleanAttribute
  });

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();
  readonly ngControl = inject(NgControl, { self: true, optional: true });

  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  static nextId = 0;
  readonly value = model<number | null | undefined>(null);
  protected readonly rawValue = transformedValue(this.value, {
    parse: (value: string) => {
      const number = Number(value);
      return value === '' ? { value: null } : Number.isFinite(number)
        ? { value: number }
        : { error: { kind: 'parse', message: 'Enter a valid number.' } };
    },
    format: value => value?.toString() ?? '',
  });
  controlType?: string | undefined;
  autofilled?: boolean | undefined;
  userAriaDescribedBy?: string | undefined;
  stateChanges = new Subject<void>();
  focused = false;
  private _focused = signal(false);
  errorState = false;
  private _errorState = signal(false);

  id = '';
  private _id = signal(`ngs-number-input${NumberInput.nextId++}`);

  shouldLabelFloat = false;
  private _shouldLabelFloat = computed(() => {
    return this._focused() || !this._empty();
  });

  empty = true;
  private _empty = computed(() => {
    const value = this.value();
    return value == null;
  });

  _placeholder = input<string>('', { alias: 'placeholder' });
  get placeholder(): string {
    return this._placeholder();
  }

  constructor() {
    effect(() => {
      this.id = this._id();
      this.focused = this._focused();
      this.errorState = this._errorState();
      this.empty = this._empty();
      this.shouldLabelFloat = this._shouldLabelFloat();
      this.stateChanges.next();
    });
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  @HostListener('focusin')
  onFocusIn() {
    if (!this._focused()) {
      this._focused.set(true);
      this.stateChanges.next();
    }
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this._focused.set(false);
      this.touch.emit();
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  protected get _decreaseControlTemplateRef() {
    return this._decreaseControlRef()?.templateRef as TemplateRef<any>;
  }

  protected get _increaseControlTemplateRef() {
    return this._increaseControlRef()?.templateRef as TemplateRef<any>;
  }

  decrease(event: MouseEvent, input: HTMLInputElement) {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    let value = this.value() ?? 0;
    value -= this.step();
    this.value.set(value);
  }

  increase(event: MouseEvent, input: HTMLInputElement) {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || this.readonly()) return;
    let value = this.value() ?? 0;
    value += this.step();
    this.value.set(value);
  }

  isDecreaseDisabled(): boolean {
    const value = this.value();
    const min = this.min();
    return this.disabled() || this.readonly() || (value != null && min != null && value <= min);
  }

  isIncreaseDisabled(): boolean {
    const value = this.value();
    const max = this.max();
    return this.disabled() || this.readonly() || (value != null && max != null && value >= max);
  }

  protected inputChange(input: HTMLInputElement): void {
    if (this.disabled() || this.readonly()) return;
    this.rawValue.set(input.validity.badInput ? 'NaN' : input.value);
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  focus(): void {
    this._input().nativeElement.focus();
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.focus();
    }
  }

  private updateErrorState() {
    const parent = this._parentFormGroup || this._parentForm;
    let oldState = this._errorState();
    let newState = !!(this.invalid() || this.ngControl?.invalid) && this.touched();

    if (parent) {
      newState = !!(this.invalid() || this.ngControl?.invalid) && (this.touched() || parent.submitted);
    }

    if (oldState !== newState) {
      this._errorState.set(newState);
      this.stateChanges.next();
    }
  }
}
