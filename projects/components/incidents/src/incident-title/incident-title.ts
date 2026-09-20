import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-incident-title',
  exportAs: 'ngsIncidentTitle',
  templateUrl: './incident-title.html',
  styleUrl: './incident-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-incident-title',
  }
})
export class IncidentTitle {

}
