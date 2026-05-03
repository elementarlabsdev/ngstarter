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
  selector: 'nav-api',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Api {
  properties = [
    {
      name: 'activeKey',
      description: 'The key of the currently active navigation item.',
      type: 'any',
      default: '–'
    },
    {
      name: 'dataSource',
      description: 'Array of data to build the navigation dynamically.',
      type: 'any[]',
      default: '–'
    },
    {
      name: 'itemTypeProperty',
      description: 'The property name in the data source that determines the item type.',
      type: 'string',
      default: 'type'
    },
    {
      name: 'appearance',
      description: 'The visual appearance style of the navigation.',
      type: 'any',
      default: '–'
    },
    {
      name: 'activateByRoute',
      description: 'Whether to automatically activate items based on the current router URL.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'autoScrollToActiveItem',
      description: 'Whether to automatically scroll the active item into view.',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: 'itemClicked',
      description: 'Event emitted when a navigation item is clicked.'
    }
  ];

  itemProperties = [
    {
      name: 'key',
      description: 'Unique identifier for the item.',
      type: 'any',
      default: 'ngs-navigation-item-n'
    },
    {
      name: 'forceActive',
      description: 'Whether to force the item into an active state.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'badgeTextOnly',
      description: 'Whether to display only the badge text without additional styling.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
