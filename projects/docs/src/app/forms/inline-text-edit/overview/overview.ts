import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicInlineTextEditExample
} from '../_examples/basic-inline-text-edit-example/basic-inline-text-edit-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicInlineTextEditExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
