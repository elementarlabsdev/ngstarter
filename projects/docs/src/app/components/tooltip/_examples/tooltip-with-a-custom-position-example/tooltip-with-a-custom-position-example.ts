import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tooltip, TooltipPosition } from '@ngstarter/components/tooltip';
import { Option, Select } from '@ngstarter/components/select';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-tooltip-with-a-custom-position-example',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    Tooltip,
    Select,
    Option,
    Label,
    FormField,
  ],
  templateUrl: './tooltip-with-a-custom-position-example.html',
  styleUrl: './tooltip-with-a-custom-position-example.scss'
})
export class TooltipWithACustomPositionExample {
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
}
