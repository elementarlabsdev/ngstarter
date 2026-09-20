import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Alert } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'app-alert-variants-example',
  imports: [
    Alert
  ],
  templateUrl: './alert-variants-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './alert-variants-example.scss'
})
export class AlertVariantsExample {

}
