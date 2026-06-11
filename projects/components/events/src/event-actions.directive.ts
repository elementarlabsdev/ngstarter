import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsEventActions]',
  exportAs: 'ngsEventActions',
  standalone: true,
})
export class EventActionsDirective {}
