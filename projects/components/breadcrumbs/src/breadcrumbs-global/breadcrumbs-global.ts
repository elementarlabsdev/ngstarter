import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  TemplateRef
} from '@angular/core';
import { Breadcrumb } from '../types';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../breadcrumb-item/breadcrumb-item';
import { BreadcrumbSeparator } from '../breadcrumb-separator/breadcrumb-separator';
import { BreadcrumbTitle } from '../breadcrumb-title/breadcrumb-title';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { BreadcrumbsStore } from '../breadcrumbs.store';
import { BreadcrumbItemIconDefDirective } from '../breadcrumb-item-icon-def.directive';
import { BreadcrumbItemIconDirective } from '../breadcrumb-item-icon.directive';
import { Icon } from '@ngstarter-ui/components/icon';
import { NgTemplateOutlet } from '@angular/common';
import {
  BreadcrumbItemNameDefDirective
} from '../breadcrumb-item-name-def.directive';
import {
  BreadcrumbItemTitleDefDirective
} from '../breadcrumb-item-title-def.directive';

@Component({
  selector: 'ngs-breadcrumbs-global',
  exportAs: 'ngsBreadcrumbsGlobal',
  imports: [
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbTitle,
    Breadcrumbs,
    RouterLink,
    BreadcrumbItemIconDirective,
    Icon,
    NgTemplateOutlet
  ],
  templateUrl: './breadcrumbs-global.html',
  styleUrl: './breadcrumbs-global.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-breadcrumbs-global',
    ngSkipHydration: 'true'
  }
})
export class BreadcrumbsGlobal {
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  protected itemIconDef = contentChild(BreadcrumbItemIconDefDirective);
  protected itemNameDef = contentChild(BreadcrumbItemNameDefDirective);
  protected itemTitleDef = contentChild(BreadcrumbItemTitleDefDirective);

  breadcrumbs = computed<Breadcrumb[]>(() => {
    return this._breadcrumbsStore.breadcrumbs();
  });
  lastItemAsLink = input(false, {
    transform: booleanAttribute
  });
  separator = input('/');

  get iconTemplateRef(): TemplateRef<any> {
    return this.itemIconDef()?.templateRef as TemplateRef<any>;
  }

  get titleTemplateRef(): TemplateRef<any> {
    return this.itemTitleDef()?.templateRef as TemplateRef<any>;
  }

  get nameTemplateRef(): TemplateRef<any> {
    return this.itemNameDef()?.templateRef as TemplateRef<any>;
  }
}
