import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-icon-only-button-toggle-example',
  imports: [
    ButtonToggle,
    ButtonToggleGroup,
    Icon
  ],
  templateUrl: './icon-only-button-toggle-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './icon-only-button-toggle-example.scss'
})
export class IconOnlyButtonToggleExample {

}
