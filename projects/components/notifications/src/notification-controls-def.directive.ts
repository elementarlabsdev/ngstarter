import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNotificationControlsDef]',
  standalone: true
})
export class NotificationControlsDefDirective {
  readonly templateRef = inject(TemplateRef);
}
