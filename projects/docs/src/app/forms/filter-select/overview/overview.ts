import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { FilterTriggerExample } from '../_examples/filter-trigger-example/filter-trigger-example';
import {
  FilterTriggerCountOptionsExample
} from '../_examples/filter-trigger-count-options-example/filter-trigger-count-options-example';
import {
  SingleFilterTriggerExample
} from '../_examples/single-filter-trigger-example/single-filter-trigger-example';
import {
  CustomValueFilterTriggerExample
} from '../_examples/custom-value-filter-trigger-example/custom-value-filter-trigger-example';
import {
  ClearableFilterTriggerExample
} from '../_examples/clearable-filter-trigger-example/clearable-filter-trigger-example';
import {
  ClearableSingleFilterTriggerExample
} from '../_examples/clearable-single-filter-trigger-example/clearable-single-filter-trigger-example';

@Component({
  imports: [
    Playground,
    FilterTriggerExample,
    ClearableFilterTriggerExample,
    FilterTriggerCountOptionsExample,
    SingleFilterTriggerExample,
    ClearableSingleFilterTriggerExample,
    CustomValueFilterTriggerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
