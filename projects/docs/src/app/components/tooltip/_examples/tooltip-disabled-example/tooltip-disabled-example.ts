import { Component } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-tooltip-disabled-example',
  imports: [
    Checkbox,
    ReactiveFormsModule,
    Tooltip,
    Button
  ],
  templateUrl: './tooltip-disabled-example.html',
  styleUrl: './tooltip-disabled-example.scss',
})
export class TooltipDisabledExample {
  disabled = new FormControl(false, { nonNullable: true });
}
