import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-query-progress-bar-example',
  imports: [
    ProgressBar
  ],
  templateUrl: './query-progress-bar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './query-progress-bar-example.scss'
})
export class QueryProgressBarExample {

}
