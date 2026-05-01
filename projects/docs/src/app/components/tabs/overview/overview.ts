import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTabsExample } from '../_examples/basic-tabs-example/basic-tabs-example';
import {
  TabsWithAlignedLabelsExample
} from '../_examples/tabs-with-aligned-labels-example/tabs-with-aligned-labels-example';
import {
  TabsWithCustomLabelTemplateExample
} from '../_examples/tabs-with-custom-label-template-example/tabs-with-custom-label-template-example';
import {
  TabsWithHeadersOnTheBottomExample
} from '../_examples/tabs-with-headers-on-the-bottom-example/tabs-with-headers-on-the-bottom-example';
import { PaginatedTabsExample } from '../_examples/paginated-tabs-example/paginated-tabs-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { SortableTabsExample } from '../_examples/sortable-tabs-example/sortable-tabs-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  TabsAnimationsExample
} from '../_examples/tabs-animations-example/tabs-animations-example';

@Component({
  imports: [
    Playground,
    BasicTabsExample,
    TabsWithAlignedLabelsExample,
    TabsWithCustomLabelTemplateExample,
    TabsWithHeadersOnTheBottomExample,
    PaginatedTabsExample,
    Page,
    PageContentDirective,
    SortableTabsExample,
    PageTitleDirective,
    TabsAnimationsExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
