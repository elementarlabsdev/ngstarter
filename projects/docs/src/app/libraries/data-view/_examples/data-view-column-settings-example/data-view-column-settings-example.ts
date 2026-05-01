import { Component } from '@angular/core';
import { DataViewColumnDef, DataView } from '@ngstarter/components/data-view';

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
];

@Component({
  selector: 'app-data-view-column-settings-example',
  standalone: true,
  imports: [
    DataView
  ],
  templateUrl: './data-view-column-settings-example.html',
  styleUrl: './data-view-column-settings-example.scss'
})
export class DataViewColumnSettingsExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Position',
      field: 'position',
      visible: true,
      resizable: true,
      sortable: true,
      withColumnSettings: false,
    },
    {
      name: 'Name',
      field: 'name',
      visible: true,
      resizable: true,
      sortable: true,
    },
    {
      name: 'Weight',
      field: 'weight',
      visible: true,
      resizable: true,
      sortable: true,
    },
    {
      name: 'Symbol',
      field: 'symbol',
      visible: true,
      resizable: true,
      sortable: true,
    }
  ];
  data = DATA;
}
