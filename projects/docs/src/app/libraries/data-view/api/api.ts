import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

type ApiProperty = {
  name: string;
  description: string;
  type: string;
  default: string;
};

@Component({
  selector: 'app-data-view-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  readonly displayedColumns = ['name', 'type', 'default'];

  readonly properties: ApiProperty[] = [
    {
      name: 'columnDefs',
      description: 'Column definitions that describe visible fields, headers, sizing, sorting, pinning, and renderers.',
      type: 'DataViewColumnDef[]',
      default: '[]'
    },
    {
      name: 'defaultColDef',
      description: 'Default column options merged into each column definition.',
      type: 'Partial<DataViewColumnDef>',
      default: '{}'
    },
    {
      name: 'data',
      description: 'Client-side records rendered by the grid.',
      type: 'T[]',
      default: '[]'
    },
    {
      name: 'datasource',
      description: 'Server-side datasource used when rowModelType is serverSide.',
      type: 'DataViewDatasource | null',
      default: 'null'
    },
    {
      name: 'rowModelType',
      description: 'Controls whether Data View reads all rows locally or requests pages from a datasource.',
      type: '\'clientSide\' | \'serverSide\'',
      default: '\'clientSide\''
    },
    {
      name: 'withSelection',
      description: 'Shows the selection column and enables row selection events.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'rowSelection',
      description: 'Selection mode for row checkboxes.',
      type: '\'single\' | \'multiple\'',
      default: '\'multiple\''
    },
    {
      name: 'allowSingleRowSelectionByClick',
      description: 'Selects exactly one row when users click a non-interactive row area and emits row selection outputs.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'withPagination',
      description: 'Shows the paginator and slices client-side rows or requests server-side pages.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'paginator',
      description: 'External paginator instance that can drive the grid instead of the internal paginator.',
      type: 'Paginator | null',
      default: 'null'
    },
    {
      name: 'pageSize',
      description: 'Current page size. This is a model input that can be two-way bound.',
      type: 'number',
      default: '10'
    },
    {
      name: 'pageIndex',
      description: 'Current page index. This is a model input that can be two-way bound.',
      type: 'number',
      default: '0'
    },
    {
      name: 'pageSizeOptions',
      description: 'Page size choices shown in the paginator.',
      type: 'number[]',
      default: '[5, 10, 20]'
    },
    {
      name: 'showFirstLastButtons',
      description: 'Shows first and last page buttons in the paginator.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'paginatorAriaLabel',
      description: 'Accessible label for the paginator.',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'search',
      description: 'Search text used for client-side filtering or sent to the server-side datasource.',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'loading',
      description: 'Forces the loading state while external data is being fetched.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'cellRenderers',
      description: 'Lazy component renderers used by columns with a matching cellRenderer key.',
      type: 'DataViewCellRendererDef[]',
      default: '[]'
    },
    {
      name: 'withColumnSettings',
      description: 'Enables the column settings workflow for visibility, order, and pinning.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'snapshot',
      description: 'Initial column state for restored visibility, width, and pinned columns.',
      type: 'DataViewState[] | null',
      default: 'null'
    },
    {
      name: 'rowHeight',
      description: 'Virtual row height in pixels.',
      type: 'number',
      default: '50'
    },
    {
      name: 'headerHeight',
      description: 'Header row height in pixels.',
      type: 'number',
      default: '50'
    },
    {
      name: 'bufferRows',
      description: 'Extra virtual rows rendered above and below the visible viewport.',
      type: 'number',
      default: '10'
    },
    {
      name: 'selectionWidth',
      description: 'Width of the selection column in pixels.',
      type: 'number',
      default: '52'
    },
    {
      name: 'minColumnWidth',
      description: 'Minimum width used when resizing columns.',
      type: 'number',
      default: '50'
    },
    {
      name: 'autoHeight',
      description: 'Lets the grid grow with its rendered rows instead of using a fixed-height body.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'stickyHeader',
      description: 'Keeps the header visible when the grid body scrolls.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'bodyScroll',
      description: 'Enables body scrolling behavior for the data area.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'embedded',
      description: 'Uses the embedded visual style for grids placed inside cards, panels, or composed surfaces.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'highlightHeader',
      description: 'Adds highlighted header styling.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hoverRows',
      description: 'Enables row hover styling.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'emptyIcon / emptyText',
      description: 'Default empty state icon and message for no-data results.',
      type: 'string',
      default: 'document-search / There are no data to display'
    },
    {
      name: 'emptyFilterResultsIcon / emptyFilterResultsText',
      description: 'Default empty state icon and message for filtered results.',
      type: 'string',
      default: 'search-info / No data matching the filter "{{ search }}"'
    }
  ];

  readonly outputs: ApiProperty[] = [
    {
      name: 'rowSelectionChanged',
      description: 'Emits when a row checkbox changes or a row is selected by click.',
      type: 'DataViewRowSelectionEvent<T>',
      default: 'Row select or unselect'
    },
    {
      name: 'selectionChanged',
      description: 'Emits the current selected rows after selection changes.',
      type: 'T[]',
      default: 'Selection updates'
    },
    {
      name: 'allRowsSelectionChanged',
      description: 'Emits when the select-all checkbox changes.',
      type: 'boolean',
      default: 'Select all or clear all'
    },
    {
      name: 'sortChange',
      description: 'Emits active column and direction for sorting.',
      type: 'Sort',
      default: 'Sort changes'
    },
    {
      name: 'loadEnd',
      description: 'Emits after the initial client-side sync or server-side datasource response completes.',
      type: 'void',
      default: 'Initial load completes'
    },
    {
      name: 'refreshEnd',
      description: 'Emits after a refresh cycle completes.',
      type: 'void',
      default: 'Refresh completes'
    }
  ];

  readonly columnProperties: ApiProperty[] = [
    {
      name: 'name',
      description: 'Human-readable column header.',
      type: 'string',
      default: '-'
    },
    {
      name: 'field',
      description: 'Record field path used for cell values, sorting, and state.',
      type: 'string',
      default: '-'
    },
    {
      name: 'cellRenderer',
      description: 'Renderer key matched with a DataViewCellRendererDef.',
      type: 'string',
      default: '-'
    },
    {
      name: 'visible',
      description: 'Controls whether the column is displayed.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'width',
      description: 'Fixed column width. Numeric strings are normalized to pixels.',
      type: 'string',
      default: '-'
    },
    {
      name: 'flex',
      description: 'Flexible column sizing weight when width is not fixed.',
      type: 'number',
      default: '1'
    },
    {
      name: 'type',
      description: 'Optional semantic type for column-specific behavior.',
      type: 'string',
      default: '-'
    },
    {
      name: 'valueGetter',
      description: 'Transforms the cell value before sorting or rendering.',
      type: '(value: any) => any',
      default: '-'
    },
    {
      name: 'pinned',
      description: 'Pins the column to the start or end pinned area.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'pinAlign',
      description: 'Pinned column side.',
      type: '\'start\' | \'end\' | undefined',
      default: '\'start\' when pinned'
    },
    {
      name: 'sortable',
      description: 'Enables sorting for the column.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'resizable',
      description: 'Enables drag resizing for the column.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'withColumnSettings',
      description: 'Allows the column to participate in column settings.',
      type: 'boolean',
      default: '-'
    },
    {
      name: 'minWidth / maxWidth',
      description: 'Column resize constraints.',
      type: 'string | number',
      default: '-'
    },
    {
      name: 'params',
      description: 'Extra renderer or column metadata.',
      type: 'Record<string, any>',
      default: '{}'
    }
  ];

  readonly datasourceProperties: ApiProperty[] = [
    {
      name: 'DataViewDatasource.getItems(params)',
      description: 'Called by Data View whenever server-side rows need to be loaded.',
      type: '(params: DataViewGetRowsParams) => void',
      default: 'Required for serverSide'
    },
    {
      name: 'startRow / endRow',
      description: 'Absolute row range requested for the current page.',
      type: 'number',
      default: 'Derived from page and pageSize'
    },
    {
      name: 'page / pageSize',
      description: 'Current page index and page size.',
      type: 'number',
      default: 'Derived from paginator state'
    },
    {
      name: 'sortModel',
      description: 'Current sort columns and directions.',
      type: '{ colId: string; sort: \'asc\' | \'desc\' | \'\' }[]',
      default: '[]'
    },
    {
      name: 'filterModel',
      description: 'Current search/filter value.',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'successCallback(rowsThisBlock, lastRow?)',
      description: 'Pass loaded rows and optional total row count back to Data View.',
      type: '(rowsThisBlock: any[], lastRow?: number) => void',
      default: 'Call on success'
    },
    {
      name: 'failCallback()',
      description: 'Ends the current loading cycle when a request fails.',
      type: '() => void',
      default: 'Call on failure'
    }
  ];

  readonly publicApis: ApiProperty[] = [
    {
      name: 'api.search(value)',
      description: 'Applies a search value to the underlying data source.',
      type: '(value: string) => void',
      default: 'Template reference API'
    },
    {
      name: 'api.selectAll() / api.unselectAll() / api.selectOne(row) / api.isSelected(row) / api.hasSelected()',
      description: 'Selects all rendered rows, clears selection, selects one row, checks a row, or checks whether any row is selected.',
      type: '() => void / (row: T) => void / (row: T) => boolean / () => boolean',
      default: 'Template reference API'
    },
    {
      name: 'api.refresh()',
      description: 'Triggers a client-side or server-side refresh cycle.',
      type: '() => void',
      default: 'Template reference API'
    },
    {
      name: 'api.getSnapshot()',
      description: 'Returns current column visibility, width, and pinning state.',
      type: '() => DataViewState[]',
      default: 'Persist user grid state'
    },
    {
      name: 'getSnapshot() / applyState(state)',
      description: 'Component instance methods for saving and restoring column state.',
      type: 'DataViewState[]',
      default: 'Use through a component reference'
    },
    {
      name: 'selectAll() / unselectAll() / selectOne(row) / isSelected(row) / hasSelected()',
      description: 'Component instance methods for selecting all rows, clearing selection, selecting one row, checking a row, or checking any selection.',
      type: '() => void / (row: T) => void / (row: T) => boolean / () => boolean',
      default: 'Use through a component reference'
    },
    {
      name: 'ngsDataViewEmptyData',
      description: 'Template directive for a custom no-data empty state.',
      type: 'TemplateRef',
      default: 'Projected template'
    },
    {
      name: 'ngsDataViewEmptyFilterResults',
      description: 'Template directive for a custom no-results empty state.',
      type: 'TemplateRef',
      default: 'Projected template'
    },
    {
      name: 'ngsDataViewActionBar',
      description: 'Template directive for per-row actions in the pinned action area.',
      type: 'TemplateRef',
      default: 'Projected template'
    },
    {
      name: 'ngs-data-view-action-bar',
      description: 'Action bar component with force-visible and width controls.',
      type: 'DataViewActionBar',
      default: 'Projected action surface'
    }
  ];

  readonly configProperties: ApiProperty[] = [
    {
      name: 'embedded',
      description: 'Default embedded style.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'rowHeight / headerHeight',
      description: 'Default row and header heights.',
      type: 'number',
      default: '50'
    },
    {
      name: 'bufferRows',
      description: 'Default virtual render buffer.',
      type: 'number',
      default: '10'
    },
    {
      name: 'pageSizeOptions',
      description: 'Default paginator page size options.',
      type: 'number[]',
      default: '[5, 10, 20]'
    },
    {
      name: 'pageSize',
      description: 'Default page size.',
      type: 'number',
      default: '10'
    },
    {
      name: 'rowSelection',
      description: 'Default row selection mode.',
      type: '\'single\' | \'multiple\'',
      default: '\'multiple\''
    },
    {
      name: 'allowSingleRowSelectionByClick',
      description: 'Default row click single-selection behavior.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'selectionWidth',
      description: 'Default selection column width.',
      type: 'number',
      default: '52'
    },
    {
      name: 'stickyHeader',
      description: 'Default sticky header behavior.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'withPagination',
      description: 'Default pagination behavior.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showFirstLastButtons',
      description: 'Default paginator first and last buttons.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'minColumnWidth',
      description: 'Default resize minimum column width.',
      type: 'number',
      default: '50'
    },
    {
      name: 'defaultColDef',
      description: 'Default column definition merged into every grid column.',
      type: 'Partial<DataViewColumnDef>',
      default: '{}'
    },
    {
      name: 'autoHeight',
      description: 'Default auto-height behavior.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
