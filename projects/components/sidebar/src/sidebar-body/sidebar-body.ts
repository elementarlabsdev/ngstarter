import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-body,ngs-sidebar-content',
  exportAs: 'ngsSidebarBody',
  templateUrl: './sidebar-body.html',
  styleUrl: './sidebar-body.scss',
  imports: [
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-sidebar-body ngs-sidebar-content'
  }
})
export class SidebarBody {

}
