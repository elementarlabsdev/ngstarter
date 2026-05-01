import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
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
import { Tab, TabGroup } from '@ngstarter/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicBrandColorsExample,
    BrandColorsCustomColorsExample,
    BrandColorsAsFormControlExample,
    BrandColorsDisabledExample,
    Tab,
    TabGroup,
    PageTitleDirective,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
