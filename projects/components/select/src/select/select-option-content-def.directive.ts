import { Directive, TemplateRef, inject } from '@angular/core';
import { SelectDataSourceOption } from './select-data-source';

export interface SelectOptionContentContext<T = any> {
  $implicit: T;
  data: T;
  option: SelectDataSourceOption<T>;
  value: unknown;
  label: string;
  selected: boolean;
  disabled: boolean;
  multiple: boolean;
}

@Directive({
  selector: 'ng-template[ngsOptionContentDef]',
  standalone: true
})
export class SelectOptionContentDef<T = any> {
  readonly templateRef = inject<TemplateRef<SelectOptionContentContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: SelectOptionContentDef<T>,
    _context: unknown
  ): _context is SelectOptionContentContext<T> {
    return true;
  }
}
