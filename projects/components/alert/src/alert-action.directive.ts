import { Directive } from '@angular/core';

@Directive({
    selector: '[ngsAlertAction]',
    exportAs: 'ngsAlertAction',
    host: {
        'class': 'ngs-alert-action'
    }
})
export class AlertActionDirective {
}
