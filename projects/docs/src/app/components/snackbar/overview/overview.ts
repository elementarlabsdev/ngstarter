import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSnackbarExample } from '../_examples/basic-snackbar-example/basic-snackbar-example';
import {
  SnackbarWithCustomExample
} from '../_examples/snackbar-with-custom-example/snackbar-with-custom-example';
import {
  ConfigurableSnackbarExample
} from '../_examples/configurable-snackbar-example/configurable-snackbar-example';

@Component({
  imports: [
    Playground,
    BasicSnackbarExample,
    SnackbarWithCustomExample,
    ConfigurableSnackbarExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
