import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TabLink, TabNavBar, TabNavPanel } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-filter-select-common',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    RouterLink,
    RouterOutlet,
    TabLink,
    TabNavBar,
    TabNavPanel
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
})
export class Common {

}
