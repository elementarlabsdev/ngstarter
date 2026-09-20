import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-flat-buttons-example',
  imports: [
    Button,
  ],
  templateUrl: './flat-buttons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './flat-buttons-example.scss'
})
export class FlatButtonsExample {

}
