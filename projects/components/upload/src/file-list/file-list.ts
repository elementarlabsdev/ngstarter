import { Component } from '@angular/core';

@Component({
  selector: 'ngs-file-list',
  exportAs: 'ngsFileList',
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss',
  host: {
    'class': 'ngs-file-list not-prose'
  }
})
export class FileList {
}
