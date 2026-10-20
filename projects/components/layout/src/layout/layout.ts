import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';
import { LAYOUT } from '../types';

let nextId = 0;

@Component({
  selector: 'ngs-layout',
  exportAs: 'ngsLayout',
  standalone: true,
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  providers: [
    {
      provide: LAYOUT,
      useExisting: Layout
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout',
    '[class.is-root]': 'root()',
    '[class.is-absolute]': 'absolute()'
  }
})
export class Layout {
  layoutId = input<string>(`layout-${nextId++}`);
  absolute = input(false, { transform: booleanAttribute });
  root = input(false, {
    transform: booleanAttribute
  });
}
