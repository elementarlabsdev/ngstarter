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
      name: 'actionText',
      description: 'Indicates the type of event or action',
      type: 'string',
      default: 'Action Required'
    },
    {
      name: 'iconName',
      description: 'Custom icon',
      type: 'string',
      default: 'error'
    },
    {
      name: 'description<sup>*</sup>',
      description: 'Full description of the event or action to be performed',
      type: 'string',
      default: '–'
    },
    {
      name: 'buttonText<sup>*</sup>',
      description: 'Text on the button',
      type: 'string',
      default: '–'
    }
  ];
  events = [
    {
      name: 'buttonClicked',
      description: 'Executed when a button clicked'
    }
  ];
}
