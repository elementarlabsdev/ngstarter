import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSortExample } from '../_examples/basic-sort-example/basic-sort-example';

@Component({
  imports: [
    Playground,
    BasicSortExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
