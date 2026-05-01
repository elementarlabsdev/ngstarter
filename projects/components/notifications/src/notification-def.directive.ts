import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNotificationDef]',
  standalone: true
})
export class NotificationDefDirective {
  readonly templateRef = inject(TemplateRef);
  ngsNotificationDef = input.required<string>();
}
