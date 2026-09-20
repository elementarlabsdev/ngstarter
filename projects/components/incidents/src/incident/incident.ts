import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { IncidentsStore } from '../incidents.store';
import { Button } from '@ngstarter-ui/components/button';

let incidentId = 0;

@Component({
  selector: 'ngs-incident,[ngs-incident]',
  exportAs: 'ngsIncident',
  imports: [

    Button
  ],
  templateUrl: './incident.html',
  styleUrl: './incident.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-incident'
  }
})
export class Incident {
  private _incidentsStore = inject(IncidentsStore);

  incidentId = input(`incident-${incidentId++}`);

  close() {
    this._incidentsStore.hide();
  }
}
