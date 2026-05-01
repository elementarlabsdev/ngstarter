import { booleanAttribute, Directive, inject, input, numberAttribute, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsDataViewActionBar]',
  standalone: true
})
export class DataViewActionBarDirective {
  readonly templateRef = inject(TemplateRef);
  readonly width = input(100, {
    alias: 'ngsDataViewActionBarWidth',
    transform: numberAttribute
  });
}
