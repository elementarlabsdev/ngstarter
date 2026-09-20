import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-popover-template-ref-example',
  standalone: true,
  imports: [
    PopoverTriggerForDirective,
    Button
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './popover-template-ref-example.html',
})
export class PopoverTemplateRefExample {
}
