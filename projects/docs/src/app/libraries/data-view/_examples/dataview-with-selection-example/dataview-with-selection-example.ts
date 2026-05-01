import { Component, model } from '@angular/core';
import { DataViewColumnDef, DataView, DataViewRowSelectionEvent } from '@ngstarter-ui/components/data-view';
import { JsonPipe } from '@angular/common';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';

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
  selector: 'app-dataview-with-selection-example',
  imports: [
    DataView,
    JsonPipe,
    FormsModule,
    Button,
    Segmented,
    SegmentedButton
  ],
  templateUrl: './dataview-with-selection-example.html',
  styleUrl: './dataview-with-selection-example.scss'
})
export class DataviewWithSelectionExample {
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
  selectionMode: 'single' | 'multiple' = 'multiple';

  selectedRows: PeriodicElement[] = [];

  rowSelectionChanged(event: DataViewRowSelectionEvent<PeriodicElement>): void {
    if (this.selectionMode === 'single') {
      this.selectedRows = event.checked ? [event.row] : [];
    } else {
      if (event.checked) {
        this.selectedRows = [...this.selectedRows, event.row];
      } else {
        this.selectedRows = this.selectedRows.filter(r => r !== event.row);
      }
    }
  }

  selectionChanged(rows: PeriodicElement[]): void {
    console.log('all selected rows:', rows);
  }

  allRowsSelectionChanged(isAllSelected: boolean): void {
    if (isAllSelected) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
  }
}
