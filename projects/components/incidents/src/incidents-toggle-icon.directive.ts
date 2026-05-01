import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsIncidentsToggleIcon]',
  exportAs: 'ngsIncidentsToggleIcon',
  host: {
    'class': 'ngs-incidents-toggle-icon',
  }
})
export class IncidentsToggleIconDirective {

}
