import { Component, model } from '@angular/core';
import {
  DataViewActionBar,
  DataViewActionBarDirective,
  DataViewColumnDef,
  DataView
} from '@ngstarter-ui/components/data-view';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-data-view-with-action-bar-example',
  imports: [
    DataView,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger,
    DataViewActionBar,
    DataViewActionBarDirective,
    FormsModule,
    Button
  ],
  templateUrl: './data-view-with-action-bar-example.html',
  styleUrl: './data-view-with-action-bar-example.scss'
})
export class DataViewWithActionBarExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Position',
      field: 'position',
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
    },
    {
      name: 'Name',
      field: 'name',
      visible: true
    },
  ];
  data = DATA;

  share(row: any): void {
    console.log(row);
  }
}
