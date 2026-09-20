import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-file-list',
  exportAs: 'ngsFileList',
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-file-list not-prose'
  }
})
export class FileList {
}
