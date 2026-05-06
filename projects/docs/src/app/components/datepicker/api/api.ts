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
  datepickerProperties = [
    {
      name: 'startAt',
      description: 'The date to open the calendar to initially.',
      type: 'D | null',
      default: 'null'
    },
    {
      name: 'calendarHeaderComponent',
      description: 'Custom component to be used as the header for the calendar.',
      type: 'Type<any> | null',
      default: 'null'
    },
    {
      name: 'quickPresets',
      description: 'The presets to show in the datepicker.',
      type: 'DatepickerPreset<D>[]',
      default: '[]'
    },
    {
      name: 'showQuickPresets',
      description: 'Whether to show the quick presets.',
      type: 'boolean',
      default: 'false'
    }
  ];

  dateRangePickerProperties = [
    {
      name: 'startAt',
      description: 'The date to open the calendar to initially.',
      type: 'D | null',
      default: 'null'
    },
    {
      name: 'calendarHeaderComponent',
      description: 'Custom component to be used as the header for the calendar.',
      type: 'Type<any> | null',
      default: 'null'
    },
    {
      name: 'quickPresets',
      description: 'The presets to show in the datepicker.',
      type: 'DatepickerPreset<D>[] | null',
      default: 'null'
    },
    {
      name: 'showQuickPresets',
      description: 'Whether to show the quick presets.',
      type: 'boolean',
      default: 'false'
    }
  ];

  datepickerInputProperties = [
    {
      name: 'ngsDatepicker',
      description: 'The datepicker that this input is associated with.',
      type: 'Datepicker<D>',
      default: '-'
    }
  ];

  datepickerToggleProperties = [
    {
      name: 'for',
      description: 'The datepicker that this toggle is associated with.',
      type: 'Datepicker<D> | DateRangePicker<D>',
      default: '-'
    }
  ];
}
