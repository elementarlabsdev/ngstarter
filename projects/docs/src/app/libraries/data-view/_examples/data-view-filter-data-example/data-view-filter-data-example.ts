import { Component, model } from '@angular/core';
import {
  DataViewColumnDef,
  DataView,
  DataViewEmptyFilterResultsDirective
} from '@ngstarter-ui/components/data-view';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter-ui/components/empty-state';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormField } from '@ngstarter-ui/components/form-field';
import { FormsModule } from '@angular/forms';
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
];

@Component({
  selector: 'app-data-view-filter-data-example',
  imports: [
    DataView,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    DataViewEmptyFilterResultsDirective,
    Icon,
    FormField,
    FormsModule,
    Input
  ],
  templateUrl: './data-view-filter-data-example.html',
  styleUrl: './data-view-filter-data-example.scss'
})
export class DataViewFilterDataExample {
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
  search = '';
}
