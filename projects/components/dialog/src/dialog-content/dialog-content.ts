import { Component } from '@angular/core';

@Component({
  selector: 'ngs-dialog-content,[ngs-dialog-content],[ngsDialogContent]',
  styleUrl: './dialog-content.scss',
  template: '<ng-content/>',
  host: {
    'class': 'ngs-dialog-content'
  }
})
export class DialogContent {}
