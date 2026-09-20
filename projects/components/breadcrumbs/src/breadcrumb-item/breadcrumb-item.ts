import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-breadcrumb-item,[ngs-breadcrumb-item]',
  exportAs: 'ngsBreadcrumbItem',
  templateUrl: './breadcrumb-item.html',
  styleUrl: './breadcrumb-item.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ngs-breadcrumb-item'
  }
})
export class BreadcrumbItem {
}
