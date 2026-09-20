import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTilesExample } from '../_examples/basic-tiles-example/basic-tiles-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTilesExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss',
})
export class Overview {

}
