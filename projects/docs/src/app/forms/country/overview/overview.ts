import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCountrySelectExample
} from '../_examples/basic-country-select-example/basic-country-select-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicCountrySelectExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
