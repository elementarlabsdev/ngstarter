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
  eventsListProperties = [
    {
      name: 'groupBy',
      description: 'Semantic grouping mode for the list.',
      type: "'none' | 'day' | 'week'",
      default: "'day'"
    }
  ];

  eventsSectionProperties = [
    {
      name: 'label',
      description: 'Visible section heading, such as Tomorrow, This week, or Next week.',
      type: 'string',
      default: "''"
    }
  ];

  eventDateProperties = [
    {
      name: 'weekday',
      description: 'Short weekday label displayed in the date tile.',
      type: 'string',
      default: "''"
    },
    {
      name: 'day',
      description: 'Day number displayed in the date tile.',
      type: 'string | number',
      default: "''"
    }
  ];

  eventStatusProperties = [
    {
      name: 'tone',
      description: 'Status color intent displayed before the event time.',
      type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral'",
      default: "'default'"
    }
  ];

  slots = [
    {
      name: 'ngs-event-title',
      description: 'Primary event title slot.'
    },
    {
      name: 'ngs-event-status',
      description: 'Optional status displayed to the left of the event time.'
    },
    {
      name: 'ngs-event-time',
      description: 'Time range or secondary schedule line.'
    },
    {
      name: 'ngs-event-description',
      description: 'Optional supporting copy for descriptive event rows.'
    },
    {
      name: 'ngsEventActions',
      description: 'Projected trailing action or attendee area.'
    }
  ];
}
