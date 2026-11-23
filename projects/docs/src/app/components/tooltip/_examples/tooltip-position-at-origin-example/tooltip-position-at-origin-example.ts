import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-tooltip-position-at-origin-example',
  imports: [
    Tooltip,
    Checkbox,
    Button,
    SignalFormField
  ],
  templateUrl: './tooltip-position-at-origin-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tooltip-position-at-origin-example.scss',
})
export class TooltipPositionAtOriginExample {
  enabled = form(signal(false));
}
