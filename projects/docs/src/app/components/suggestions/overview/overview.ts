import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicSuggestionsExample
} from '../_examples/basic-suggestions-example/basic-suggestions-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSuggestionsExample,
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
