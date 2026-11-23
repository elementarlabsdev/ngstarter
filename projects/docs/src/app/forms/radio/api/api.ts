import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './api.scss',
})
export class Api {
  radioGroupProperties = [
    {
      name: 'value',
      description: 'Selection model. Supports [(value)] and [formField].',
      type: 'any',
      default: 'undefined'
    },
    {
      name: 'name',
      description: 'Name of the radio group',
      type: 'string',
      default: "''"
    },
    {
      name: 'disabled',
      description: 'Whether the radio group is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'orientation',
      description: 'Radio button layout direction. Use vertical for stacked options and horizontal for inline choices.',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'"
    },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
  ];

  radioGroupEvents = [
    {
      name: 'change',
      description: 'Event emitted when the radio group value changes'
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'any' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
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
