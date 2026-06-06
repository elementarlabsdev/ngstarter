import { Component, input } from '@angular/core';

@Component({
  selector: 'ngs-hint',
  exportAs: 'ngsHint',
  templateUrl: './hint.html',
  styleUrl: './hint.scss',
  host: {
    'class': 'ngs-hint',
    '[class.ngs-hint-end]': 'align() === "end"',
  }
})
export class Hint {
  align = input<'start' | 'end'>('start');
}
