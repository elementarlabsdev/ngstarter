import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-breadcrumb-separator',
  exportAs: 'ngsBreadcrumbSeparator',
  templateUrl: './breadcrumb-separator.html',
  styleUrl: './breadcrumb-separator.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ngs-breadcrumb-separator'
  }
})
export class BreadcrumbSeparator {
}
