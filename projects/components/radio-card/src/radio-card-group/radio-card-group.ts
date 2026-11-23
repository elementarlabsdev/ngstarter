import { booleanAttribute, Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'ngs-radio-card-group',
  exportAs: 'ngsRadioCardGroup',
  templateUrl: './radio-card-group.html',
  styleUrl: './radio-card-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-radio-card-group',
    '[class.is-disabled]': 'disabled()'
  }
})
export class RadioCardGroup implements FormValueControl<any> {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  readonly value = model<any>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  selectValue(value: any): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.value.set(value);
  }
}
