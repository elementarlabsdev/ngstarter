import { Component } from '@angular/core';
import {
  BreadcrumbItem,
  BreadcrumbItemIconDirective, Breadcrumbs, BreadcrumbSeparator,
  BreadcrumbTitle
} from '@ngstarter/components/breadcrumbs';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-breadcrumbs-with-titles-example',
  imports: [
    BreadcrumbItemIconDirective,
    Icon,
    BreadcrumbTitle,
    BreadcrumbSeparator,
    BreadcrumbItem,
    Breadcrumbs
  ],
  templateUrl: './breadcrumbs-with-titles-example.html',
  styleUrl: './breadcrumbs-with-titles-example.scss'
})
export class BreadcrumbsWithTitlesExample {

}
