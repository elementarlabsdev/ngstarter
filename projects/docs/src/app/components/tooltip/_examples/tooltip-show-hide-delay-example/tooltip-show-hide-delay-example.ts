import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Button } from '@ngstarter-ui/components/button';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-tooltip-show-hide-delay-example',
  imports: [
    Button,
    Tooltip,
    Input,
    Hint,
    SignalFormField,
    Label,
    FormField
  ],
  templateUrl: './tooltip-show-hide-delay-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tooltip-show-hide-delay-example.scss',
})
export class TooltipShowHideDelayExample {
  showDelay = form(signal(1000));
  hideDelay = form(signal(2000));
}
