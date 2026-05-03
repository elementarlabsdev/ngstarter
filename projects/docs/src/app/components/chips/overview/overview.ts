import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicChipsExample } from '../_examples/basic-chips-example/basic-chips-example';
import {
  ChipsWithInputExample
} from '../_examples/chips-with-input-example/chips-with-input-example';
import {
  ChipsAutocompleteExample
} from '../_examples/chips-autocomplete-example/chips-autocomplete-example';
import {
  ChipsWithIconsExample
} from '../_examples/chips-with-icons-example/chips-with-icons-example';
import {
  ChipsDragAndDropExample
} from '../_examples/chips-drag-and-drop-example/chips-drag-and-drop-example';
import { StackedChipsExample } from '../_examples/stacked-chips-example/stacked-chips-example';
import {
  ChipsAppearanceExample
} from '../_examples/chips-appearance-example/chips-appearance-example';

@Component({
  imports: [
    Playground,
    BasicChipsExample,
    ChipsWithInputExample,
    ChipsAutocompleteExample,
    ChipsWithIconsExample,
    ChipsDragAndDropExample,
    StackedChipsExample,
    ChipsAppearanceExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
