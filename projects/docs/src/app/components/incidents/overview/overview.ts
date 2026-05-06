import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicIncidentsExample } from '../_examples/basic-incidents-example/basic-incidents-example';
import {
  IncidentsShowHideDynamiclyExample
} from '../_examples/incidents-show-hide-dynamicly-example/incidents-show-hide-dynamicly-example';

@Component({
  imports: [
    Playground,
    BasicIncidentsExample,
    IncidentsShowHideDynamiclyExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
