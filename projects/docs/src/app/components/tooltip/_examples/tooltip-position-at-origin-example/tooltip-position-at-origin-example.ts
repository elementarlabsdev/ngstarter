import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-tooltip-position-at-origin-example',
  imports: [
    Tooltip,
    Checkbox,
    Button,
    ReactiveFormsModule
  ],
  templateUrl: './tooltip-position-at-origin-example.html',
  styleUrl: './tooltip-position-at-origin-example.scss',
})
export class TooltipPositionAtOriginExample {
  enabled = new FormControl(false);
}
