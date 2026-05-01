import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSnackbarExample } from '../_examples/basic-snackbar-example/basic-snackbar-example';
import {
  SnackbarWithCustomExample
} from '../_examples/snackbar-with-custom-example/snackbar-with-custom-example';
import {
  ConfigurableSnackbarExample
} from '../_examples/configurable-snackbar-example/configurable-snackbar-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicSnackbarExample,
    SnackbarWithCustomExample,
    ConfigurableSnackbarExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
