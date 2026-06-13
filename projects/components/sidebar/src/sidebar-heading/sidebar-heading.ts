import { Component } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-heading',
  exportAs: 'ngsSidebarHeading',
  imports: [],
  templateUrl: './sidebar-heading.html',
  styleUrl: './sidebar-heading.scss',
  host: {
    class: 'ngs-sidebar-heading',
  },
})
export class SidebarHeading {
}
