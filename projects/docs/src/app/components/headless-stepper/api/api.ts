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
  properties = [
    {
      name: 'linear',
      description: 'Whether users must complete the active step before moving to the next step.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'selectedIndex',
      description: 'The zero-based active step index. Supports two-way binding.',
      type: 'ModelSignal<number>',
      default: '0'
    }
  ];

  signals = [
    {
      name: 'steps',
      description: 'The current collection of projected ngs-headless-step instances.',
      type: 'Signal<readonly HeadlessStep[]>'
    },
    {
      name: 'stepsCount',
      description: 'The number of projected steps.',
      type: 'Signal<number>'
    },
    {
      name: 'selected',
      description: 'The currently selected step instance.',
      type: 'Signal<HeadlessStep | undefined>'
    },
    {
      name: 'canMoveNext',
      description: 'Whether next() can move to the following step.',
      type: 'Signal<boolean>'
    },
    {
      name: 'isFirstStep',
      description: 'Whether the selected step is the first step.',
      type: 'Signal<boolean>'
    },
    {
      name: 'isLastStep',
      description: 'Whether the selected step is the last step.',
      type: 'Signal<boolean>'
    },
    {
      name: 'progressPercent',
      description: 'The current progress percentage based on the selected step.',
      type: 'Signal<number>'
    }
  ];

  methods = [
    {
      name: 'next()',
      description: 'Moves to the next step when canMoveNext() is true.'
    },
    {
      name: 'previous()',
      description: 'Moves to the previous step unless the first step is selected.'
    },
    {
      name: 'reset()',
      description: 'Resets all steps and selects the first step.'
    }
  ];

  stepProperties = [
    {
      name: 'stepControl',
      description: 'An optional Angular form control or group used to determine step completion.',
      type: 'AbstractControl | undefined',
      default: 'undefined'
    },
    {
      name: 'optional',
      description: 'Whether the step can be skipped in a linear flow.',
      type: 'boolean',
      default: 'false'
    }
  ];

  stepSignals = [
    {
      name: 'completed',
      description: 'Whether the step has no control or its control is valid.',
      type: 'Signal<boolean>'
    },
    {
      name: 'interacted',
      description: 'Whether the user has visited this step.',
      type: 'WritableSignal<boolean>'
    },
    {
      name: 'isActive',
      description: 'Whether this step is currently selected.',
      type: 'WritableSignal<boolean>'
    }
  ];

  stepMethods = [
    {
      name: 'isValid()',
      description: 'Returns the current validity of the step control.'
    },
    {
      name: 'reset()',
      description: 'Clears the step interacted state.'
    }
  ];
}
