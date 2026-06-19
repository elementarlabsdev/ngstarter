import { Directive, TemplateRef, inject } from '@angular/core';
import { SelectDataSourceOption } from './select-data-source';

export interface SelectValueContext<T = any> {
  $implicit: T | T[] | null;
  data: T | T[] | null;
  option: SelectDataSourceOption<T> | SelectDataSourceOption<T>[] | null;
  value: unknown | unknown[] | null;
  label: string;
  labels: string[];
  count: number;
  multiple: boolean;
}

@Directive({
  selector: 'ng-template[ngsSelectValueDef]',
  standalone: true
})
export class SelectValueDef<T = any> {
  readonly templateRef = inject<TemplateRef<SelectValueContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: SelectValueDef<T>,
    _context: unknown
  ): _context is SelectValueContext<T> {
    return true;
  }
}
