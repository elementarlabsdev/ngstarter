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
  groupProperties = [
    {
      name: 'appearance',
      description: 'The appearance of the button toggle group.',
      type: 'ButtonToggleAppearance',
      default: 'standard'
    },
    {
      name: 'disabled',
      description: 'Whether the button toggle group is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'multiple',
      description: 'Whether multiple button toggles can be selected.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideSelectionIndicator',
      description: 'Whether to hide the selection indicator.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'vertical',
      description: 'Whether the button toggle group is vertical.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'onlyIcon',
      description: 'Whether the button toggle group should use icon-only sizing.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'value',
      description: 'Selection model. Supports [(value)] and [formField].',
      type: 'any',
      default: 'undefined'
    },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
  ];

  groupEvents = [
    {
      name: 'change',
      description: 'Event emitted when the value of the button toggle group changes.'
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'any' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];

  toggleProperties = [
    {
      name: 'id',
      description: 'The unique ID of the button toggle.',
      type: 'string',
      default: 'ngs-button-toggle-n'
    },
    {
      name: 'value',
      description: 'The value of the button toggle.',
      type: 'any',
      default: 'undefined'
    },
    {
      name: 'name',
      description: 'The name of the button toggle.',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'checked',
      description: 'Whether the button toggle is checked.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the button toggle is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'onlyIcon',
      description: 'Whether the button toggle should use icon-only sizing.',
      type: 'boolean',
      default: 'false'
    }
  ];

  toggleEvents = [
    {
      name: 'change',
      description: 'Event emitted when the checked state of the button toggle changes.'
    }
  ];
}
