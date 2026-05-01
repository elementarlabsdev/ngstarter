import { Component } from '@angular/core';
import { Popover, PopoverTriggerForDirective } from '@ngstarter/components/popover';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-popover-hover-example',
  imports: [
    Popover,
    PopoverTriggerForDirective,
    Button
  ],
  templateUrl: './popover-hover-example.html',
  styleUrl: './popover-hover-example.scss'
})
export class PopoverHoverExample {

}
