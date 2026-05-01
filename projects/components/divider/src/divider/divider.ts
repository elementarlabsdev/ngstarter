import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-divider',
  exportAs: 'ngsDivider',
  template: '',
  styleUrl: './divider.scss',
  host: {
    'role': 'separator',
    'class': 'ngs-divider',
    '[attr.aria-orientation]': 'vertical() ? "vertical" : "horizontal"',
    '[class.ngs-divider-vertical]': 'vertical()',
    '[class.ngs-divider-horizontal]': '!vertical()',
    '[class.ngs-divider-inset]': 'inset()',
    '[class.is-fixed-height]': 'fixedHeight()',
  },
})
export class Divider {
  /** Whether the divider is vertically aligned. */
  vertical = input(false, { transform: booleanAttribute });

  /** Whether the divider is an inset divider. */
  inset = input(false, { transform: booleanAttribute });

  fixedHeight = input(false, { transform: booleanAttribute });
}
