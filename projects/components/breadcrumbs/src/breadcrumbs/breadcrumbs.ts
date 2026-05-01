import { Component, TemplateRef, input, booleanAttribute, contentChild } from '@angular/core';
import { BreadcrumbItemDefDirective } from '../breadcrumb-item-def.directive';
import { BreadcrumbSeparatorDefDirective } from '../breadcrumb-separator-def.directive';
import { BreadcrumbActiveItemDefDirective } from '../breadcrumb-active-item-def.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-breadcrumbs',
  exportAs: 'ngsBreadcrumbs',
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
  host: {
    'class': 'ngs-breadcrumbs',
    '[class.last-item-as-link]': 'lastItemAsLink()'
  },
  imports: [NgTemplateOutlet]
})
export class Breadcrumbs<T> {
  itemRef = contentChild.required(BreadcrumbItemDefDirective, {
    read: TemplateRef
  });
  activeItemRef = contentChild.required(BreadcrumbActiveItemDefDirective, {
    read: TemplateRef
  });
  separatorRef = contentChild.required(BreadcrumbSeparatorDefDirective, {
    read: TemplateRef
  });
  dataSource = input<T[]>([]);
  lastItemAsLink = input(false, {
    transform: booleanAttribute
  });
}
