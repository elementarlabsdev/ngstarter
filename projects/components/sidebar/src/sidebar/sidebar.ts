import { Component } from '@angular/core';

@Component({
  selector: 'ngs-sidebar',
  exportAs: 'ngsSidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    'class': 'ngs-sidebar',
  }
})
export class Sidebar {
}
