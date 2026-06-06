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
      name: 'dataSource',
      description: 'The data source that contains the data to be rendered.',
      type: 'DataSource<T> | Observable<T[]> | T[]',
      default: '–'
    },
    {
      name: 'treeControl',
      description: 'The tree control that handles the tree\'s expansion state.',
      type: 'TreeControl<T, K>',
      default: '–'
    },
    {
      name: 'checkable',
      description: 'Whether the tree should render hierarchical checkboxes before each node.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'selectable',
      description: 'Whether tree nodes can be selected and styled with the same active state as list items.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'draggable',
      description: 'Whether tree nodes can be dragged before, after, or into another node.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'childrenKey',
      description: 'Property name used when a dragged node is dropped into a leaf node and the tree needs to create a children array.',
      type: 'string',
      default: 'children'
    },
    {
      name: 'filterValue',
      description: 'Current text value used to filter array-backed tree data without mutating the original dataSource.',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'filterPredicate',
      description: 'Function that decides whether a node matches the current filter value.',
      type: '(node: T, filterValue: string) => boolean',
      default: 'name / label / title / value text match'
    },
    {
      name: 'filterMode',
      description: 'Controls whether matching children keep their ancestors or matching parents include their full descendants.',
      type: '\'includeAncestors\' | \'includeDescendants\'',
      default: '\'includeAncestors\''
    },
    {
      name: 'trackBy',
      description: 'Tracking function that will be used to check the differences in data changes.',
      type: 'TrackByFunction<T>',
      default: '–'
    }
  ];

  nodeProperties = [
    {
      name: 'value',
      description: 'Value emitted and tracked when the node is used inside a checkable or selectable tree.',
      type: 'unknown',
      default: 'trackBy / expansionKey / node'
    },
    {
      name: 'disabled',
      description: 'Whether the tree node is disabled. Disabled nodes cannot be selected or checked.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'tabIndex',
      description: 'Tabindex of the tree node.',
      type: 'number',
      default: '0'
    }
  ];

  events = [
    {
      name: 'checkedChange',
      description: 'Event emitted by ngs-tree when the checked node values change.'
    },
    {
      name: 'selectedChange',
      description: 'Event emitted by ngs-tree when the selected node value changes.'
    },
    {
      name: 'nodeDrop',
      description: 'Event emitted by ngs-tree after a node is dropped before, after, or into another node.'
    },
    {
      name: 'activation',
      description: 'Event emitted when the node is activated.'
    },
    {
      name: 'expandedChange',
      description: 'Event emitted when the node expansion state changes.'
    }
  ];
}
