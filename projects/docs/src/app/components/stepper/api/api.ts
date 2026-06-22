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
  properties = [
    {
      name: 'headerPosition',
      description: 'Whether the stepper header is displayed at the top or bottom of the page',
      type: "'top' | 'bottom'",
      default: "'top'",
    },
    {
      name: 'labelPosition',
      description: 'Whether the label should appear or not',
      type: "'top' | 'bottom'",
      default: "'top'",
    },
    {
      name: 'stickyHeader',
      description:
        'Whether the horizontal stepper header should stick to the top of its scroll container',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'orientation',
      description: 'The orientation of the stepper',
      type: 'StepperOrientation',
      default: "'horizontal'",
    },
    {
      name: 'linear',
      description: 'Whether the stepper is linear',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'selectedIndex',
      description: 'The index of the selected step',
      type: 'number',
      default: '0',
    },
    {
      name: 'animationDone',
      description: 'Event emitted when the step transition animation is done',
      type: 'EventEmitter<void>',
      default: '-',
    },
    {
      name: 'selectionChange',
      description: 'Event emitted when the selected step has changed',
      type: 'EventEmitter<StepperSelectionEvent>',
      default: '-',
    },
  ];

  stepProperties = [
    {
      name: 'label',
      description: 'The label for the step',
      type: 'string',
      default: '-',
    },
    {
      name: 'errorMessage',
      description: 'The error message for the step',
      type: 'string',
      default: '-',
    },
    {
      name: 'state',
      description: 'The state of the step',
      type: 'StepState',
      default: '-',
    },
    {
      name: 'editable',
      description: 'Whether the step is editable',
      type: 'boolean',
      default: 'true',
    },
    {
      name: 'optional',
      description: 'Whether the step is optional',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'completed',
      description: 'Whether the step is completed',
      type: 'boolean',
      default: 'false',
    },
    {
      name: 'hasError',
      description: 'Whether the step has an error',
      type: 'boolean',
      default: 'false',
    },
  ];
}
