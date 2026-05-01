import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicRadioExample } from '../_examples/basic-radio-example/basic-radio-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { RadioCardExample } from '../_examples/radio-card-example/radio-card-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicRadioExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    RadioCardExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
