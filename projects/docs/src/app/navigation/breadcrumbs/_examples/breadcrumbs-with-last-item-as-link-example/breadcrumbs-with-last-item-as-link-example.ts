import { Component } from '@angular/core';
import {
  BreadcrumbItem,
  BreadcrumbItemIconDirective, Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter-ui/components/breadcrumbs';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-breadcrumbs-with-last-item-as-link-example',
  imports: [
    BreadcrumbItemIconDirective,
    Icon,
    BreadcrumbItem,
    BreadcrumbSeparator,
    Breadcrumbs
  ],
  templateUrl: './breadcrumbs-with-last-item-as-link-example.html',
  styleUrl: './breadcrumbs-with-last-item-as-link-example.scss'
})
export class BreadcrumbsWithLastItemAsLinkExample {

}
