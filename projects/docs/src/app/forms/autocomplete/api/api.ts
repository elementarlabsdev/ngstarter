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
  properties = [
    {
      name: 'aria-label',
      description: 'The aria-label of the autocomplete',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'aria-labelledby',
      description: 'The aria-labelledby of the autocomplete',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'autoActiveFirstOption',
      description: 'Whether the first option should be highlighted when the autocomplete panel is opened.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'autoSelectActiveOption',
      description: 'Whether the active option should be selected when the autocomplete panel is closed.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'class',
      description: 'Classes to be passed to the autocomplete panel.',
      type: 'string | string[]',
      default: 'undefined'
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'displayWith',
      description: 'Function used to map an option\'s control value to its display value in the trigger.',
      type: '(value: any) => string | null',
      default: '() => null'
    },
    {
      name: 'hideSingleSelectionIndicator',
      description: 'Whether the selection indicator should be hidden for single-selection.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'panelWidth',
      description: 'Specify the width of the autocomplete panel. Can be any CSS sizing value, otherwise it will match the width of the trigger.',
      type: 'string | number',
      default: 'undefined'
    },
    {
      name: 'requireSelection',
      description: 'Whether the user is required to make a selection from the options.',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'closed',
      description: 'Event that is emitted when the autocomplete panel is closed.'
    },
    {
      name: 'opened',
      description: 'Event that is emitted when the autocomplete panel is opened.'
    },
    {
      name: 'optionActivated',
      description: 'Event that is emitted whenever an option from the list is activated (focused).'
    },
    {
      name: 'optionSelected',
      description: 'Event that is emitted whenever an option from the list is selected.'
    }
  ];
}
