import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  DigitRollerDashboardExample
} from '../_examples/digit-roller-dashboard-example/digit-roller-dashboard-example';
import {
  DigitRollerGaugeExample
} from '../_examples/digit-roller-gauge-example/digit-roller-gauge-example';
import {
  DigitRollerProgressBarExample
} from '../_examples/digit-roller-progress-bar-example/digit-roller-progress-bar-example';
import {
  DigitRollerSocialActionsExample
} from '../_examples/digit-roller-social-actions-example/digit-roller-social-actions-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    DigitRollerDashboardExample,
    DigitRollerGaugeExample,
    DigitRollerProgressBarExample,
    DigitRollerSocialActionsExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {}
