import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-breadcrumb-title',
  exportAs: 'ngsBreadcrumbTitle',
  imports: [],
  templateUrl: './breadcrumb-title.html',
  styleUrl: './breadcrumb-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'ngs-breadcrumb-title',
  }
})
export class BreadcrumbTitle {

}
