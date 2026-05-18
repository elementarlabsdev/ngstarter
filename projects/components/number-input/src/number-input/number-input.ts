import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DoCheck,
  ElementRef, forwardRef,
  inject, Input, input,
  numberAttribute,
  OnDestroy, Optional,
  output, Self,
  TemplateRef,
  viewChild,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
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
export class NumberInput implements FormFieldControl<any>, ControlValueAccessor, OnDestroy, DoCheck {
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

  min = input(undefined, {
    transform: numberAttribute
  });
  max = input(undefined, {
    transform: numberAttribute
  });
  step = input(1, {
    transform: numberAttribute
  });
  readonly = input(false, {
    transform: booleanAttribute
  });

  disabledInput = input(false, {
    transform: booleanAttribute,
    alias: 'disabled'
  });
  get disabled(): boolean {
    return this.disabledInput() || this._disabled();
  }
  private _disabled = signal(false);

  requiredInput = input(false, {
    transform: booleanAttribute,
    alias: 'required'
  });
  get required(): boolean {
    return this.requiredInput() || this._required();
  }
  private _required = signal(false);

  readonly valueChange = output<number|undefined>();

  static nextId = 0;
  private _value = signal<number | undefined>(undefined);
  controlType?: string | undefined;
  autofilled?: boolean | undefined;
  userAriaDescribedBy?: string | undefined;
  stateChanges = new Subject<void>();
  focused = false;
  private _focused = signal(false);
  touched = false;
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
    const value = this._value();
    return value === undefined || value === null || value as any === '';
  });

  _placeholder = input<string>('', { alias: 'placeholder' });
  get placeholder(): string {
    return this._placeholder();
  }

  constructor(
    @Optional() @Self() public ngControl: NgControl,
  ) {
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    effect(() => {
      this.id = this._id();
      this.focused = this._focused();
      this.errorState = this._errorState();
      this.empty = this._empty();
      this.shouldLabelFloat = this._shouldLabelFloat();
      this.stateChanges.next();
    });

    effect(() => {
      const value = this._value();

      if (this._input()) {
        this._input().nativeElement.value = (value === undefined || value === null) ? '' : value;
      }
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
      this.touched = true;
      this._focused.set(false);
      this.onTouched();
      this.stateChanges.next();
    }
  }

  set value(value: number | undefined) {
    if (value !== this._value()) {
      this._value.set(value);
      this.stateChanges.next();
    }
  }
  get value(): number | undefined {
    return this._value();
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

  onChange: any = () => {};
  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(coerceBooleanProperty(isDisabled));
  }

  writeValue(value: any): void {
    this.value = value;
  }

  decrease(event: MouseEvent, input: HTMLInputElement) {
    event.preventDefault();
    event.stopPropagation();
    let value = this._value() ?? 0;
    value -= this.step();
    this._value.set(value);
    this._emitEvent();
  }

  increase(event: MouseEvent, input: HTMLInputElement) {
    event.preventDefault();
    event.stopPropagation();
    let value = this._value() ?? 0;
    value += this.step();
    this._value.set(value);
    this._emitEvent();
  }

  isDecreaseDisabled() {
    const value = this._value();

    if (this.min() === undefined) {
      return false;
    }

    return (value !== undefined && value <= (this.min() as number)) || this.readonly() || this.disabled;
  }

  isIncreaseDisabled() {
    const value = this._value();

    if (this.max() === undefined) {
      return false;
    }

    return (value !== undefined && value >= (this.max() as number)) || this.readonly() || this.disabled;
  }

  inputChange(event: any) {
    const inputValue = event.target.value;
    const value = inputValue === '' ? undefined : +inputValue;
    this._value.set(value);
    this._emitEvent();
  }

  private _emitEvent() {
    const value = this._value();

    this.onChange(value);
    this.valueChange.emit(value);
    this.updateErrorState();
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
    let newState = !!(this.ngControl?.invalid) && this.touched;

    if (parent) {
      newState = !!(this.ngControl?.invalid) && (this.touched || parent.submitted);
    }

    if (oldState !== newState) {
      this._errorState.set(newState);
      this.stateChanges.next();
    }
  }
}
