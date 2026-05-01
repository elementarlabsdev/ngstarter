import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { CircleFlagsExample } from '../_examples/circle-flags-example/circle-flags-example';
import {
  SymbolsIconsExample
} from '../_examples/material-symbols-icons-example/material-symbols-icons-example';
import { PhosphorIconsExample } from '../_examples/phosphor-icons-example/phosphor-icons-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    CircleFlagsExample,
    SymbolsIconsExample,
    PhosphorIconsExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
