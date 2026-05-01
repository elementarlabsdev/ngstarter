import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  AlertActionDirective,
  AlertCloseDirective,
  Alert,
  AlertTitleDirective
} from '@ngstarter-ui/components/alert';
import { Button } from '@ngstarter-ui/components/button';

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
