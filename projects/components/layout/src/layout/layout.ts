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
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-layout',
    '[class.is-root]': 'root()'
  }
})
export class Layout {
  layoutId = input<string>(`layout-${nextId++}`);
  root = input(false, {
    transform: booleanAttribute
  });
}
