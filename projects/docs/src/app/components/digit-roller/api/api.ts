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
      name: 'value',
      description: 'Required numeric value rendered by the digit roller.',
      type: 'number',
      default: '-'
    },
    {
      name: 'format',
      description: 'Intl.NumberFormat options used for grouping, currency, compact notation, units, and fractions.',
      type: 'Intl.NumberFormatOptions',
      default: '{}'
    },
    {
      name: 'locales',
      description: 'Locale or locale list passed to Intl.NumberFormat.',
      type: 'string | string[] | undefined',
      default: 'undefined'
    },
    {
      name: 'prefix / suffix',
      description: 'Custom text rendered before or after the formatted value.',
      type: 'string',
      default: "''"
    },
    {
      name: 'animated',
      description: 'Enables or disables all digit and layout animations.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'duration',
      description: 'Default animation duration in milliseconds.',
      type: 'number | undefined',
      default: '900'
    },
    {
      name: 'spinEasing / flipEasing',
      description: 'CSS easing preset or custom easing string for digit reels and layout transitions.',
      type: "'default' | 'spring' | 'overshoot' | string",
      default: "'default'"
    },
    {
      name: 'continuous',
      description: 'Spins lower-place unchanged digits when a higher-place digit changes.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'digits',
      description: 'Per-position digit reel limits. Use for clocks or values where a digit max is below 9.',
      type: 'Record<number, { max?: number }>',
      default: '{}'
    },
    {
      name: 'stagger',
      description: 'Delay in milliseconds added between displayed elements.',
      type: 'number',
      default: '0'
    },
    {
      name: 'animationsStart / animationsFinish',
      description: 'Events emitted when a visible animation batch starts or completes.',
      type: 'Output<void>',
      default: '-'
    },
    {
      name: 'ngsDigitRollerGroup',
      description: 'Directive that synchronizes several Digit Roller updates in the same frame.',
      type: 'Directive',
      default: '-'
    }
  ];
}
