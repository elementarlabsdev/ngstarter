import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicRadioExample } from '../_examples/basic-radio-example/basic-radio-example';
import { RadioOrientationExample } from '../_examples/radio-orientation-example/radio-orientation-example';
import { RadioCardExample } from '../_examples/radio-card-example/radio-card-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicRadioExample,
    RadioOrientationExample,
    RadioCardExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
