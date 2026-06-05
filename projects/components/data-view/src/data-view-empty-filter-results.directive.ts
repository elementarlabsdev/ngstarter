import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsDataViewEmptyFilterResults]',
  exportAs: 'ngsDataViewEmptyFilterResults',
  host: {
    'class': 'ngs-data-view-empty-filter-results',
  }
})
export class DataViewEmptyFilterResultsDirective {
  readonly templateRef = inject(TemplateRef);
}
