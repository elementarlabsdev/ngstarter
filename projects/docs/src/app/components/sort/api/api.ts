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
  sortProperties = [
    {
      name: 'ngsSortActive',
      description: 'The id of the currently sorted header.',
      type: 'string',
      default: "''"
    },
    {
      name: 'ngsSortStart',
      description: 'The direction used when a header becomes active for the first time.',
      type: "'asc' | 'desc' | ''",
      default: "'asc'"
    },
    {
      name: 'ngsSortDirection',
      description: 'The current sort direction.',
      type: "'asc' | 'desc' | ''",
      default: "''"
    },
    {
      name: 'ngsSortDisableClear',
      description: 'Whether clicking a descending header cycles back to ascending instead of clearing the sort.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'ngsSortDisabled',
      description: 'Whether all headers connected to this sort directive are disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];

  sortEvents = [
    {
      name: 'ngsSortChange',
      description: 'Emits the active header id and direction after sorting changes.'
    }
  ];

  headerProperties = [
    {
      name: 'ngs-sort-header',
      description: 'Unique id for the sortable header. This value is emitted as the active sort id.',
      type: 'string',
      default: "''"
    },
    {
      name: 'sortActionDescription',
      description: 'Accessible label for the sort action.',
      type: 'string',
      default: "''"
    },
    {
      name: 'disabled',
      description: 'Whether this individual sort header is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
