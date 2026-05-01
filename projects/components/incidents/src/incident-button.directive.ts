import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsIncidentButton]',
  exportAs: 'ngsIncidentButton',
  host: {
    'class': 'ngs-incident-button',
  }
})
export class IncidentButtonDirective {

}
