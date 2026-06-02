import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSelectExample } from '../_examples/basic-select-example/basic-select-example';
import { GetSetValueExample } from '../_examples/get-set-value-example/get-set-value-example';
import {
  FormFieldFeaturesExample
} from '../_examples/form-field-features-example/form-field-features-example';
import { DisabledExample } from '../_examples/disabled-example/disabled-example';
import { ResettingValueExample } from '../_examples/resetting-value-example/resetting-value-example';
import {
  GroupsOfOptionsExample
} from '../_examples/groups-of-options-example/groups-of-options-example';
import {
  MultipleSelectionExample
} from '../_examples/multiple-selection-example/multiple-selection-example';
import { CustomTriggerExample } from '../_examples/custom-trigger-example/custom-trigger-example';
import { SelectSearchExample } from '../_examples/select-search-example/select-search-example';
import {
  ClearableSelectExample
} from '../_examples/clearable-select-example/clearable-select-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicSelectExample,
    GetSetValueExample,
    FormFieldFeaturesExample,
    DisabledExample,
    ResettingValueExample,
    ClearableSelectExample,
    GroupsOfOptionsExample,
    MultipleSelectionExample,
    CustomTriggerExample,
    SelectSearchExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
