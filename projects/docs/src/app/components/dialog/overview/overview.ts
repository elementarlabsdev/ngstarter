import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicDialogExample } from '../_examples/basic-dialog-example/basic-dialog-example';
import { DialogSizingExample } from '../_examples/dialog-sizing-example/dialog-sizing-example';
import {
  DialogScrollableContentExample
} from '../_examples/dialog-scrollable-content-example/dialog-scrollable-content-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicDialogExample,
    DialogSizingExample,
    DialogScrollableContentExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
