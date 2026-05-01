import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  model,
  numberAttribute,
  output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export class SlideToggleChange {
  constructor(
    public source: SlideToggle,
    public checked: boolean
  ) {
  }
}

let nextId = 0;

@Component({
  selector: 'ngs-slide-toggle',
  exportAs: 'ngsSlideToggle',
  standalone: true,
  imports: [],
  templateUrl: './slide-toggle.html',
  styleUrl: './slide-toggle.scss',
  host: {
    'class': 'ngs-slide-toggle',
    '[class.ngs-slide-toggle-checked]': 'checked()',
    '[class.ngs-slide-toggle-disabled]': 'disabled()',
    '[class.ngs-slide-toggle-label-before]': 'labelPosition() === "before"',
    '[attr.id]': 'id()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlideToggle),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideToggle implements ControlValueAccessor {
  private _uniqueId = `ngs-slide-toggle-${nextId++}`;

  id = input<string>(this._uniqueId);
  name = input<string | null>(null);
  labelPosition = input<'before' | 'after'>('after');
  ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });
  required = input(false, { transform: booleanAttribute });
  disabled = model(false);
  disableRipple = input(false, { transform: booleanAttribute });
  tabIndex = input(0, { transform: numberAttribute });
  hideIcon = input(false, { transform: booleanAttribute });
  color = input<string | undefined>();

  checked = model(false);

  change = output<SlideToggleChange>();
  toggleChange = output<void>();

  private _onChange = (_: any) => {};
  private _onTouched = () => {};

  constructor() {}

  writeValue(value: any): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  toggle(): void {
    this.checked.update(checked => !checked);
    this._onChange(this.checked());
    this._emitChangeEvent();
  }

  _onInputClick(event: Event): void {
    event.stopPropagation();
    this.toggle();
    this.toggleChange.emit();
  }

  private _emitChangeEvent(): void {
    this.change.emit(new SlideToggleChange(this, this.checked()));
  }

  _onInputBlur(): void {
    this._onTouched();
  }
}
