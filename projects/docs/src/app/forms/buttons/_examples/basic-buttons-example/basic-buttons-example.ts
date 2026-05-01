import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

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
