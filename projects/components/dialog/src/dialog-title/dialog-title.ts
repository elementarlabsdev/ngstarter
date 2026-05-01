import { Component, input, OnInit, inject } from '@angular/core';
import { DialogRef } from '../dialog-ref';

let nextUniqueId = 0;

@Component({
  selector: 'ngs-dialog-title, [ngs-dialog-title], [ngsDialogTitle]',
  exportAs: 'ngsDialogTitle',
  template: '<ng-content/>',
  styleUrl: './dialog-title.scss',
  host: {
    'class': 'ngs-dialog-title',
    '[id]': 'id()',
  },
})
export class DialogTitle implements OnInit {
  private _dialogRef = inject(DialogRef, { optional: true });

  id = input<string>(`ngs-dialog-title-${nextUniqueId++}`);

  ngOnInit() {
    if (this._dialogRef && !this._dialogRef.disableClose) {
      // Logic for ARIA if needed
    }
  }
}
