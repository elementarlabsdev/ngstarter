import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-file-control,[ngs-file-control]',
  exportAs: 'ngsFileControl',
  templateUrl: './file-control.html',
  styleUrl: './file-control.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-file-control not-prose'
  }
})
export class FileControl {
}
