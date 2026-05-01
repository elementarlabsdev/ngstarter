import { Component } from '@angular/core';
import {
  DataViewColumnDef,
  DataView,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';

@Component({
  selector: 'app-data-view-server-side-empty-state-example',
  imports: [
    DataView
  ],
  templateUrl: './data-view-server-side-empty-state-example.html',
})
export class DataViewServerSideEmptyStateExample {
  columnDefs: DataViewColumnDef[] = [
    { name: 'Position', field: 'position', visible: true, sortable: true },
    { name: 'Name', field: 'name', visible: true, sortable: true },
    { name: 'Weight', field: 'weight', visible: true, sortable: true },
    { name: 'Symbol', field: 'symbol', visible: true, sortable: true }
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      // Simulate server-side delay and returning 0 results
      setTimeout(() => {
        params.successCallback([], 0);
      }, 500);
    }
  };
}
