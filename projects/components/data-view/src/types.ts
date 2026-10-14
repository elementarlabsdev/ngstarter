import { CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { InjectionToken } from '@angular/core';

export interface DataViewInterface<T = any> {
  api: DataViewAPI<T>;
}

export interface DataViewAPI<T = any> {
  search(value: string): void;
  selectAll(scope?: DataViewSelectionScope): void;
  unselectAll(): void;
  selectOne(row: T): void;
  isSelected(row: T): boolean;
  hasSelected(): boolean;
  refresh(): void;
  getSnapshot(): DataViewState[];
  getSelection(): DataViewSelectionState<T>;
  setColumnFilter(field: string, filter: DataViewColumnFilter | null): void;
  clearFilters(): void;
  getState(): DataViewViewState;
  setState(state: DataViewViewState): void;
  saveView(name: string, id?: string): DataViewSavedView;
  applyView(id: string | null): void;
  renameView(id: string, name: string): void;
  deleteView(id: string): void;
}

export type DataViewColumnWidth = string | number;

export interface DataViewColumnDef {
  name: string;
  field: string;
  cellRenderer?: string;
  visible?: boolean;
  width?: DataViewColumnWidth;
  flex?: number;
  type?: string;
  valueGetter?: (value: any) => any;
  pinned?: boolean;
  pinAlign?: DataViewPinAlign;
  sortable?: boolean;
  resizable?: boolean;
  withColumnSettings?: boolean;
  filter?: DataViewColumnFilterConfig;
  minWidth?: string | number;
  maxWidth?: string | number;
  params?: {
    [prop: string]: any,
  }
}

export type DataViewRowId = string | number;
export type DataViewSelectionScope = 'page' | 'filtered' | 'all';
export interface DataViewSelectionState<T = unknown> {
  scope: DataViewSelectionScope;
  allMatching: boolean;
  rowIds: DataViewRowId[];
  excludedRowIds: DataViewRowId[];
  /** Known selected records; a server-wide selection is represented by query + exclusions. */
  rows: T[];
  search: string;
  columnFilters: DataViewFilterModel;
}

export type DataViewRowSelectionEventSource = 'checkbox' | 'row' | 'keyboard';

export interface DataViewRowSelectionEvent<T> {
  source: DataViewRowSelectionEventSource;
  checkboxChange?: CheckboxChange;
  row: T;
  checked: boolean;
}

export interface DataViewCellRendererDef {
  cellRenderer: string;
  component: () => Promise<any>;
}

export interface DataViewCellRenderer {
  element: any;
  columnDef: any;
  fieldData: any;
}

export interface DataViewActionBarAPI {
  setForceVisible: (visible: boolean) => void;
}

export type DataViewRowModelType = 'clientSide' | 'serverSide';

export interface DataViewGetRowsParams {
  startRow: number;
  endRow: number;
  page: number;
  pageSize: number;
  sortModel: { colId: string; sort: 'asc' | 'desc' | '' }[];
  filterModel: string;
  columnFilters: DataViewFilterModel;
  /** Aborted when a newer query replaces this one or the view is destroyed. */
  signal: AbortSignal;
  successCallback(rowsThisBlock: any[], lastRow?: number): void;
  failCallback(error?: unknown): void;
}

export interface DataViewDatasource {
  getItems(params: DataViewGetRowsParams): void | (() => void) | { unsubscribe(): void };
}

export type DataViewPinAlign = 'start' | 'end' | undefined;

export interface DataViewState {
  field: string;
  visible?: boolean;
  width?: DataViewColumnWidth;
  pinned?: boolean;
  pinAlign?: DataViewPinAlign;
}

export const DATA_VIEW = new InjectionToken<DataViewInterface>('DATA_VIEW');

export type DataViewColumnFilter =
  | { type: 'text'; operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains'; value: string }
  | { type: 'number'; operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between'; value?: number; to?: number }
  | { type: 'date'; from?: string; to?: string }
  | { type: 'enum'; values: (string | number)[] }
  | { type: 'boolean'; value: boolean };
export type DataViewFilterModel = Record<string, DataViewColumnFilter>;
export interface DataViewColumnFilterConfig {
  type: DataViewColumnFilter['type'];
  options?: readonly { label: string; value: string | number }[];
}

export interface DataViewViewState {
  version: 1;
  columns: DataViewState[];
  sort: { active: string; direction: 'asc' | 'desc' | '' };
  search: string;
  columnFilters: DataViewFilterModel;
  pageSize: number;
}
export interface DataViewSavedView { id: string; name: string; state: DataViewViewState; }
export interface DataViewViewStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; }
