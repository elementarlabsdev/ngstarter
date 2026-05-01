import { InjectionToken, OutputEmitterRef } from '@angular/core';
import { SortDirection } from './sort-direction';
import { Observable } from 'rxjs';

export interface Sort {
  readonly active: string;
  readonly direction: SortDirection;
}

export interface EmrSort {
  readonly active: string | (() => string);
  readonly direction: SortDirection | (() => SortDirection);
  readonly sortChange: Observable<Sort> | OutputEmitterRef<Sort>;
  readonly initialized?: Observable<void>;
}

export const SORT = new InjectionToken<EmrSort>('SORT');
