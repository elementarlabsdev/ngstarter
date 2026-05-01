import { Component, model } from '@angular/core';
import {
  DataViewActionBar,
  DataViewActionBarDirective,
  DataViewColumnDef,
  DataView
} from '@ngstarter-ui/components/data-view';
import { FormsModule } from '@angular/forms';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

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
  selector: 'app-data-view-loading-state-example',
  imports: [
    DataView,
    FormsModule,
    DataViewActionBar,
    DataViewActionBarDirective,
    Icon,
    Button
  ],
  templateUrl: './data-view-loading-state-example.html',
  styleUrl: './data-view-loading-state-example.scss'
})
export class DataViewLoadingStateExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Position',
      field: 'position',
      visible: true
    },
    {
      name: 'Name',
      field: 'name',
      visible: true
    },
    {
      name: 'Weight',
      field: 'weight',
      visible: true
    },
    {
      name: 'Symbol',
      field: 'symbol',
      visible: true
    }
  ];
  data = DATA;
}
