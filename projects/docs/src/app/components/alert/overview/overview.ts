import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicAlertExample } from '../_examples/basic-alert-example/basic-alert-example';
import { AlertVariantsExample } from '../_examples/alert-variants-example/alert-variants-example';
import { AlertWithIconExample } from '../_examples/alert-with-icon-example/alert-with-icon-example';
import {
  AlertWithTitleExample
} from '../_examples/alert-with-title-example/alert-with-title-example';
import { AlertActionsExample } from '../_examples/alert-actions-example/alert-actions-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicAlertExample,
    AlertVariantsExample,
    AlertWithIconExample,
    AlertWithTitleExample,
    AlertActionsExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
