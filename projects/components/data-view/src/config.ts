import { InjectionToken, makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { DataViewColumnDef } from './types';

export interface DataViewConfig {
  embedded?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  bufferRows?: number;
  pageSizeOptions?: number[];
  pageSize?: number;
  rowSelection?: 'single' | 'multiple';
  selectionWidth?: number;
  stickyHeader?: boolean;
  withPagination?: boolean;
  showFirstLastButtons?: boolean;
  minColumnWidth?: number;
  defaultColDef?: Partial<DataViewColumnDef>;
  autoHeight?: boolean;
}

export const DATA_VIEW_CONFIG = new InjectionToken<DataViewConfig>('DATA_VIEW_CONFIG');

export function provideDataView(config: DataViewConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DATA_VIEW_CONFIG, useValue: config }
  ]);
}
