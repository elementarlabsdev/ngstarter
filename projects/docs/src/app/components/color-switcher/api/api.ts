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
  templateUrl: './api.html'
})
export class Api {
  properties = [
    {
      name: '<code>@Input()</code> colors: string[]',
      description: 'The list of colors to display in the switcher.',
      type: 'string[]',
      default: 'defaultColors'
    },
    {
      name: '<code>@Input()</code> selectedColor: string',
      description: 'The currently selected color.',
      type: 'string',
      default: '-'
    },
    {
      name: '<code>@Input()</code> disabled: boolean',
      description: 'Whether the color switcher is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: '<code>@Output()</code> colorChange: EventEmitter&lt;string&gt;',
      description: 'Event emitted when a color is selected.',
    }
  ];
}
