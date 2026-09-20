import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Popover, PopoverTriggerForDirective, PopoverContent } from '@ngstarter-ui/components/popover';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-popover-lazy-content-example',
  imports: [
    PopoverTriggerForDirective,
    Popover,
    PopoverContent,
    Button
  ],
  templateUrl: './popover-lazy-content-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './popover-lazy-content-example.scss'
})
export class PopoverLazyContentExample {

}
