import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-tooltip-disabled-example',
  imports: [
    Checkbox,
    SignalFormField,
    Tooltip,
    Button
  ],
  templateUrl: './tooltip-disabled-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tooltip-disabled-example.scss',
})
export class TooltipDisabledExample {
  disabled = form(signal(false));
}
