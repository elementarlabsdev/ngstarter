import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { TabLink, TabNavBar, TabNavPanel } from '@ngstarter-ui/components/tabs';
import { RouterLink, RouterOutlet } from '@angular/router';
import {PageAsideDirective} from "@meta/page/page-aside.directive";
import {ScrollSpyBackToTop, ScrollSpyNav, ScrollSpyOn, ScrollSpyTitle} from "@ngstarter-ui/components/scroll-spy";

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    TabNavBar,
    RouterLink,
    TabLink,
    TabNavPanel,
    RouterOutlet,
    PageAsideDirective,
    ScrollSpyBackToTop,
    ScrollSpyNav,
    ScrollSpyOn,
    ScrollSpyTitle
  ],
  templateUrl: './common.html',
})
export class Common {

}
