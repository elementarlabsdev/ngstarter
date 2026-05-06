import { Component } from '@angular/core';
import {
  BasicEmojiPickerExample
} from '../_examples/basic-emoji-picker-example/basic-emoji-picker-example';
import { Playground } from '@meta/playground/playground';

@Component({
  selector: 'app-overview',
  imports: [
    BasicEmojiPickerExample,
    Playground,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
