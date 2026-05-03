import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicBottomSheetExample
} from '../_examples/basic-bottom-sheet-example/basic-bottom-sheet-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicBottomSheetExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
