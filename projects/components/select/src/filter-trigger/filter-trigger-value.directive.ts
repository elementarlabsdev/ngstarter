import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[ngsFilterTriggerValue]',
  standalone: true,
})
export class FilterTriggerValueDirective {
  readonly templateRef = inject(TemplateRef);
}
