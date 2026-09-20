import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-dialog-header',
  exportAs: 'ngsDialogHeader',
  imports: [],
  templateUrl: './dialog-header.html',
  styleUrl: './dialog-header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-dialog-header',
  }
})
export class DialogHeader {

}
