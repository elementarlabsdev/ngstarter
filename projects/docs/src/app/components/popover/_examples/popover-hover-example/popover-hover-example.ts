import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-popover-hover-example',
  imports: [
    Popover,
    PopoverTriggerForDirective,
    Button
  ],
  templateUrl: './popover-hover-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './popover-hover-example.scss'
})
export class PopoverHoverExample {

}
