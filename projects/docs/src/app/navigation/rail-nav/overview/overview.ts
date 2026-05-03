import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicRailNavExample } from '../_examples/basic-rail-nav-example/basic-rail-nav-example';
import {
  RailNavCustomizationExample
} from '../_examples/rail-nav-customization-example/rail-nav-customization-example';

@Component({
  imports: [
    Playground,
    BasicRailNavExample,
    RailNavCustomizationExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
