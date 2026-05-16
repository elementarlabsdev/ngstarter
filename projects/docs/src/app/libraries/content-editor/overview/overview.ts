import { Component } from '@angular/core';
import {Page} from "@meta/page/page";
import {PageContentDirective} from "@meta/page/page-content.directive";
import {PageTitleDirective} from "@meta/page/page-title.directive";
import {RouterLink, RouterOutlet} from "@angular/router";
import {TabLink, TabNavBar, TabNavPanel} from "@ngstarter-ui/components/tabs";

@Component({
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
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
