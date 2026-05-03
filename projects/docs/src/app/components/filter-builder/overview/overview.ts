import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicFilterBuilderExample
} from '../_examples/basic-filter-builder-example/basic-filter-builder-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicFilterBuilderExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
