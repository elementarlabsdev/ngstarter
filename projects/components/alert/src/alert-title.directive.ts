import { Directive } from '@angular/core';

@Directive({
    selector: 'ngs-alert-title,[ngsAlertTitle]',
    exportAs: 'ngsAlertTitle',
    host: {
        'class': 'ngs-alert-title'
    }
})
export class AlertTitleDirective {
}
