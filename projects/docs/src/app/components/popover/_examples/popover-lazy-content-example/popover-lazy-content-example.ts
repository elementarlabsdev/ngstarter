import { Component } from '@angular/core';
import { Popover, PopoverTriggerForDirective, PopoverContent } from '@ngstarter/components/popover';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-popover-lazy-content-example',
  imports: [
    PopoverTriggerForDirective,
    Popover,
    PopoverContent,
    Button
  ],
  templateUrl: './popover-lazy-content-example.html',
  styleUrl: './popover-lazy-content-example.scss'
})
export class PopoverLazyContentExample {

}
