import { Component, input, output } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-action-required',
  exportAs: 'ngsActionRequired',
  imports: [
    Icon,
    Button
  ],
  templateUrl: './action-required.html',
  styleUrl: './action-required.scss',
  host: {
    'class': 'ngs-action-required',
  }
})
export class ActionRequired {
  actionText = input<string>();
  iconName = input<string>();
  description = input.required<string>();
  buttonText = input.required<string>();

  readonly buttonClicked = output<void>();

  protected getIconName(iconName: string): string {
    if (iconName === 'error') {
      return 'fluent:error-circle-24-regular';
    }
    if (iconName === 'warning') {
      return 'fluent:warning-24-regular';
    }
    if (iconName === 'help') {
      return 'fluent:question-circle-24-regular';
    }
    return iconName;
  }
}
