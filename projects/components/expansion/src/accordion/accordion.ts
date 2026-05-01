import {
  ChangeDetectionStrategy,
  Component,
  input,
  booleanAttribute,
  AfterContentInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
  contentChildren
} from '@angular/core';
import { outputToObservable, toObservable } from '@angular/core/rxjs-interop';
import { ExpansionPanel } from '../expansion-panel/expansion-panel';
import { merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'ngs-accordion',
  exportAs: 'ngsAccordion',
  standalone: true,
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
  host: {
    'class': 'ngs-accordion not-prose',
    '[class.ngs-accordion-multi]': 'multi()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Accordion implements AfterContentInit, OnDestroy {
  private readonly _destroyed = new Subject<void>();
  readonly _cdr = inject(ChangeDetectorRef);

  /** Whether the accordion should allow multiple expanded panels at a time. */
  multi = input(false, {
    transform: booleanAttribute
  });

  /** Whether the expansion indicator should be hidden. */
  hideToggle = input(false, {
    transform: booleanAttribute
  });

  readonly _panels = contentChildren(ExpansionPanel, { descendants: true });
  private readonly _panels$ = toObservable(this._panels);

  ngAfterContentInit() {
    this._panels$.pipe(
      startWith(this._panels()),
      switchMap(panels => {
        if (panels.length === 0) {
          return of(null);
        }
        return merge(...panels.map(panel =>
          outputToObservable(panel.expandedChange).pipe(
            switchMap(expanded => {
              if (expanded && !this.multi()) {
                this._closeAllExcept(panel);
              }
              this._cdr.markForCheck();
              return of(null);
            })
          )
        ));
      }),
      takeUntil(this._destroyed)
    ).subscribe();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  openAll(): void {
    if (this.multi()) {
      this._panels().forEach(p => p.open());
      this._cdr.markForCheck();
    }
  }

  closeAll(): void {
    this._panels().forEach(p => p.close());
    this._cdr.markForCheck();
  }

  private _closeAllExcept(panel: ExpansionPanel) {
    this._panels().forEach(p => {
      if (p !== panel) {
        p.close();
      }
    });
    this._cdr.markForCheck();
  }
}
