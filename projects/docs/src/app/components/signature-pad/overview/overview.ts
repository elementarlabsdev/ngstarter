import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicSignaturePadExample
} from '../_examples/basic-signature-pad-example/basic-signature-pad-example';

@Component({
  imports: [
    Playground,
    BasicSignaturePadExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
