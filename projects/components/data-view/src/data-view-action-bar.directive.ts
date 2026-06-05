import { Directive, inject, input, numberAttribute, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsDataViewActionBar]',
})
export class DataViewActionBarDirective {
  readonly templateRef = inject(TemplateRef);
  readonly width = input(100, {
    alias: 'ngsDataViewActionBarWidth',
    transform: numberAttribute
  });
}
