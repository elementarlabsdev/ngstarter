import { Component, inject } from '@angular/core';
import {
  BreadcrumbItemIconDefDirective,
  BreadcrumbsGlobal,
  BreadcrumbsStore,
} from '@ngstarter-ui/components/breadcrumbs';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-breadcrumbs-global-example',
  imports: [
    BreadcrumbsGlobal,
    Button,
    Icon,
    BreadcrumbItemIconDefDirective,
    // BreadcrumbItemNameDefDirective,
    // BreadcrumbItemTitleDefDirective
  ],
  templateUrl: './breadcrumbs-global-example.html',
  styleUrl: './breadcrumbs-global-example.scss'
})
export class BreadcrumbsGlobalExample {
  private _breadcrumbsStore = inject(BreadcrumbsStore);

  constructor() {
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 1,
        name: 'Account',
        type: null
      },
      {
        id: 2,
        name: 'Settings',
        type: null
      }
    ]);
  }

  setBreadcrumbs() {
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 0,
        icon: 'fluent:home-24-regular',
        type: null
      },
      {
        id: 1,
        title: 'author',
        name: 'John D. Barrow',
        icon: 'fluent:person-24-regular',
        type: null
      },
      {
        id: 2,
        title: 'book',
        name: 'The Artful Universe',
        icon: 'fluent:book-24-regular',
        type: null
      }
    ]);

    // icons
    // this._breadcrumbsStore.setBreadcrumbs([
    //   {
    //     id: 0,
    //     icon: 'home',
    //     type: null
    //   },
    //   {
    //     id: 1,
    //     title: 'author',
    //     name: 'John D. Barrow',
    //     icon: 'person',
    //     type: null
    //   },
    //   {
    //     id: 2,
    //     title: 'book',
    //     name: 'The Artful Universe',
    //     icon: 'book',
    //     type: null
    //   }
    // ]);
  }
}
