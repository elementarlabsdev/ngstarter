import { Component } from '@angular/core';
import { DataViewColumnDef, DataView } from '@ngstarter/components/data-view';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

const DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', description: 'Hydrogen is a chemical element with symbol H and atomic number 1.' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', description: 'Helium is a chemical element with symbol He and atomic number 2.' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', description: 'Lithium is a chemical element with symbol Li and atomic number 3.' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', description: 'Beryllium is a chemical element with symbol Be and atomic number 4.' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B', description: 'Boron is a chemical element with symbol B and atomic number 5.' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', description: 'Carbon is a chemical element with symbol C and atomic number 6.' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', description: 'Nitrogen is a chemical element with symbol N and atomic number 7.' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', description: 'Oxygen is a chemical element with symbol O and atomic number 8.' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', description: 'Fluorine is a chemical element with symbol F and atomic number 9.' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', description: 'Neon is a chemical element with symbol Ne and atomic number 10.' },
];

@Component({
  selector: 'app-data-view-sticky-columns-example',
  standalone: true,
  imports: [
    DataView
  ],
  templateUrl: './data-view-sticky-columns-example.html',
  styleUrl: './data-view-sticky-columns-example.scss'
})
export class DataViewStickyColumnsExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Position',
      field: 'position',
      visible: true,
      pinned: true,
      width: '100px',
      resizable: true,
    },
    {
      name: 'Name',
      field: 'name',
      visible: true,
      width: '200px',
      resizable: true,
    },
    {
      name: 'Weight',
      field: 'weight',
      visible: true,
      width: '200px',
      resizable: true,
    },
    {
      name: 'Symbol',
      field: 'symbol',
      visible: true,
      width: '200px',
      resizable: true,
    },
    {
      name: 'Description',
      field: 'description',
      visible: true,
      width: '500px',
      resizable: true,
    },
    {
      name: 'Action',
      field: 'action',
      visible: true,
      pinned: true,
      pinAlign: 'end',
      width: '100px'
    }
  ];

  data = Array.from({ length: 100000 }).map((_, i) => ({
    position: i + 1,
    name: `Element ${i + 1}`,
    weight: Math.random() * 100,
    symbol: 'El',
    description: `Description for element ${i + 1}. High performance grid testing.`,
    action: 'Edit'
  }));
}
