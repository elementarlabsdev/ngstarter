import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { PrimaryColorsExample } from '../_examples/primary-colors-example/primary-colors-example';
import {
  SecondaryColorsExample
} from '../_examples/secondary-colors-example/secondary-colors-example';
import { TertiaryColorsExample } from '../_examples/tertiary-colors-example/tertiary-colors-example';
import { ErrorColorsExample } from '../_examples/error-colors-example/error-colors-example';
import { SurfaceColorsExample } from '../_examples/surface-colors-example/surface-colors-example';
import { OutlineColorsExample } from '../_examples/outline-colors-example/outline-colors-example';
import { InverseColorsExample } from '../_examples/inverse-colors-example/inverse-colors-example';
import { NeutralColorsExample } from '../_examples/neutral-colors-example/neutral-colors-example';
import { OtherColorsExample } from '../_examples/other-colors-example/other-colors-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { GreenColorsExample } from '../_examples/green-colors-example/green-colors-example';
import { BlueColorsExample } from '../_examples/blue-colors-example/blue-colors-example';
import { OrangeColorsExample } from '../_examples/orange-colors-example/orange-colors-example';
import { RedColorsExample } from '../_examples/red-colors-example/red-colors-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    PrimaryColorsExample,
    SecondaryColorsExample,
    TertiaryColorsExample,
    ErrorColorsExample,
    SurfaceColorsExample,
    OutlineColorsExample,
    InverseColorsExample,
    NeutralColorsExample,
    OtherColorsExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    GreenColorsExample,
    BlueColorsExample,
    OrangeColorsExample,
    RedColorsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
