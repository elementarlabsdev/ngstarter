import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-files-grid',
  exportAs: 'ngsFilesGrid',
  templateUrl: './files-grid.html',
  styleUrl: './files-grid.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-files-grid not-prose'
  }
})
export class FilesGrid {

}
