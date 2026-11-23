import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
  NgZone,
  numberAttribute,
  output,
  viewChild,
  effect,
  computed,
  signal,
  untracked,
  linkedSignal
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Ripple } from '@ngstarter-ui/components/core';

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
  /** The initial state of the component before any user interaction. */
  Init = 0,
  /** The state representing the component when it's becoming checked. */
  Checked = 1,
  /** The state representing the component when it's becoming unchecked. */
  Unchecked = 2,
  /** The state representing the component when it's becoming indeterminate. */
  Indeterminate = 3
}

/** Change event object emitted by checkbox. */
export class CheckboxChange {
  /** The source checkbox of the event. */
  source: Checkbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

@Component({
  selector: 'ngs-checkbox',
  imports: [
    Ripple
  ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  host: {
    'class': 'ngs-checkbox',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class.ngs-checkbox-disabled]': 'isDisabled()',
    '[class.ngs-checkbox-checked]': 'checked()',
    '[class.ngs-checkbox-indeterminate]': 'indeterminate()',
    '[class.ngs-checkbox-disabled-interactive]': 'disabledInteractive()',
    '[class]': 'color() ? "ngs-" + color() : "ngs-primary"',
  },
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: Checkbox,
      multi: true,
    },
  ],
  exportAs: 'ngsCheckbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkbox implements FormCheckboxControl, Validator, AfterViewInit {
  private _ngZone = inject(NgZone);
  private _idGenerator = inject(_IdGenerator);

  readonly ariaLabel = input('', { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  readonly ariaDescribedby = input<string>('', { alias: 'aria-describedby' });
  readonly ariaExpanded = input(undefined, { alias: 'aria-expanded', transform: booleanAttribute });
  readonly ariaControls = input('', { alias: 'aria-controls' });
  readonly ariaOwns = input('', { alias: 'aria-owns' });
  readonly id = input(this._idGenerator.getId('ngs-checkbox-'));
  readonly required = input(false, { transform: booleanAttribute });
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly name = input('');
  readonly submittedValue = input('', { alias: 'value' });
  readonly disableRipple = input(false, { transform: booleanAttribute });
  readonly tabIndex = input(0, {
    transform: (value: any) => (value == null ? 0 : numberAttribute(value))
  });
  readonly color = input<string | undefined>(undefined);
  readonly disabledInteractive = input(false, { transform: booleanAttribute });

  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly interactiveDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.interactiveDisabled());

  /** @docs-private */
  setInteractiveDisabled(disabled: boolean): void {
    this.interactiveDisabled.set(disabled);
  }
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  readonly indeterminateInput = input(false, {alias: 'indeterminate'});
  readonly indeterminate = linkedSignal(this.indeterminateInput);

  readonly change = output<CheckboxChange>();
  readonly indeterminateChange = output<boolean>();

  readonly _inputElement = viewChild<ElementRef<HTMLInputElement>>('input');
  readonly _labelElement = viewChild<ElementRef<HTMLElement>>('label');

  private _currentAnimationClass = '';
  private _currentCheckState = TransitionCheckState.Init;
  private _validatorChangeFn = () => {};

  private _animationClasses = {
    uncheckedToChecked: 'ngs-checkbox--anim-unchecked-checked',
    uncheckedToIndeterminate: 'ngs-checkbox--anim-unchecked-indeterminate',
    checkedToUnchecked: 'ngs-checkbox--anim-checked-unchecked',
    checkedToIndeterminate: 'ngs-checkbox--anim-checked-indeterminate',
    indeterminateToChecked: 'ngs-checkbox--anim-indeterminate-checked',
    indeterminateToUnchecked: 'ngs-checkbox--anim-indeterminate-unchecked',
  };

  constructor() {
    effect(() => {
      this.required();
      untracked(() => this._validatorChangeFn());
    });

    effect(() => {
      const indeterminate = this.indeterminate();
      untracked(() => {
        if (this._currentCheckState === TransitionCheckState.Init) {
          return;
        }

        if (indeterminate) {
          this._transitionCheckState(TransitionCheckState.Indeterminate);
        } else {
          this._transitionCheckState(this.checked() ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
        }
        this._syncIndeterminate(indeterminate);
      });
    });

    effect(() => {
      const checked = this.checked();
      untracked(() => {
        if (this._currentCheckState === TransitionCheckState.Init) {
          return;
        }

        if (!this.indeterminate()) {
          this._transitionCheckState(checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
        }
      });
    });
  }

  get inputId(): string {
    return `${this.id()}-input`;
  }

  ngAfterViewInit() {
    this._syncIndeterminate(this.indeterminate());
  }

  focus(options?: FocusOptions) {
    this._inputElement()?.nativeElement.focus(options);
  }

  validate(control: AbstractControl<boolean>): ValidationErrors | null {
    return this.required() && control.value !== true ? { 'required': true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorChangeFn = fn;
  }

  toggle() {
    if (!this.isDisabled() && !this.readonly()) {
      this.checked.update(checked => !checked);
    }
  }

  _handleInputClick() {
    if (!this.isDisabled() && !this.readonly()) {
      if (this.indeterminate()) {
        this.indeterminate.set(false);
      }
      this.checked.set(!this.checked());
      this._emitChangeEvent();
    }
  }

  _emitChangeEvent() {
    this.change.emit(this._createChangeEvent(this.checked()));
    const inputElement = this._inputElement();
    if (inputElement) {
      inputElement.nativeElement.checked = this.checked();
    }
  }

  private _createChangeEvent(isChecked: boolean): CheckboxChange {
    const event = new CheckboxChange();
    event.source = this;
    event.checked = isChecked;
    return event;
  }

  _onInteractionEvent(event: Event) {
    event.stopPropagation();
  }

  _onBlur() {
    this.touch.emit();
  }

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let element = this._inputElement()?.nativeElement;
    if (oldState === newState || !element) {
      return;
    }
    if (this._currentAnimationClass) {
      element.classList.remove(this._currentAnimationClass);
    }
    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(oldState, newState);
    this._currentCheckState = newState;
    if (this._currentAnimationClass.length > 0) {
      element.classList.add(this._currentAnimationClass);
      const animationClass = this._currentAnimationClass;
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          element.classList.remove(animationClass);
        }, 1000);
      });
    }
  }

  private _getAnimationClassForCheckStateTransition(oldState: TransitionCheckState, newState: TransitionCheckState): string {
    switch (oldState) {
      case TransitionCheckState.Init:
        if (newState === TransitionCheckState.Checked) {
          return this._animationClasses.uncheckedToChecked;
        } else if (newState == TransitionCheckState.Indeterminate) {
          return this.checked()
            ? this._animationClasses.checkedToIndeterminate
            : this._animationClasses.uncheckedToIndeterminate;
        }
        break;
      case TransitionCheckState.Unchecked:
        return newState === TransitionCheckState.Checked
          ? this._animationClasses.uncheckedToChecked
          : this._animationClasses.uncheckedToIndeterminate;
      case TransitionCheckState.Checked:
        return newState === TransitionCheckState.Unchecked
          ? this._animationClasses.checkedToUnchecked
          : this._animationClasses.checkedToIndeterminate;
      case TransitionCheckState.Indeterminate:
        return newState === TransitionCheckState.Checked
          ? this._animationClasses.indeterminateToChecked
          : this._animationClasses.indeterminateToUnchecked;
    }
    return '';
  }

  private _syncIndeterminate(value: boolean) {
    const inputElement = this._inputElement();
    if (inputElement) {
      inputElement.nativeElement.indeterminate = value;
    }
  }

  _onInputClick(event: MouseEvent) {
    if (this.readonly()) {
      event.preventDefault();
      return;
    }
    this._handleInputClick();
  }

  _onTouchTargetClick() {
    this._handleInputClick();
    const inputElement = this._inputElement();
    if (!this.isDisabled() && inputElement) {
      inputElement.nativeElement.focus();
    }
  }

  _preventBubblingFromLabel(event: MouseEvent) {
    const labelElement = this._labelElement();
    if (!!event.target && labelElement && labelElement.nativeElement.contains(event.target as HTMLElement)) {
      event.stopPropagation();
    }
  }
}
