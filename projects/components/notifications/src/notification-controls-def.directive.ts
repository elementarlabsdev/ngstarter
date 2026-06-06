import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNotificationControlsDef]',
})
export class NotificationControlsDefDirective {
  readonly templateRef = inject(TemplateRef);
}
