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
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicColorPickerExample,
    ColorPickerWithPopoverExample,
    InputWithColorPickerExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
