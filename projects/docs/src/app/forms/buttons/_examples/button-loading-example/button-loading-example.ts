import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-button-loading-example',
  imports: [
    Button
  ],
  templateUrl: './button-loading-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './button-loading-example.scss'
})
export class ButtonLoadingExample {

}
