import { Component } from '@angular/core';
import {Page} from "@meta/page/page";
import {PageContentDirective} from "@meta/page/page-content.directive";
import {PageTitleDirective} from "@meta/page/page-title.directive";

@Component({
    imports: [
        Page,
        PageContentDirective,
        PageTitleDirective
    ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
