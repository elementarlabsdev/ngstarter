import { Component } from '@angular/core';
import { DataViewColumnDef, DataView } from '@ngstarter/components/data-view';

export interface ExtendedPeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
  discoveryYear: number;
  group: number;
  period: number;
  category: string;
  atomicMass: string;
  electronConfiguration: string;
  state: string;
}

const CATEGORIES = ['Non-metal', 'Noble gas', 'Alkali metal', 'Alkaline earth metal', 'Metalloid', 'Halogen', 'Transition metal', 'Post-transition metal', 'Lanthanide', 'Actinide'];
const STATES = ['Solid', 'Gas', 'Liquid'];

const generateData = (count: number): ExtendedPeriodicElement[] => {
  const data: ExtendedPeriodicElement[] = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      position: i,
      name: `Element ${i}`,
      weight: Math.round(Math.random() * 300 * 10000) / 10000,
      symbol: `E${i}`,
      discoveryYear: 1700 + Math.floor(Math.random() * 320),
      group: Math.floor(Math.random() * 18) + 1,
      period: Math.floor(Math.random() * 7) + 1,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      atomicMass: `${Math.round(Math.random() * 300)} u`,
      electronConfiguration: `[Rn] ${i}s2`,
      state: STATES[Math.floor(Math.random() * STATES.length)],
    });
  }
  return data;
};

@Component({
  selector: 'app-data-view-column-pinning-example',
  standalone: true,
  imports: [
    DataView
  ],
  templateUrl: './data-view-column-pinning-example.html',
})
export class DataViewColumnPinningExample {
  columnDefs: DataViewColumnDef[] = [
    {name: 'Position', field: 'position', visible: true, resizable: true, sortable: true, width: '100px'},
    {name: 'Name', field: 'name', visible: true, resizable: true, sortable: true, width: '150px'},
    {name: 'Symbol', field: 'symbol', visible: true, resizable: true, sortable: true, width: '100px'},
    {name: 'Weight', field: 'weight', visible: true, resizable: true, sortable: true, width: '120px'},
    {
      name: 'Discovery Year',
      field: 'discoveryYear',
      visible: true,
      resizable: true,
      sortable: true,
      width: '150px'
    },
    {name: 'Group', field: 'group', visible: true, resizable: true, sortable: true, width: '100px'},
    {name: 'Period', field: 'period', visible: true, resizable: true, sortable: true, width: '100px'},
    {name: 'Category', field: 'category', visible: true, resizable: true, sortable: true, width: '180px'},
    {name: 'Atomic Mass', field: 'atomicMass', visible: true, resizable: true, sortable: true, width: '150px'},
    {
      name: 'Electron Configuration',
      field: 'electronConfiguration',
      visible: true,
      resizable: true,
      sortable: true,
      width: '200px'
    },
    {name: 'State', field: 'state', visible: true, resizable: true, sortable: true, width: '120px'},
  ];
  data = generateData(100);
}
