import { CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { InjectionToken } from '@angular/core';

export interface DataViewInterface<T = any> {
  api: DataViewAPI<T>;
}

export interface DataViewAPI<T = any> {
  search(value: string): void;
  selectAll(): void;
  unselectAll(): void;
  selectOne(row: T): void;
  isSelected(row: T): boolean;
  hasSelected(): boolean;
  refresh(): void;
  getSnapshot(): DataViewState[];
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
  minWidth?: string | number;
  maxWidth?: string | number;
  params?: {
    [prop: string]: any,
  }
}

export type DataViewRowSelectionEventSource = 'checkbox' | 'row';

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
  successCallback(rowsThisBlock: any[], lastRow?: number): void;
  failCallback(): void;
}

export interface DataViewDatasource {
  getItems(params: DataViewGetRowsParams): void;
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
