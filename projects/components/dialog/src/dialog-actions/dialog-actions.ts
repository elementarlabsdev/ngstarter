import { Component, input } from '@angular/core';

@Component({
  selector: 'ngs-dialog-actions, [ngs-dialog-actions], [ngsDialogActions]',
  styleUrl: './dialog-actions.scss',
  template: '<ng-content />',
  host: {
    'class': 'ngs-dialog-actions',
    '[class.ngs-dialog-actions-align-center]': 'align() === "center"',
    '[class.ngs-dialog-actions-align-end]': 'align() === "end"',
  }
})
export class DialogActions {
  align = input<'start' | 'center' | 'end'>('end');
}
