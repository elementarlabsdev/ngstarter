import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-icon-buttons-example',
  imports: [
    Icon,

    Button
  ],
  templateUrl: './icon-buttons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './icon-buttons-example.scss'
})
export class IconButtonsExample {

}
