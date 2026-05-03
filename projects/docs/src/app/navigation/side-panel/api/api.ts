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
  sidePanelProperties = [
    {
      name: 'position',
      description: 'Position of the side panel',
      type: "'left' | 'right'",
      default: "'right'"
    }
  ];

  sidePanelEvents = [
    {
      name: 'opened',
      description: 'Event emitted when the panel is opened'
    },
    {
      name: 'closed',
      description: 'Event emitted when the panel is closed'
    }
  ];

  sidePanelTabProperties = [
    {
      name: 'tabId<sup>*</sup>',
      description: 'Unique identifier for the tab',
      type: 'string',
      default: '–'
    },
    {
      name: 'label<sup>*</sup>',
      description: 'Label displayed for the tab',
      type: 'string',
      default: '–'
    },
    {
      name: 'icon',
      description: 'Icon displayed for the tab',
      type: 'string | TemplateRef<any>',
      default: 'undefined'
    }
  ];
}
