import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-command-bar-command,[ngs-command-bar-command]',
  exportAs: 'ngsCommandBarCommand',
  templateUrl: './command-bar-command.html',
  styleUrl: './command-bar-command.scss',
  hostDirectives: [
    Ripple,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-command-bar-command'
  }
})
export class CommandBarCommand {
  shortcut = input('');
}
