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
  selector: 'api',
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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './api.html'
})
export class Api {
  properties = [
    {
      name: 'colors',
      description: 'The list of colors to display in the switcher.',
      type: 'string[]',
      default: 'defaultColors'
    },
    {
      name: 'selectedColor',
      description: 'The currently selected color.',
      type: 'string',
      default: '-'
    },
    {
      name: 'disabled',
      description: 'Whether the color switcher is disabled.',
      type: 'boolean',
      default: 'false'
    },
    { name: 'value', description: 'Selected color model. Supports [(value)] and [formField].', type: 'string | null', default: 'null' },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
  ];

  events = [
    {
      name: 'colorChange',
      description: 'Event emitted when a color is selected.',
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'string | null' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];
}
