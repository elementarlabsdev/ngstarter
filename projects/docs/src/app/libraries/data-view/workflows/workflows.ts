import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataView, DataViewColumnDef, DataViewDatasource, DataViewSavedView, DataViewSelectionState, matchesDataViewFilter } from '@ngstarter-ui/components/data-view';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Toolbar, ToolbarItem, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Page } from '@meta/page/page';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Kbd } from '@ngstarter-ui/components/kbd';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

interface RecordRow { id: number; name: string; status: string; amount: number; created: string; enabled: boolean; }
@Component({
  selector: 'app-data-view-workflows',
  imports: [FormsModule, DataView, Button, Input, FormField, Toolbar, ToolbarItem, ToolbarSpacer,
    SlideToggle, Page, PageTitleDirective, PageContentDirective, Kbd, CodeHighlighter],
  templateUrl: './workflows.html', styleUrl: './workflows.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewWorkflows {
  readonly grid = viewChild<DataView<RecordRow>>(DataView);
  readonly search = signal(''); readonly serverSide = signal(false); readonly selection = signal<DataViewSelectionState<RecordRow> | null>(null);
  readonly failNext = signal(false); readonly activated = signal<string | null>(null);
  readonly rows = signal<RecordRow[]>(Array.from({ length: 1000 }, (_, id) => ({ id: id + 1,
    name: `Record ${String(id + 1).padStart(4, '0')}`, status: ['Active', 'Pending', 'Archived'][id % 3],
    amount: 50 + (id * 137) % 5000, created: `2026-10-${String(id % 28 + 1).padStart(2, '0')}`, enabled: id % 3 === 0 })));
  readonly rowId = (row: RecordRow) => row.id;
  readonly columns: DataViewColumnDef[] = [
    { field: 'id', name: 'ID', width: 80, pinned: true, sortable: true, resizable: true, withColumnSettings: false },
    { field: 'name', name: 'Name', width: 220, sortable: true, resizable: true, filter: { type: 'text' } },
    { field: 'status', name: 'Status', width: 160, sortable: true, resizable: true, filter: { type: 'enum', options: ['Active','Pending','Archived'].map(value => ({ value, label: value })) } },
    { field: 'amount', name: 'Amount', width: 160, sortable: true, resizable: true, filter: { type: 'number' } },
    { field: 'created', name: 'Created', width: 180, sortable: true, resizable: true, filter: { type: 'date' } },
    { field: 'enabled', name: 'Enabled', width: 160, sortable: true, resizable: true, filter: { type: 'boolean' } },
  ];
  readonly initialViews: DataViewSavedView[] = [{ id: 'active-records', name: 'Active records', state: {
    version: 1, columns: this.columns.map(column => ({ field: column.field, visible: true, width: column.width, pinned: column.pinned })),
    sort: { active: 'amount', direction: 'desc' }, search: '', columnFilters: { enabled: { type: 'boolean', value: true } }, pageSize: 20
  } }];
  readonly datasource: DataViewDatasource = {
    getItems: params => {
      const fail = this.failNext(); this.failNext.set(false);
      const timer = setTimeout(() => {
        if (params.signal.aborted) return;
        if (fail) { params.failCallback(new Error('The demo request failed. Retry to recover.')); return; }
        let rows = this.rows().filter(row => params.filterModel.trim().toLowerCase().split(/\s+/).every(word => Object.values(row).join(' ').toLowerCase().includes(word))
          && Object.entries(params.columnFilters).every(([field, filter]) => matchesDataViewFilter(row[field as keyof RecordRow], filter)));
        const sort = params.sortModel[0];
        if (sort?.sort) rows = [...rows].sort((a, b) => {
          const left = a[sort.colId as keyof RecordRow]; const right = b[sort.colId as keyof RecordRow];
          return (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))) * (sort.sort === 'asc' ? 1 : -1);
        });
        params.successCallback(rows.slice(params.startRow, params.endRow), rows.length);
      }, 450);
      params.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
      return () => clearTimeout(timer);
    }
  };
  replaceRecords(): void {
    this.rows.update(rows => rows.map(row => ({ ...row, amount: row.amount + 1 })));
    this.grid()?.refresh();
  }
  simulateError(): void { this.failNext.set(true); this.grid()?.refresh(); }
  readonly usage = `import { DataView, DataViewColumnDef, provideDataView } from '@ngstarter-ui/components/data-view';

interface RecordRow { id: number; name: string; amount: number; created: string; }

// Optional application defaults:
export const appConfig = {
  providers: [provideDataView({ withSavedViews: true, pageSize: 20 })]
};

// Stable identity + typed column filters:
const getRowId = (row: RecordRow) => row.id;
const columns: DataViewColumnDef[] = [
  { field: 'name', name: 'Name', filter: { type: 'text' } },
  { field: 'amount', name: 'Amount', filter: { type: 'number' } },
  { field: 'created', name: 'Created', filter: { type: 'date' } }
];

grid.api.setColumnFilter('amount', { type: 'number', operator: 'between', value: 100, to: 500 });
const view = grid.api.saveView('Review queue');
grid.api.applyView(view.id);
// Persist with [(savedViews)] or opt into viewStorageKey on the component.
// stateChanged emits a serializable versioned query/column state.
// selectionStateChanged represents server-wide selection through query + excluded IDs.`;
}
