import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Tooltip, TooltipPosition } from '@ngstarter-ui/components/tooltip';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-tooltip-with-a-custom-position-example',
  imports: [
    FormsModule,
    SignalFormField,
    Button,
    Tooltip,
    Select,
    Option,
    Label,
    FormField,
  ],
  templateUrl: './tooltip-with-a-custom-position-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tooltip-with-a-custom-position-example.scss'
})
export class TooltipWithACustomPositionExample {
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = form(signal(this.positionOptions[0]));
}
