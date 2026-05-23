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
  Table,
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
    Row,
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  readonly properties = [
    {
      name: 'startAt',
      description: 'The date whose month should be shown initially.',
      type: 'Date | string | number | null',
      default: 'null',
    },
    {
      name: 'selected',
      description: 'The selected date. The calendar normalizes values to the local start of day.',
      type: 'Date | string | number | null',
      default: 'null',
    },
    {
      name: 'minDate',
      description: 'The earliest selectable date.',
      type: 'Date | string | number | null',
      default: 'null',
    },
    {
      name: 'maxDate',
      description: 'The latest selectable date.',
      type: 'Date | string | number | null',
      default: 'null',
    },
    {
      name: 'events',
      description: 'Event records rendered as day markers or compact event titles.',
      type: 'readonly CalendarEvent[]',
      default: '[]',
    },
    {
      name: 'locale',
      description:
        'Optional locale passed to Intl.DateTimeFormat for month, weekday, and aria labels.',
      type: 'string | undefined',
      default: 'undefined',
    },
    {
      name: 'firstDayOfWeek',
      description: 'The first day of the week, where 0 is Sunday and 1 is Monday.',
      type: 'number',
      default: '0',
    },
    {
      name: 'showAdjacentDays',
      description: 'Whether to show leading and trailing days from neighboring months.',
      type: 'boolean',
      default: 'true',
    },
    {
      name: 'showTodayButton',
      description: 'Whether to show the Today button in the calendar header.',
      type: 'boolean',
      default: 'true',
    },
    {
      name: 'showEventTitles',
      description: 'Whether to show up to two event titles inside each day cell.',
      type: 'boolean',
      default: 'false',
    },
  ];

  readonly outputs = [
    {
      name: 'selectedChange',
      description: 'Emits the selected Date when the user picks a selectable day.',
      type: 'Date',
    },
    {
      name: 'monthChange',
      description: 'Emits the first day of the newly active month after calendar navigation.',
      type: 'Date',
    },
    {
      name: 'eventSelected',
      description: 'Emits the clicked CalendarEvent when event titles are visible.',
      type: 'CalendarEvent',
    },
  ];

  readonly types = [
    {
      name: 'CalendarDateInput',
      description:
        'Accepted date input values for selected, startAt, minDate, maxDate, and event dates.',
      type: 'Date | string | number',
    },
    {
      name: 'CalendarEvent',
      description: 'A lightweight event shown on a calendar day.',
      type: '{ id?: string | number; date: CalendarDateInput; title?: string; color?: CalendarEventColor }',
    },
    {
      name: 'CalendarEventColor',
      description: 'Named marker colors supported by the calendar.',
      type: "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'green' | 'rose' | 'blue'",
    },
  ];
}
