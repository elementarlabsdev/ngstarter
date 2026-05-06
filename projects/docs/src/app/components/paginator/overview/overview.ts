import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPaginatorExample } from '../_examples/basic-paginator-example/basic-paginator-example';
import {
  ConfigurablePaginatorExample
} from '../_examples/configurable-paginator-example/configurable-paginator-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicPaginatorExample,
    ConfigurablePaginatorExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
