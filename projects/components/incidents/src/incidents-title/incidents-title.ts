import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-incidents-title',
  exportAs: 'ngsIncidentTitle',
  templateUrl: './incidents-title.html',
  styleUrl: './incidents-title.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-incidents-title',
  }
})
export class IncidentsTitle {

}
