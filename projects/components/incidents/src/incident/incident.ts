import { Component, inject, input } from '@angular/core';
import { IncidentsStore } from '../incidents.store';
import { Button } from '@ngstarter/components/button';

let incidentId = 0;

@Component({
  selector: 'ngs-incident,[ngs-incident]',
  exportAs: 'ngsIncident',
  imports: [

    Button
  ],
  templateUrl: './incident.html',
  styleUrl: './incident.scss',
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
