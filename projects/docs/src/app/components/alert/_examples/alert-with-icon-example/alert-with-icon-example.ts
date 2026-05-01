import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Alert, AlertIconDirective } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'app-alert-with-icon-example',
  imports: [
    Icon,
    AlertIconDirective,
    Alert
  ],
  templateUrl: './alert-with-icon-example.html',
  styleUrl: './alert-with-icon-example.scss'
})
export class AlertWithIconExample {

}
