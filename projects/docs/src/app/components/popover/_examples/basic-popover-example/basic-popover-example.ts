import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-popover-example',
  imports: [
    PopoverTriggerForDirective,
    Popover,
    Button
  ],
  templateUrl: './basic-popover-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-popover-example.scss'
})
export class BasicPopoverExample {

}
