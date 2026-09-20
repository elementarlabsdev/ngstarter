import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-incidents-description',
  exportAs: 'ngsIncidentsDescription',
  templateUrl: './incidents-description.html',
  styleUrl: './incidents-description.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-incidents-description'
  }
})
export class IncidentsDescription {

}
