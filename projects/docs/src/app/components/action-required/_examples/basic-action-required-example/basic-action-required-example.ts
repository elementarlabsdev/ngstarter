import { Component } from '@angular/core';
import { ActionRequired } from '@ngstarter-ui/components/action-required';

@Component({
  selector: 'app-basic-action-required-example',
  imports: [
    ActionRequired
  ],
  templateUrl: './basic-action-required-example.html',
  styleUrl: './basic-action-required-example.scss'
})
export class BasicActionRequiredExample {
  onButtonClicked() {
    console.log('Button Clicked');
  }
}
