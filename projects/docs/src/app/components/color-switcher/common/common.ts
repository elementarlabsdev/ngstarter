import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { TabLink, TabNavBar, TabNavPanel } from '@ngstarter-ui/components/tabs';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'common',
  standalone: true,
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
  templateUrl: './common.html'
})
export class Common {}
