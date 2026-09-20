import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProgressSpinner } from '@ngstarter-ui/components/spinner';

@Component({
  selector: 'app-basic-progress-spinner-example',
  imports: [
    ProgressSpinner
  ],
  templateUrl: './basic-progress-spinner-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-progress-spinner-example.scss'
})
export class BasicProgressSpinnerExample {

}
