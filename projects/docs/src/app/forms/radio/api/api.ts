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
  selector: 'app-api',
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
  radioGroupProperties = [
    {
      name: 'value',
      description: 'Value of the radio group',
      type: 'any',
      default: '–'
    },
    {
      name: 'name',
      description: 'Name of the radio group',
      type: 'string',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Whether the radio group is disabled',
      type: 'boolean',
      default: 'false'
    }
  ];

  radioGroupEvents = [
    {
      name: 'change',
      description: 'Event emitted when the radio group value changes'
    }
  ];

  radioButtonProperties = [
    {
      name: 'value',
      description: 'Value of the radio button',
      type: 'any',
      default: '–'
    },
    {
      name: 'name',
      description: 'Name of the radio button',
      type: 'string',
      default: '–'
    },
    {
      name: 'checked',
      description: 'Whether the radio button is checked',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the radio button is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'id',
      description: 'Unique id for the radio button',
      type: 'string',
      default: 'ngs-radio-button-id'
    }
  ];

  radioButtonEvents = [
    {
      name: 'change',
      description: 'Event emitted when the radio button checked state changes'
    }
  ];
}
