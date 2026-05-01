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
  selector: 'app-data-view-resizable-columns-example',
  standalone: true,
  imports: [
    DataView
  ],
  templateUrl: './data-view-resizable-columns-example.html',
  styleUrl: './data-view-resizable-columns-example.scss'
})
export class DataViewResizableColumnsExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Position (Resizable, max 200px)',
      field: 'position',
      visible: true,
      resizable: true,
      width: '150px',
      maxWidth: 200
    },
    {
      name: 'Name (Resizable, min 150px)',
      field: 'name',
      visible: true,
      resizable: true,
      width: '200px',
      minWidth: 150
    },
    {
      name: 'Weight (Non-resizable)',
      field: 'weight',
      visible: true,
      resizable: false,
    },
    {
      name: 'Symbol (Resizable)',
      field: 'symbol',
      visible: true,
      resizable: true,
      width: '100px'
    }
  ];
  minColumnWidth = 80;
  data = DATA;
}
