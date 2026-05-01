import { Component } from '@angular/core';
import { Alert, AlertTitleDirective } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'app-alert-with-title-example',
  imports: [
    AlertTitleDirective,
    Alert
  ],
  templateUrl: './alert-with-title-example.html',
  styleUrl: './alert-with-title-example.scss'
})
export class AlertWithTitleExample {

}
