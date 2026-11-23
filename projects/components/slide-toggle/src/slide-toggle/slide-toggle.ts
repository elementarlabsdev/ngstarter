import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  numberAttribute,
  output,
  viewChild,
  ElementRef
} from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideToggle implements FormCheckboxControl {
  private _uniqueId = `ngs-slide-toggle-${nextId++}`;

  id = input<string>(this._uniqueId);
  name = input('');
  labelPosition = input<'before' | 'after'>('after');
  ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });
  required = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  disableRipple = input(false, { transform: booleanAttribute });
  tabIndex = input(0, { transform: numberAttribute });
  hideIcon = input(false, { transform: booleanAttribute });
  color = input<string | undefined>();

  checked = model(false);

  change = output<SlideToggleChange>();
  toggleChange = output<void>();

  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();
  private readonly nativeInput = viewChild.required<ElementRef<HTMLInputElement>>('input');

  focus(options?: FocusOptions): void {
    this.nativeInput().nativeElement.focus(options);
  }

  toggle(): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.checked.update(checked => !checked);
    this._emitChangeEvent();
  }

  _onInputClick(event: Event): void {
    event.stopPropagation();
    if (this.readonly()) {
      (event.target as HTMLInputElement).checked = this.checked();
      return;
    }
    this.toggle();
    this.toggleChange.emit();
  }

  private _emitChangeEvent(): void {
    this.change.emit(new SlideToggleChange(this, this.checked()));
  }

  _onInputBlur(): void {
    this.touch.emit();
  }
}
