import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicBadgesExample } from '../_examples/basic-badges-example/basic-badges-example';

@Component({
  imports: [
    Playground,
    BasicBadgesExample,
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
