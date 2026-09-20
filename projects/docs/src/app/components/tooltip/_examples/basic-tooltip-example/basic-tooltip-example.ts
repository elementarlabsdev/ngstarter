import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

@Component({
  selector: 'app-basic-tooltip-example',
  imports: [
    Button,
    Tooltip
  ],
  templateUrl: './basic-tooltip-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-tooltip-example.scss'
})
export class BasicTooltipExample {

}
