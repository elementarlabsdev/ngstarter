import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-divider',
  exportAs: 'ngsSidebarDivider',
  imports: [],
  templateUrl: './sidebar-divider.html',
  styleUrl: './sidebar-divider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-sidebar-divider',
  },
})
export class SidebarDivider {
}
