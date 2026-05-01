import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTimelineExample } from '../_examples/basic-timeline-example/basic-timeline-example';
import {
  TimelineTimestampExample
} from '../_examples/timeline-timestamp-example/timeline-timestamp-example';
import {
  TimelineWithCutsomIndicatorExample
} from '../_examples/timeline-with-cutsom-indicator-example/timeline-with-cutsom-indicator-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTimelineExample,
    TimelineTimestampExample,
    TimelineWithCutsomIndicatorExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
