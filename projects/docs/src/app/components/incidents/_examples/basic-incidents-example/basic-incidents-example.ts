import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  IncidentCloseDirective, Incident, IncidentDetails,
  IncidentIconDirective, IncidentsBar, Incidents,
  IncidentsDescription, IncidentsList,
  IncidentsTitle,
  IncidentsToggleIconDirective, IncidentTitle
} from '@ngstarter/components/incidents';

@Component({
  selector: 'app-basic-incidents-example',
  imports: [
    Icon,
    IncidentsTitle,
    IncidentsDescription,
    IncidentsToggleIconDirective,
    IncidentIconDirective,
    IncidentCloseDirective,
    IncidentTitle,
    IncidentDetails,
    Incident,
    IncidentsList,
    IncidentsBar,
    Incidents
  ],
  templateUrl: './basic-incidents-example.html',
  styleUrl: './basic-incidents-example.scss'
})
export class BasicIncidentsExample {
  incidents = [
    {
      title: 'Maintenance work on the DNS API',
      details: '1 minute ago'
    },
    {
      title: 'Maintenance work on the DNS API',
      details: '2 days ago'
    }
  ];
}
