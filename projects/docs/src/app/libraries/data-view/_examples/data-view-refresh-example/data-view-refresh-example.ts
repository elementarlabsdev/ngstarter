import { Component, signal, inject } from '@angular/core';
import {
  DataViewColumnDef,
  DataView,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
];

@Component({
  selector: 'app-data-view-refresh-example',
  standalone: true,
  imports: [
    DataView,
    Button,
    Icon
  ],
  templateUrl: './data-view-refresh-example.html',
  styleUrl: './data-view-refresh-example.scss'
})
export class DataViewRefreshExample {
  private snackBar = inject(SnackBar);

  columnDefs: DataViewColumnDef[] = [
    { name: 'Position', field: 'position', visible: true },
    { name: 'Name', field: 'name', visible: true },
    { name: 'Weight', field: 'weight', visible: true },
    { name: 'Symbol', field: 'symbol', visible: true }
  ];

  // Client Side Data
  clientData = [...DATA];
  clientRefreshCount = signal(0);

  refreshClient(api: any) {
    this.clientRefreshCount.update(v => v + 1);
    this.clientData = [...DATA, {
      position: 5 + this.clientRefreshCount(),
      name: `New Element ${this.clientRefreshCount()}`,
      weight: 10 + this.clientRefreshCount(),
      symbol: `Ne${this.clientRefreshCount()}`
    }];
    api.refresh();
  }

  onLoadEnd() {
    // console.log('Initial load finished');
  }

  onRefreshEnd() {
    this.snackBar.open('Data refreshed', 'OK', { duration: 2000 });
  }

  // Server Side Datasource
  serverRefreshCount = 0;
  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      // console.log('Fetching rows for server-side refresh:', params);

      setTimeout(() => {
        this.serverRefreshCount++;
        const refreshedData = DATA.map(item => ({
          ...item,
          name: `${item.name} (v${this.serverRefreshCount})`
        }));

        const rowsThisBlock = refreshedData.slice(params.startRow, params.endRow);
        params.successCallback(rowsThisBlock, refreshedData.length);
      }, 1000);
    }
  };

  refreshServer(api: any) {
    api.refresh();
  }
}
