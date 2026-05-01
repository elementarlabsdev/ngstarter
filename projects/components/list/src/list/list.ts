import { Component, input, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-list',
  exportAs: 'ngsList',
  templateUrl: './list.html',
  styleUrl: './list.scss',
  host: {
    'class': 'ngs-list',
    '[attr.aria-disabled]': 'disabled()',
    '[class.ngs-list-disabled]': 'disabled()',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List {
  disabled = input(false, {
    transform: booleanAttribute
  });

  disableRipple = input(false, {
    transform: booleanAttribute
  });
}
