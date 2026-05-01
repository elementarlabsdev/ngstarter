import { Component } from '@angular/core';
import {
  BreadcrumbItem,
  BreadcrumbItemIconDirective, Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter-ui/components/breadcrumbs';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-breadcrumbs-with-icons-example',
  imports: [
    Icon,
    BreadcrumbItemIconDirective,
    BreadcrumbItem,
    BreadcrumbSeparator,
    Breadcrumbs
  ],
  templateUrl: './breadcrumbs-with-icons-example.html',
  styleUrl: './breadcrumbs-with-icons-example.scss'
})
export class BreadcrumbsWithIconsExample {

}
