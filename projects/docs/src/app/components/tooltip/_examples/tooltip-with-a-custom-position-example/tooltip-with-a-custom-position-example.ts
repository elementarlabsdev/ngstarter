import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tooltip, TooltipPosition } from '@ngstarter-ui/components/tooltip';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';

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
