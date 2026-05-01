import { Component } from '@angular/core';
import { Popover, PopoverPosition, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-popover-with-custom-position-example',
  imports: [
    FormField,
    Label,
    Select,
    ReactiveFormsModule,
    Option,
    Popover,
    PopoverTriggerForDirective,
    Button
  ],
  templateUrl: './popover-with-custom-position-example.html',
  styleUrl: './popover-with-custom-position-example.scss'
})
export class PopoverWithCustomPositionExample {
  positionOptions: PopoverPosition[] = [
    'below-start', 'below-center', 'below-end',
    'above-start', 'above-center', 'above-end',
    'before-start', 'before-center', 'before-end',
    'after-start', 'after-center', 'after-end'
  ];
  position = new FormControl(this.positionOptions[0]);
}
