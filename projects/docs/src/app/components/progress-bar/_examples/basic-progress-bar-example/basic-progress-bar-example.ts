import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-basic-progress-bar-example',
  imports: [
    ProgressBar
  ],
  templateUrl: './basic-progress-bar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-progress-bar-example.scss'
})
export class BasicProgressBarExample {

}
