import { booleanAttribute, Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-sidebar',
  exportAs: 'ngsSidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-sidebar',
    '[class.only-compact]': 'onlyCompact()'
  }
})
export class Sidebar {
  onlyCompact = input(false, {
    transform: booleanAttribute
  });
}
