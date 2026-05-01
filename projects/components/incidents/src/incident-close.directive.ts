import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsIncidentClose]',
  exportAs: 'ngsIncidentClose',
  host: {
    'class': 'ngs-incident-close'
  }
})
export class IncidentCloseDirective {

}
