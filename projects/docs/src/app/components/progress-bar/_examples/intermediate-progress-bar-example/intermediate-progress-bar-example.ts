import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-intermediate-progress-bar-example',
  imports: [
    ProgressBar
  ],
  templateUrl: './intermediate-progress-bar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './intermediate-progress-bar-example.scss'
})
export class IntermediateProgressBarExample {

}
