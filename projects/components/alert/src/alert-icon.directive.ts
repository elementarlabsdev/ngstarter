import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
    selector: '[ngsAlertIcon]',
    exportAs: 'ngsAlertIcon',
    host: {
        'class': 'ngs-alert-icon'
    }
})
export class AlertIconDirective {
  public readonly templateRef = inject(TemplateRef, { optional: true });
}
