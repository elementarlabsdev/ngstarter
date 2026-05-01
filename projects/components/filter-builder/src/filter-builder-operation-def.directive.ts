import { Directive, contentChild, input } from '@angular/core';
import { FilterBuilderOperationNameDirective } from './filter-builder-operation-name.directive';
import { FilterBuilderOperationIconDirective } from './filter-builder-operation-icon.directive';

@Directive({
  selector: '[ngsFilterBuilderOperationDef]',
  standalone: true
})
export class FilterBuilderOperationDefDirective {
  id = input('', {
    alias: 'ngsFilterBuilderOperationDef'
  });
  allowedDataTypes = input<string[]>([]);
  readonly operationName = contentChild(FilterBuilderOperationNameDirective);
  readonly operationIcon = contentChild(FilterBuilderOperationIconDirective);
}
