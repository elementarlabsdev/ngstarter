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
  serviceMethods = [
    {
      name: 'open(message: string, action?: string, config?: SnackBarConfig)',
      description: 'Opens a snack bar with a message and an optional action.',
      type: 'SnackBarRef<SimpleSnackBar>',
    },
    {
      name: 'openFromComponent(component: Type<T>, config?: SnackBarConfig)',
      description: 'Opens a snack bar with a custom component.',
      type: 'SnackBarRef<T>',
    },
    {
      name: 'openFromTemplate(template: TemplateRef<any>, config?: SnackBarConfig)',
      description: 'Opens a snack bar with a custom template.',
      type: 'SnackBarRef<any>',
    },
    {
      name: 'dismiss()',
      description: 'Dismisses the currently-visible snack bar.',
      type: 'void',
    }
  ];

  configProperties = [
    {
      name: 'politeness',
      description: 'The politeness level for the MatAriaLiveAnnouncer announcement.',
      type: 'AriaLivePoliteness',
      default: 'assertive'
    },
    {
      name: 'announcementMessage',
      description: 'Message to be announced by the LiveAnnouncer.',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'duration',
      description: 'The duration in milliseconds to wait before automatically closing the snack bar.',
      type: 'number',
      default: '0'
    },
    {
      name: 'panelClass',
      description: 'Extra CSS classes to be added to the snack bar container.',
      type: 'string | string[]',
      default: 'undefined'
    },
    {
      name: 'direction',
      description: 'Text layout direction for the snack bar.',
      type: 'Direction',
      default: 'undefined'
    },
    {
      name: 'horizontalPosition',
      description: 'The horizontal position to place the snack bar.',
      type: 'SnackBarHorizontalPosition',
      default: 'center'
    },
    {
      name: 'verticalPosition',
      description: 'The vertical position to place the snack bar.',
      type: 'SnackBarVerticalPosition',
      default: 'bottom'
    },
    {
      name: 'data',
      description: 'Data being injected into the child component.',
      type: 'any',
      default: 'null'
    }
  ];
}
