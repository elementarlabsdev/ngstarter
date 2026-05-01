import { Component } from '@angular/core';
import {
  DataViewColumnDef,
  DataView,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { FormsModule } from '@angular/forms';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

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
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  { position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na' },
  { position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg' },
  { position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al' },
  { position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si' },
  { position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P' },
  { position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S' },
  { position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl' },
  { position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar' },
  { position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K' },
  { position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca' },
];

@Component({
  selector: 'app-data-view-server-side-example',
  imports: [
    DataView,
    FormsModule,
    FormField,
    Input
  ],
  templateUrl: './data-view-server-side-example.html',
})
export class DataViewServerSideExample {
  search = '';
  columnDefs: DataViewColumnDef[] = [
    { name: 'Position', field: 'position', visible: true, sortable: true },
    { name: 'Name', field: 'name', visible: true, sortable: true },
    { name: 'Weight', field: 'weight', visible: true, sortable: true },
    { name: 'Symbol', field: 'symbol', visible: true, sortable: true }
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      console.log('Fetching rows:', params);

      // Simulate server-side delay
      setTimeout(() => {
        let data = [...DATA];

        // Apply filter
        if (params.filterModel) {
          const filter = params.filterModel.toLowerCase();
          data = data.filter(item =>
            item.name.toLowerCase().includes(filter) ||
            item.symbol.toLowerCase().includes(filter)
          );
        }

        // Apply sorting
        if (params.sortModel.length > 0) {
          const sort = params.sortModel[0];
          data.sort((a: any, b: any) => {
            const valA = a[sort.colId];
            const valB = b[sort.colId];
            if (valA < valB) return sort.sort === 'asc' ? -1 : 1;
            if (valA > valB) return sort.sort === 'asc' ? 1 : -1;
            return 0;
          });
        }

        const rowsThisBlock = data.slice(params.startRow, params.endRow);
        params.successCallback(rowsThisBlock, data.length);
      }, 2000);
    }
  };
}
