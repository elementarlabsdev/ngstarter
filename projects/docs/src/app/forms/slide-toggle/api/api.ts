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
  groupProperties = [
    {
      name: 'selector',
      description: 'Groups projected slide toggles with consistent vertical spacing.',
      type: 'ngs-slide-toggle-group',
      default: '–'
    },
    {
      name: 'exportAs',
      description: 'Template export name for the group component.',
      type: 'ngsSlideToggleGroup',
      default: '–'
    },
    {
      name: 'content',
      description: 'Accepts projected ngs-slide-toggle children.',
      type: 'ngs-slide-toggle',
      default: '–'
    },
    {
      name: '--ngs-slide-toggle-group-gap',
      description: 'CSS custom property controlling spacing between toggles.',
      type: 'CSS length',
      default: '--spacing(5)'
    }
  ];

  properties = [
    {
      name: 'id',
      description: 'Unique identifier for the slide-toggle',
      type: 'string',
      default: 'ngs-slide-toggle-n'
    },
    {
      name: 'name',
      description: 'Name of the slide-toggle',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'labelPosition',
      description: 'Whether the label should appear after or before the slide-toggle',
      type: "'before' | 'after'",
      default: 'after'
    },
    {
      name: 'aria-label',
      description: 'Used to set the aria-label attribute on the underlying input element',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'aria-labelledby',
      description: 'Used to set the aria-labelledby attribute on the underlying input element',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'aria-describedby',
      description: 'Used to set the aria-describedby attribute on the underlying input element',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'required',
      description: 'Whether the slide-toggle is required',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the slide-toggle is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'tabIndex',
      description: 'The tabIndex of the slide-toggle',
      type: 'number',
      default: '0'
    },
    {
      name: 'hideIcon',
      description: 'Whether to hide the icon inside the thumb',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'color',
      description: 'Palette color of the slide-toggle',
      type: 'string | undefined',
      default: 'undefined'
    },
    {
      name: 'checked',
      description: 'Whether the slide-toggle is checked',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: 'change',
      description: 'Event emitted when the slide-toggle checked state will change'
    },
    {
      name: 'toggleChange',
      description: 'Event emitted when the slide-toggle checked state will change'
    }
  ];
}
