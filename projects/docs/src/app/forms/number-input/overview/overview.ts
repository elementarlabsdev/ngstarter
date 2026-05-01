import { Component, model } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicNumberInputExample
} from '../_examples/basic-number-input-example/basic-number-input-example';
import {
  NumberInputCustomControlsExample
} from '../_examples/number-input-custom-controls-example/number-input-custom-controls-example';
import {
  NumberInputMinMaxExample
} from '../_examples/number-input-min-max-example/number-input-min-max-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicNumberInputExample,
    NumberInputCustomControlsExample,
    NumberInputMinMaxExample,
    Page,
    PageContentDirective,
    Tab,
    TabGroup,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
