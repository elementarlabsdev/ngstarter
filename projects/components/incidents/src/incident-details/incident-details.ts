import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-incident-details',
  exportAs: 'ngsIncidentDetails',
  templateUrl: './incident-details.html',
  styleUrl: './incident-details.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-incident-details',
  }
})
export class IncidentDetails {

}
