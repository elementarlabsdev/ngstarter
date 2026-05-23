import { Component, inject } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { TabLink, TabNavBar, TabNavPanel } from '@ngstarter-ui/components/tabs';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-line-chart-common',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    TabNavBar,
    RouterLink,
    TabLink,
    TabNavPanel,
    RouterOutlet
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
})
export class Common {
  private readonly router = inject(Router);

  protected get pageTitle(): string {
    const path = this.router.url.split(/[?#]/)[0];

    return path.endsWith('/api') ? 'Line Chart API' : 'Line micro chart';
  }
}
