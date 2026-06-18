import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { DataView, DataViewColumnDef, DataViewRowSelectionEvent } from '@ngstarter-ui/components/data-view';

export interface SupportTicket {
  id: string;
  customer: string;
  priority: string;
  owner: string;
  status: string;
}

const DATA: SupportTicket[] = [
  { id: 'TCK-1042', customer: 'Acme Corp', priority: 'High', owner: 'Mia Chen', status: 'Open' },
  { id: 'TCK-1043', customer: 'Northwind', priority: 'Medium', owner: 'Evan Stone', status: 'Pending' },
  { id: 'TCK-1044', customer: 'Globex', priority: 'Low', owner: 'Ava Brooks', status: 'Resolved' },
  { id: 'TCK-1045', customer: 'Initech', priority: 'High', owner: 'Noah Patel', status: 'Open' },
  { id: 'TCK-1046', customer: 'Umbrella', priority: 'Medium', owner: 'Lena Ortiz', status: 'Escalated' },
];

@Component({
  selector: 'app-data-view-row-click-selection-example',
  imports: [
    Button,
    DataView,
    JsonPipe
  ],
  templateUrl: './data-view-row-click-selection-example.html',
  styleUrl: './data-view-row-click-selection-example.scss'
})
export class DataViewRowClickSelectionExample {
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Ticket',
      field: 'id',
      visible: true
    },
    {
      name: 'Customer',
      field: 'customer',
      visible: true
    },
    {
      name: 'Priority',
      field: 'priority',
      visible: true
    },
    {
      name: 'Owner',
      field: 'owner',
      visible: true
    },
    {
      name: 'Status',
      field: 'status',
      visible: true
    },
  ];

  data = DATA;
  selectedRows: SupportTicket[] = [];
  lastSelectionSource = 'none';

  rowSelectionChanged(event: DataViewRowSelectionEvent<SupportTicket>): void {
    this.lastSelectionSource = event.source;
  }

  selectionChanged(rows: SupportTicket[]): void {
    this.selectedRows = rows;
  }
}
