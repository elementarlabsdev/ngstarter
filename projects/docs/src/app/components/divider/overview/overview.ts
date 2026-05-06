import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { DividerOverviewExample } from '../_examples/divider-overview-example/divider-overview-example';
import { TextDividerExample } from '../_examples/text-divider-example/text-divider-example';

@Component({
  imports: [
    Playground,
    DividerOverviewExample,
    TextDividerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
