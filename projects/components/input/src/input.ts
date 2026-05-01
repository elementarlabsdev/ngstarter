import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  OnInit,
  DoCheck,
  input,
  signal,
  computed,
  effect,
  forwardRef,
  DestroyRef,
} from '@angular/core';
import { NgControl, NgForm, FormGroupDirective } from '@angular/forms';
import { FormFieldControl } from '@ngstarter-ui/components/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AUTOFOCUSABLE, ErrorStateMatcher } from '@ngstarter-ui/components/core';

@Directive({
  selector: 'input[ngsInput], textarea[ngsInput]',
  exportAs: 'ngsInput',
  host: {
    'class': 'ngs-input',
    '[attr.id]': 'id',
    '[attr.placeholder]': 'placeholder',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.readonly]': 'readonly() || null',
    '[class.ngs-input-floating]': 'shouldLabelFloat',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(input)': 'onInput($event)',
  },
  providers: [
    {
      provide: FormFieldControl,
      useExisting: forwardRef(() => Input)
    },
    {
      provide: AUTOFOCUSABLE,
      useExisting: forwardRef(() => Input)
    }
  ]
})
export class Input implements OnInit, DoCheck, FormFieldControl<string> {
  protected elementRef = inject(ElementRef);
  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly stateChanges = signal<void>(undefined);
  private _destroyRef = inject(DestroyRef);
  private _defaultErrorStateMatcher = inject(ErrorStateMatcher);
  private _parentForm = inject(NgForm, { optional: true });
  private _parentFormGroup = inject(FormGroupDirective, { optional: true });

  _id = input<string>(`ngs-input-${nextUniqueId++}`, { alias: 'id' });
  get id(): string { return this._id(); }
  _placeholder = input<string>('', { alias: 'placeholder' });
  get placeholder(): string { return this._placeholder(); }
  _required = input(false, { transform: booleanAttribute, alias: 'required' });
  get required(): boolean { return this._required(); }
  _disabled = input<boolean, any>(false, { transform: booleanAttribute, alias: 'disabled' });
  get disabled(): boolean { return this._disabled(); }
  readonly = input(false, { transform: booleanAttribute });

  errorStateMatcher = input<ErrorStateMatcher>();

  private _value = signal('');
  get value(): string {
    return this._value();
  }
  set value(value: string) {
    this._value.set(value);
    this.elementRef.nativeElement.value = value;
  }

  focusedValue = false;
  private _focused = signal(false);
  get focused(): boolean { return this._focused(); }

  errorStateValue = false;
  private _errorState = signal(false);
  get errorState(): boolean { return this._errorState(); }

  isRequired = computed(() => {
    if (this._required()) {
      return true;
    }

    const control = this.ngControl?.control;

    if (control && control.validator) {
      const validator = control.validator({} as any);

      if (validator && validator['required']) {
        return true;
      }
    }

    return false;
  });

  emptyValue = true;
  private _empty = computed(() => !this._value());
  get empty(): boolean { return this._empty(); }

  shouldLabelFloatValue = false;
  private _shouldLabelFloat = computed(() => {
    return !!this._value() || this._focused();
  });
  get shouldLabelFloat(): boolean { return this._shouldLabelFloat(); }

  constructor() {
    effect(() => {
      this.focusedValue = this._focused();
      this.errorStateValue = this._errorState();
      this.emptyValue = this._empty();
      this.shouldLabelFloatValue = this._shouldLabelFloat();
    });
  }

  ngOnInit() {
    this._value.set(this.elementRef.nativeElement.value);
    this.ngControl?.statusChanges?.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      this.updateErrorState();
    });
  }

  ngDoCheck() {
    if (this._value() !== this.elementRef.nativeElement.value) {
      this._value.set(this.elementRef.nativeElement.value);
    }
    this.updateErrorState();
  }

  private updateErrorState() {
    const oldState = this._errorState();
    const parent = this._parentFormGroup || this._parentForm;
    const matcher = this.errorStateMatcher() || this._defaultErrorStateMatcher;
    const control = this.ngControl ? this.ngControl.control as any : null;
    const newState = matcher.isErrorState(control, parent);

    if (newState !== oldState) {
      this._errorState.set(newState);
    }
  }

  onFocus() {
    this._focused.set(true);
  }

  onBlur() {
    this._focused.set(false);
    this.updateErrorState();
  }

  onInput(event: Event) {
    this._value.set((event.target as HTMLInputElement).value);
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}

let nextUniqueId = 0;
