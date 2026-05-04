import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSegmentedExample } from '../_examples/basic-segmented-example/basic-segmented-example';
import { SegmentedSizesExample } from '../_examples/segmented-sizes-example/segmented-sizes-example';
import {
  SegmentedDisabledExample
} from '../_examples/segmented-disabled-example/segmented-disabled-example';
import {
  SegmentedWithIconsExample
} from '../_examples/segmented-with-icons-example/segmented-with-icons-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  SegmentedIconsOnlyExample
} from '../_examples/segmented-icons-only-example/segmented-icons-only-example';
import {
  SegmentedFormControlExample
} from '../_examples/segmented-form-control-example/segmented-form-control-example';
import {
  SegmentedNgModelExample
} from '../_examples/segmented-ng-model-example/segmented-ng-model-example';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSegmentedExample,
    SegmentedSizesExample,
    SegmentedDisabledExample,
    SegmentedWithIconsExample,
    SegmentedIconsOnlyExample,
    SegmentedFormControlExample,
    SegmentedNgModelExample,
    Tab,
    TabGroup,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
