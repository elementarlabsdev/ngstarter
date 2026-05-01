import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';
import { FormField, Hint, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-tooltip-show-hide-delay-example',
  imports: [
    Button,
    Tooltip,
    Input,
    Hint,
    ReactiveFormsModule,
    Label,
    FormField
  ],
  templateUrl: './tooltip-show-hide-delay-example.html',
  styleUrl: './tooltip-show-hide-delay-example.scss',
})
export class TooltipShowHideDelayExample {
  showDelay = new FormControl(1000, { nonNullable: true });
  hideDelay = new FormControl(2000, { nonNullable: true });
}
