import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-heading',
  exportAs: 'ngsSidebarHeading',
  imports: [],
  templateUrl: './sidebar-heading.html',
  styleUrl: './sidebar-heading.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ngs-sidebar-heading',
  },
})
export class SidebarHeading {
}
