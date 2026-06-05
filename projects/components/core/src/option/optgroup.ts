import { Component, input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'ngs-optgroup',
  exportAs: 'ngsOptgroup',
  template: `
    <span class="ngs-optgroup-label">{{ label() }}</span>
    <ng-content select="ngs-option"></ng-content>
  `,
  styles: [`
    :host {
      display: block;
      --ngs-optgroup-label-padding: var(--ngs-dropdown-item-padding, 0 0.75rem);
      --ngs-optgroup-label-height: var(--ngs-dropdown-height, var(--option-height, 48px));
      --ngs-optgroup-label-font-size: var(--ngs-font-size-xs, 0.75rem);
      --ngs-optgroup-label-font-weight: 600;
      --ngs-optgroup-label-color: var(--ngs-color-on-surface-variant, rgba(0, 0, 0, 0.54));
    }
    .ngs-optgroup-label {
      display: flex;
      align-items: center;
      padding: var(--ngs-optgroup-label-padding);
      height: var(--ngs-optgroup-label-height);
      font-size: var(--ngs-optgroup-label-font-size);
      font-weight: var(--ngs-optgroup-label-font-weight);
      color: var(--ngs-optgroup-label-color);
      text-transform: uppercase;
    }
  `],
  host: {
    'class': 'ngs-optgroup',
    '[class.ngs-optgroup-disabled]': 'disabled()',
    '[attr.role]': '"group"',
    '[attr.aria-disabled]': 'disabled().toString()',
    '[attr.aria-labelledby]': 'id',
  }
})
export class Optgroup {
  label = input<string>();
  disabled = input(false, { transform: booleanAttribute });
  id = `ngs-optgroup-${Math.random().toString(36).substr(2, 9)}`;
}
