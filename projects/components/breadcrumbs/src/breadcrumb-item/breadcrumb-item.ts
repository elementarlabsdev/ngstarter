import { Component } from '@angular/core';

@Component({
  selector: 'ngs-breadcrumb-item,[ngs-breadcrumb-item]',
  exportAs: 'ngsBreadcrumbItem',
  templateUrl: './breadcrumb-item.html',
  styleUrl: './breadcrumb-item.scss',
  host: {
    class: 'ngs-breadcrumb-item'
  }
})
export class BreadcrumbItem {
}
