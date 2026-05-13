import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-sidebar',
  exportAs: 'ngsSidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
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
