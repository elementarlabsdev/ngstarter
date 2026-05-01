import { Component, input, Input } from '@angular/core';
import { Ripple } from '@ngstarter/components/core';

@Component({
  selector: 'ngs-command-bar-command,[ngs-command-bar-command]',
  exportAs: 'ngsCommandBarCommand',
  standalone: true,
  templateUrl: './command-bar-command.html',
  styleUrl: './command-bar-command.scss',
  hostDirectives: [
    Ripple,
  ],
  host: {
    'class': 'ngs-command-bar-command'
  }
})
export class CommandBarCommand {
  shortcut = input('');
}
