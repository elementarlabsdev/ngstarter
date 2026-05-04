import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  AutocompleteFilterExample
} from '../_examples/autocomplete-filter-example/autocomplete-filter-example';
import {
  SimpleAutocompleteExample
} from '../_examples/simple-autocomplete-example/simple-autocomplete-example';
import {
  SeparateControlsAndDisplayValuesExample
} from '../_examples/separate-controls-and-display-values-example/separate-controls-and-display-values-example';
import {
  AutoHighlightFirstPersonExample
} from '../_examples/auto-highlight-first-person-example/auto-highlight-first-person-example';
import { OptionGroupsExample } from '../_examples/option-groups-example/option-groups-example';

@Component({
  imports: [
    Playground,
    AutocompleteFilterExample,
    SimpleAutocompleteExample,
    SeparateControlsAndDisplayValuesExample,
    AutoHighlightFirstPersonExample,
    OptionGroupsExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
