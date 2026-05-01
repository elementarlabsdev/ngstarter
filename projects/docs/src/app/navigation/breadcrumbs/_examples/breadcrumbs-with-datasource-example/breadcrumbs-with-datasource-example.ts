import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BreadcrumbActiveItemDefDirective,
  BreadcrumbItem,
  BreadcrumbItemDefDirective, Breadcrumbs,
  BreadcrumbSeparator, BreadcrumbSeparatorDefDirective
} from '@ngstarter-ui/components/breadcrumbs';

@Component({
  selector: 'app-breadcrumbs-with-datasource-example',
  imports: [
    RouterLink,
    BreadcrumbSeparator,
    BreadcrumbItem,
    BreadcrumbItemDefDirective,
    BreadcrumbSeparatorDefDirective,
    BreadcrumbActiveItemDefDirective,
    Breadcrumbs
  ],
  templateUrl: './breadcrumbs-with-datasource-example.html',
  styleUrl: './breadcrumbs-with-datasource-example.scss'
})
export class BreadcrumbsWithDatasourceExample {
  dataSource = [
    {
      name: 'Home',
      link: '/'
    },
    {
      name: 'Breadcrumbs'
    }
  ];
}
