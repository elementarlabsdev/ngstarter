import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';

@Component({
  selector: 'app-basic-button-toggle-example',
  imports: [
    ButtonToggle,
    ButtonToggleGroup
  ],
  templateUrl: './basic-button-toggle-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-button-toggle-example.scss'
})
export class BasicButtonToggleExample {

}
