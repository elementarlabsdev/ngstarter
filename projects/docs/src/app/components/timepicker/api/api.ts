import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-timepicker-api',
  standalone: true,
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  timepickerProperties = [
    {
      name: 'disabled',
      description: 'Whether the timepicker is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'interval',
      description: 'The interval between time options in minutes.',
      type: 'number',
      default: '30'
    }
  ];

  timepickerEvents = [
    {
      name: 'opened',
      description: 'Event emitted when the timepicker panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the timepicker panel is closed.'
    }
  ];

  inputProperties = [
    {
      name: 'ngsTimepicker',
      description: 'The timepicker instance to connect with the input.',
      type: 'Timepicker',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Whether the input is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'min',
      description: 'The minimum selectable time. Accepts a Date or a time string.',
      type: 'Date | string',
      default: '–'
    },
    {
      name: 'max',
      description: 'The maximum selectable time. Accepts a Date or a time string.',
      type: 'Date | string',
      default: '–'
    },
    {
      name: 'openOnClick',
      description: 'Whether focusing or clicking the input opens the timepicker panel.',
      type: 'boolean',
      default: 'true'
    }
  ];
}
