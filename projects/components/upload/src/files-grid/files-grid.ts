import { Component } from '@angular/core';

@Component({
  selector: 'ngs-files-grid',
  exportAs: 'ngsFilesGrid',
  templateUrl: './files-grid.html',
  styleUrl: './files-grid.scss',
  host: {
    'class': 'ngs-files-grid not-prose'
  }
})
export class FilesGrid {

}
