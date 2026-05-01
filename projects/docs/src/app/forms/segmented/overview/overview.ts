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
import { Tab, TabGroup } from '@ngstarter/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicSegmentedExample,
    SegmentedSizesExample,
    SegmentedDisabledExample,
    SegmentedWithIconsExample,
    Page,
    PageContentDirective,
    SegmentedIconsOnlyExample,
    SegmentedFormControlExample,
    SegmentedNgModelExample,
    Tab,
    TabGroup,
    PageTitleDirective,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  segmentedProperties = [
    {
      name: 'value',
      description: 'Sets a value, manually',
      type: 'any',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Disable a control',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'size',
      description: 'Control size',
      type: "SegmentedTriggerSize: 'sm' | 'default' | 'lg' | string",
      default: 'default'
    }
  ];

  segmentedEvents = [
    {
      name: 'valueChange',
      description: 'Executed when a selected value changed'
    }
  ];

  segmentedButtonProperties = [
    {
      name: 'value*',
      description: 'Value of a button',
      type: 'any',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Disable a button',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'iconOnly',
      description: 'Hide text and show icon only',
      type: 'boolean',
      default: 'false'
    }
  ];
}
