import { Component, computed, inject } from '@angular/core';
import { IncidentsStore } from '../incidents.store';
import { Incidents } from '../incidents/incidents';
import { Icon } from '@ngstarter-ui/components/icon';
import { IncidentsTitle } from '../incidents-title/incidents-title';
import { IncidentDetails } from '../incident-details/incident-details';
import { IncidentsBar } from '../incidents-bar/incidents-bar';
import { IncidentsDescription } from '../incidents-description/incidents-description';
import { IncidentsToggleIconDirective } from '../incidents-toggle-icon.directive';
import { IncidentTitle } from '../incident-title/incident-title';
import { IncidentCloseDirective } from '../incident-close.directive';
import { Incident } from '../incident/incident';
import { IncidentsList } from '../incidents-list/incidents-list';

@Component({
  selector: 'ngs-incidents-container,ngs-incidents-global',
  exportAs: 'ngsIncidentsGlobal',
  imports: [
    Incidents,
    Icon,
    IncidentsTitle,
    IncidentDetails,
    IncidentsBar,
    IncidentsDescription,
    IncidentsToggleIconDirective,
    IncidentTitle,
    IncidentsList,
    IncidentCloseDirective,
    Incident
  ],
  templateUrl: './incidents-container.html',
  styleUrl: './incidents-container.scss',
  host: {
    'class': 'ngs-incidents-global',
    '[class.is-active]': 'hasIncidents()'
  }
})
export class IncidentsContainer {
  protected _incidentsStore = inject(IncidentsStore);

  hasIncidents = computed<boolean>(() => {
    return this._incidentsStore.incidents().length > 0;
  });
  title = computed(() => {
    return this._incidentsStore.title();
  });
  description = computed(() => {
    return this._incidentsStore.description();
  });
  incidents = computed(() => {
    return this._incidentsStore.incidents();
  });
}
