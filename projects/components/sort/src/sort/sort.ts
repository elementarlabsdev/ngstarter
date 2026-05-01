import {
  Directive,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';
import { SortDirection } from './sort-direction';
import { Sort, EmrSort, SORT } from './sort-interface';
import { Subject } from 'rxjs';

@Directive({
  selector: '[ngsSort]',
  exportAs: 'ngsSort',
  providers: [{ provide: SORT, useExisting: SortDirective }],
  standalone: true,
})
export class SortDirective implements OnInit, OnChanges, OnDestroy, EmrSort {
  active = model('', { alias: 'ngsSortActive' });

  start = input<SortDirection>('asc', { alias: 'ngsSortStart' });

  direction = model<SortDirection>('', { alias: 'ngsSortDirection' });

  disableClear = input(false, {
    alias: 'ngsSortDisableClear',
    transform: (value: boolean | string) => typeof value === 'string' ? value === '' || value === 'true' : value
  });

  disabled = input(false, {
    alias: 'ngsSortDisabled',
    transform: (value: boolean | string) => typeof value === 'string' ? value === '' || value === 'true' : value
  });

  readonly sortChange = output<Sort>({ alias: 'ngsSortChange' });

  readonly _stateChanges = new Subject<void>();

  private readonly _initialized = new Subject<void>();
  readonly initialized = this._initialized.asObservable();

  ngOnInit() {
    this._initialized.next();
    this._initialized.complete();
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  sort(id: string) {
    const direction = this.getNextSortDirection(id);
    this.active.set(id);
    this.direction.set(direction);
    this.sortChange.emit({ active: id, direction });
    this._stateChanges.next();
  }

  getNextSortDirection(id: string): SortDirection {
    if (this.active() !== id) {
      return this.start() || 'asc';
    }

    if (this.direction() === 'asc') {
      return 'desc';
    }

    if (this.direction() === 'desc' && !this.disableClear()) {
      return '';
    }

    return 'asc';
  }
}
