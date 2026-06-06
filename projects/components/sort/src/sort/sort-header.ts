import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SORT } from './sort-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: '[ngs-sort-header]',
  exportAs: 'ngsSortHeader',
  templateUrl: './sort-header.html',
  styleUrl: './sort-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-sort-header',
    '[class.ngs-sort-header-disabled]': '_isDisabled()',
  },
})
export class SortHeader implements OnInit, OnDestroy {
  private _rerenderSubscription: Subscription | undefined;
  private _cdr = inject(ChangeDetectorRef);

  id = input('', { alias: 'ngs-sort-header' });
  sortActionDescription = input<string>('');
  disabled = input(false, {
    transform: (value: boolean | string) => typeof value === 'string' ? value === '' || value === 'true' : value
  });

  _sort = inject(SORT, { optional: true });

  ngOnInit() {
    if (this._sort && (this._sort as any)._stateChanges) {
      this._rerenderSubscription = (this._sort as any)._stateChanges.subscribe(() => {
        this._cdr.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this._rerenderSubscription?.unsubscribe();
  }

  _handleClick() {
    if (!this._isDisabled() && this._sort) {
      (this._sort as any).sort(this.id());
    }
  }

  _getNextSortDirection(): string {
    if (!this._sort || this._isDisabled()) {
      return '';
    }
    return (this._sort as any).getNextSortDirection(this.id());
  }

  _isSorted(): boolean {
    if (!this._sort) {
      return false;
    }

    const active = typeof this._sort.active === 'function' ? this._sort.active() : this._sort.active;
    const direction = typeof this._sort.direction === 'function' ? this._sort.direction() : this._sort.direction;
    return !!(active === this.id() && direction);
  }

  _isDisabled(): boolean {
    return this.disabled() || this._isSortDisabled();
  }

  _isSortDisabled(): boolean {
    return typeof (this._sort as any)?.disabled === 'function' ? (this._sort as any).disabled() : (this._sort as any)?.disabled;
  }

  _getArrowState() {
    if (!this._sort) {
      return 'void';
    }

    const active = typeof this._sort.active === 'function' ? this._sort.active() : this._sort.active;
    const direction = typeof this._sort.direction === 'function' ? this._sort.direction() : this._sort.direction;
    return active === this.id() ? direction : 'void';
  }
}
