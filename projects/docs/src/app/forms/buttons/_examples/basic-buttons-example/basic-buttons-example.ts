import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-basic-buttons-example',
  imports: [
    Button,
    Icon,
    Tooltip
  ],
  templateUrl: './basic-buttons-example.html',
  styleUrl: './basic-buttons-example.scss'
})
export class BasicButtonsExample {

}
