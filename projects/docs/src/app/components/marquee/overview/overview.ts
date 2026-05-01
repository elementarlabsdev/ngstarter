import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import { BasicMarqueeExample } from '../_examples/basic-marquee-example/basic-marquee-example';
import { MarqueeReverseExample } from '../_examples/marquee-reverse-example/marquee-reverse-example';
import {
  MarqueePauseOnHoverExample
} from '../_examples/marquee-pause-on-hover-example/marquee-pause-on-hover-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicMarqueeExample,
    MarqueeReverseExample,
    MarqueePauseOnHoverExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
