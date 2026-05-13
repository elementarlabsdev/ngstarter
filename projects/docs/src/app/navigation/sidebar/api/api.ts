import { Component } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
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
    CodeHighlighter,
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
})
export class Api {
  dynamicCompactExample = `<ngs-sidenav [opened]="true" mode="side" [collapsed]="compact()">
  <ngs-sidebar>
    <ngs-sidebar-header>
      <span *ngsSidenavCollapsed>NG</span>
      <span *ngsSidenavExpanded>NgStarter</span>
    </ngs-sidebar-header>
  </ngs-sidebar>
</ngs-sidenav>`;

  onlyCompactExample = `<ngs-sidebar onlyCompact>
  <ngs-sidebar-header>NG</ngs-sidebar-header>
  <ngs-sidebar-body>
    <!-- icon-only navigation -->
  </ngs-sidebar-body>
</ngs-sidebar>`;

  blockExample = `<ngs-sidebar-header block>
  <div class="grid gap-1">
    <strong>Workspace</strong>
    <span>Production</span>
  </div>
</ngs-sidebar-header>`;

  properties = [
    {
      name: 'onlyCompact',
      description: 'Forces the compact layout and prevents the sidebar from expanding on hover.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'block',
      description: 'Available on ngs-sidebar-header and ngs-sidebar-footer. Switches the region from the default flex items-center layout to block layout.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'activeKey',
      description: 'The key of the currently active navigation item',
      type: 'any',
      default: 'undefined'
    },
    {
      name: 'dataSource',
      description: 'Data source for the navigation items',
      type: 'any[]',
      default: 'undefined'
    },
    {
      name: 'itemTypeProperty',
      description: 'Property name to determine item type',
      type: 'string',
      default: "'type'"
    },
    {
      name: 'autoScrollToActiveItem',
      description: 'Whether to automatically scroll to the active item on render',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'itemClicked',
      description: 'Emitted when a navigation item is clicked'
    }
  ];
}
