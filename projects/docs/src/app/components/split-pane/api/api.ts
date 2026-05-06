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
  splitProperties = [
    {
      name: 'direction',
      description: 'The split direction',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'"
    },
    {
      name: 'unit',
      description: 'The unit you want to specify area sizes',
      type: "'percent' | 'pixel'",
      default: "'percent'"
    },
    {
      name: 'gutterSize',
      description: "Gutters's size (dragging elements) in pixels",
      type: 'number',
      default: '5'
    },
    {
      name: 'gutterStep',
      description: 'Gutter step while moving in pixels',
      type: 'number',
      default: '1'
    },
    {
      name: 'restrictMove',
      description: 'Limit gutter move to adjacent areas only',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'useTransition',
      description: 'Add transition when toggling visibility or size changes',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Disable the dragging feature',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'dir',
      description: 'Directionality of the areas',
      type: "'ltr' | 'rtl'",
      default: "'ltr'"
    },
    {
      name: 'gutterDblClickDuration',
      description: 'Milliseconds to detect a double click on a gutter',
      type: 'number',
      default: '0'
    }
  ];

  splitEvents = [
    {
      name: 'dragStart',
      description: 'Event emitted when drag starts'
    },
    {
      name: 'dragEnd',
      description: 'Event emitted when drag ends'
    },
    {
      name: 'gutterClick',
      description: 'Event emitted when user clicks on a gutter'
    },
    {
      name: 'gutterDblClick',
      description: 'Event emitted when user double clicks on a gutter'
    },
    {
      name: 'transitionEnd',
      description: 'Event emitted when transition ends'
    }
  ];

  paneProperties = [
    {
      name: 'order',
      description: 'Order of the area',
      type: 'number',
      default: 'null'
    },
    {
      name: 'size',
      description: 'Size of the area in selected unit (percent/pixel)',
      type: 'number',
      default: 'null'
    },
    {
      name: 'minSize',
      description: 'Minimum pixel or percent size',
      type: 'number',
      default: 'null'
    },
    {
      name: 'maxSize',
      description: 'Maximum pixel or percent size',
      type: 'number',
      default: 'null'
    },
    {
      name: 'lockSize',
      description: 'Lock area size, same as minSize=maxSize=size',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'visible',
      description: 'Hide area visually but still present in the DOM',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'withHandle',
      description: 'Show handle (three dots) on the gutter adjacent to this pane',
      type: 'boolean',
      default: 'false'
    }
  ];
}
