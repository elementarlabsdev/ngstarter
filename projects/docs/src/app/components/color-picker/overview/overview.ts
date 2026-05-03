import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicColorPickerExample
} from '../_examples/basic-color-picker-example/basic-color-picker-example';
import {
  ColorPickerWithPopoverExample
} from '../_examples/color-picker-with-popover-example/color-picker-with-popover-example';
import {
  InputWithColorPickerExample
} from '../_examples/input-with-color-picker-example/input-with-color-picker-example';

@Component({
  imports: [
    Playground,
    BasicColorPickerExample,
    ColorPickerWithPopoverExample,
    InputWithColorPickerExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
