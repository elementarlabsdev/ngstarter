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
import { Divider } from '@ngstarter-ui/components/divider';

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
    Divider
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  serviceMethods = [
    {
      name: 'open(componentOrTemplateRef, config?)',
      description: 'Opens a bottom sheet containing the given component or template.',
      type: 'BottomSheetRef<T, R>'
    },
    {
      name: 'dismiss(result?)',
      description: 'Dismisses the currently-visible bottom sheet.',
      type: 'void'
    }
  ];

  configProperties = [
    {
      name: 'viewContainerRef',
      description: 'The view container to place the overlay for the bottom sheet into.',
      type: 'ViewContainerRef',
      default: '–'
    },
    {
      name: 'panelClass',
      description: 'Extra CSS classes to be added to the bottom sheet container.',
      type: 'string | string[]',
      default: '–'
    },
    {
      name: 'data',
      description: 'Data being injected into the child component.',
      type: 'any',
      default: 'null'
    },
    {
      name: 'hasBackdrop',
      description: 'Whether the bottom sheet has a backdrop.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'disableClose',
      description: 'Whether the user can use escape or clicking outside to close the bottom sheet.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'autoFocus',
      description: 'Where the bottom sheet should focus on open.',
      type: 'string | boolean',
      default: 'first-tabbable'
    },
    {
      name: 'height',
      description: 'Height for the bottom sheet.',
      type: 'string',
      default: "''"
    }
  ];
}
