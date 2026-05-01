import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  ContentChildren,
  QueryList,
  signal,
  DestroyRef,
  inject
} from '@angular/core';
import {
  CdkColumnDef,
  CdkHeaderRowDef,
  CdkTable,
  CDK_TABLE,
  DataRowOutlet,
  HeaderRowOutlet,
  FooterRowOutlet,
  NoDataRowOutlet,
  STICKY_POSITIONING_LISTENER,
  CdkTableModule,
} from '@angular/cdk/table';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-table, table[ngs-table]',
  exportAs: 'ngsTable',
  imports: [
    CdkTableModule,
    HeaderRowOutlet,
    FooterRowOutlet,
    DataRowOutlet,
    NoDataRowOutlet,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  providers: [
    { provide: CdkTable, useExisting: forwardRef(() => Table) },
    { provide: CDK_TABLE, useExisting: forwardRef(() => Table) },
    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-table not-prose',
    '[class.ngs-table-fixed-layout]': 'fixedLayout',
    '[class.ngs-table-sticky]': 'hasStickyColumns()',
    'role': 'grid'
  },
})
export class Table<T> extends CdkTable<T> {
  hideHeader = input(false, { transform: booleanAttribute });
  hideBody = input(false, { transform: booleanAttribute });
  hideFooter = input(false, { transform: booleanAttribute });

  private readonly destroyRef = inject(DestroyRef);

  /**
   * Whether the table has any sticky header rows.
   * This is used to apply the 'ngs-table-sticky-header' class.
   */
  private readonly _hasStickyHeader = signal<boolean>(false);

  readonly hasStickyHeader = computed(() => this._hasStickyHeader());

  // We define our own queries to track changes, avoiding conflict with CdkTable's internal properties.
  // Angular will populate these just fine alongside the parent's queries.
  @ContentChildren(CdkHeaderRowDef, { descendants: true })
  headerRowDefsQuery!: QueryList<CdkHeaderRowDef>;

  @ContentChildren(CdkColumnDef, { descendants: true })
  columnDefsQuery!: QueryList<CdkColumnDef>;

  /**
   * Whether the table has any sticky columns.
   */
  private readonly _hasStickyColumns = signal<boolean>(false);

  readonly hasStickyColumns = computed(() => this._hasStickyColumns());

  private _updateStickyStates(): void {
    if (this.headerRowDefsQuery) {
      const headerRowDefs = this.headerRowDefsQuery.toArray();
      const hasStickyHeaderRows = headerRowDefs.some((def: any) => def.sticky);
      this._hasStickyHeader.set(hasStickyHeaderRows);
    }
    if (this.columnDefsQuery) {
      const colDefs = this.columnDefsQuery.toArray();
      const hasStickyColumns = colDefs.some((def: any) => def.sticky || def.stickyEnd);

      this._hasStickyColumns.set(hasStickyColumns);

      // Directly set the property on the base class.
      // This triggers the base class setter logic which handles style updates.
      this.fixedLayout = hasStickyColumns;
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();

    this.headerRowDefsQuery.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._updateStickyStates();
    });

    this.columnDefsQuery.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this._updateStickyStates();
    });

    this._updateStickyStates();
  }

  protected override stickyCssClass = 'ngs-table-sticky';
}
