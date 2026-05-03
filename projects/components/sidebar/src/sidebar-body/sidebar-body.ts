import { Component } from '@angular/core';

@Component({
  selector: 'ngs-sidebar-body,ngs-sidebar-content',
  exportAs: 'ngsSidebarBody',
  templateUrl: './sidebar-body.html',
  styleUrl: './sidebar-body.scss',
  imports: [
  ],
  host: {
    'class': 'ngs-sidebar-body ngs-sidebar-content'
  }
})
export class SidebarBody {

}
