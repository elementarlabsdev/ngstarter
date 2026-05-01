import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCheckboxesExample
} from '../_examples/basic-checkboxes-example/basic-checkboxes-example';
import {
  CheckboxGroupExample
} from '../_examples/checkbox-group-example/checkbox-group-example';
import {
  CheckboxDescriptionExample
} from '../_examples/checkbox-description-example/checkbox-description-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicCheckboxesExample,
    CheckboxGroupExample,
    CheckboxDescriptionExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
