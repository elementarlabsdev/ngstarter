import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Alert } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'app-basic-alert-example',
  imports: [
    Alert
  ],
  templateUrl: './basic-alert-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-alert-example.scss'
})
export class BasicAlertExample {
}
