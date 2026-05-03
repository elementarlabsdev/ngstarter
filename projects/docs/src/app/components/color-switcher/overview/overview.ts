import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicBrandColorsExample
} from '../_examples/basic-brand-colors-example/basic-brand-colors-example';
import {
  BrandColorsCustomColorsExample
} from '../_examples/brand-colors-custom-colors-example/brand-colors-custom-colors-example';
import {
  BrandColorsAsFormControlExample
} from '../_examples/brand-colors-as-form-control-example/brand-colors-as-form-control-example';
import {
  BrandColorsDisabledExample
} from '../_examples/brand-colors-disabled-example/brand-colors-disabled-example';

@Component({
  imports: [
    Playground,
    BasicBrandColorsExample,
    BrandColorsCustomColorsExample,
    BrandColorsAsFormControlExample,
    BrandColorsDisabledExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
