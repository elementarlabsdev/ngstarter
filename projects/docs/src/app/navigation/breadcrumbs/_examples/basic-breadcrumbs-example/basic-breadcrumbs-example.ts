import { Component } from '@angular/core';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter/components/breadcrumbs';

@Component({
  selector: 'app-basic-breadcrumbs-example',
  imports: [
    BreadcrumbSeparator,
    BreadcrumbItem,
    Breadcrumbs
  ],
  templateUrl: './basic-breadcrumbs-example.html',
  styleUrl: './basic-breadcrumbs-example.scss'
})
export class BasicBreadcrumbsExample {

}
