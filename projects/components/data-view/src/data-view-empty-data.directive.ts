import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsDataViewEmptyData]',
  exportAs: 'ngsDataViewEmptyData',
  standalone: true,
  host: {
    'class': 'ngs-data-view-empty-data',
  }
})
export class DataViewEmptyDataDirective {
  readonly templateRef = inject(TemplateRef);
}
