import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  AlertActionDirective,
  AlertCloseDirective,
  Alert,
  AlertTitleDirective
} from '@ngstarter/components/alert';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-alert-actions-example',
  imports: [
    Icon,
    AlertActionDirective,
    AlertCloseDirective,
    Alert,
    AlertTitleDirective,

    Button
  ],
  templateUrl: './alert-actions-example.html',
  styleUrl: './alert-actions-example.scss'
})
export class AlertActionsExample {

}
