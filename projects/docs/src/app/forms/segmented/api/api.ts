import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
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
  segmentedProperties = [
    {
      name: 'value',
      description: 'Sets a value, manually',
      type: 'any',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Disable a control',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'size',
      description: 'Control size',
      type: "SegmentedTriggerSize: 'sm' | 'default' | 'lg' | string",
      default: 'default'
    }
  ];

  segmentedEvents = [
    {
      name: 'valueChange',
      description: 'Executed when a selected value changed'
    }
  ];

  segmentedButtonProperties = [
    {
      name: 'value*',
      description: 'Value of a button',
      type: 'any',
      default: '–'
    },
    {
      name: 'disabled',
      description: 'Disable a button',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'iconOnly',
      description: 'Hide text and show icon only',
      type: 'boolean',
      default: 'false'
    }
  ];
}
