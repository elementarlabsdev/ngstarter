import {
  Component,
  input,
  output,
  linkedSignal,
  model,
  booleanAttribute,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

const defaultColors = [
  '#35d1b3', '#08b0fe', '#8268f2', '#ae52d3', '#eb4ea3',
  '#fb811e', '#fac624', '#c2c2c2', '#4ed7ff'
];

@Component({
  selector: 'ngs-color-switcher',
  exportAs: 'ngsColorSwitcher',
  imports: [],
  templateUrl: './color-switcher.html',
  styleUrl: './color-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-brand-colors',
    '[class.is-disabled]': 'disabled()',
  }
})
export class ColorSwitcher implements FormValueControl<string | null> {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  readonly value = model<string | null>(null);

  colors = input<string[]>(defaultColors);
  selectedColor = input<string>();
  disabled = input(false, {
    transform: booleanAttribute
  });

  protected readonly currentColor = linkedSignal({
    source: () => ({ value: this.value(), selectedColor: this.selectedColor() }),
    computation: ({ value, selectedColor }, previous): string | null | undefined =>
      !previous ? value ?? selectedColor
        : value !== previous.source.value ? value
        : selectedColor,
  });

  readonly colorChange = output<string>();

  selectColor(color: string): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.value.set(color);
    this.colorChange.emit(color);
  }
}
