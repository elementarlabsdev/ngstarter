import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-stroked-buttons-example',
  imports: [
    Button
  ],
  templateUrl: './stroked-buttons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stroked-buttons-example.scss'
})
export class StrokedButtonsExample {

}
