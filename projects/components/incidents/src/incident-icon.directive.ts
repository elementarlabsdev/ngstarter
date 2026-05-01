import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsIncidentIcon]',
  exportAs: 'ngsIncidentIcon',
  host: {
    'class': 'ngs-incident-icon'
  }
})
export class IncidentIconDirective {

}
