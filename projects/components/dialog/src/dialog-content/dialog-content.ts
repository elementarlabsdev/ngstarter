import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-dialog-content,[ngs-dialog-content],[ngsDialogContent]',
  styleUrl: './dialog-content.scss',
  template: '<ng-content/>',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-dialog-content'
  }
})
export class DialogContent {}
