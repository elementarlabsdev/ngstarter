import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './api.scss',
})
export class Api {
  segmentedProperties = [
    {
      name: 'value',
      description: 'Selection model. Supports [(value)] and [formField].',
      type: 'any',
      default: 'null'
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
    },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
  ];

  segmentedEvents = [
    {
      name: 'valueChange',
      description: 'Executed when a selected value changed'
    },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
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
