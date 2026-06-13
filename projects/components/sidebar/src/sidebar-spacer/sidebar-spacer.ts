import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-spacer',
  exportAs: 'ngsSidebarSpacer',
  imports: [],
  templateUrl: './sidebar-spacer.html',
  styleUrl: './sidebar-spacer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-sidebar-spacer',
  },
})
export class SidebarSpacer {
}
