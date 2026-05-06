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
  tabGroupProperties = [
    {
      name: 'selectedIndex',
      description: 'The index of the active tab',
      type: 'number',
      default: '0'
    },
    {
      name: 'headerPosition',
      description: 'Whether the tab header should be positioned above or below the tab content',
      type: "'above' | 'below'",
      default: "'above'"
    },
    {
      name: 'stretchTabs',
      description: 'Whether tabs should be stretched to fill the available width',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'alignTabs',
      description: 'Alignment of the tab labels',
      type: "'start' | 'center' | 'end'",
      default: "'start'"
    },
    {
      name: 'animationDuration',
      description: 'Duration for the tab-transition animation',
      type: 'string',
      default: "'500ms'"
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled',
      type: 'boolean',
      default: 'false'
    }
  ];

  tabGroupEvents = [
    {
      name: 'selectedIndexChange',
      description: 'Output to enable support for two-way binding on selectedIndex'
    },
    {
      name: 'selectedTabChange',
      description: 'Event emitted when the tab selection has changed'
    },
    {
      name: 'focusChange',
      description: 'Event emitted when focus has changed within a tab group'
    }
  ];

  tabProperties = [
    {
      name: 'label',
      description: 'Plain-text label for the tab',
      type: 'string',
      default: "''"
    },
    {
      name: 'disabled',
      description: 'Whether the tab is disabled',
      type: 'boolean',
      default: 'false'
    }
  ];

  tabNavBarProperties = [
    {
      name: 'tabPanel',
      description: 'The nav panel that the nav bar should control',
      type: 'TabNavPanel | null',
      default: 'null'
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled',
      type: 'boolean',
      default: 'false'
    }
  ];

  tabLinkProperties = [
    {
      name: 'disabled',
      description: 'Whether the link is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'rippleDisabled',
      description: 'Whether ripples are disabled on this link',
      type: 'boolean',
      default: 'false'
    }
  ];
}
