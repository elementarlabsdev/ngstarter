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
      name: 'ngs-timeline',
      description: 'Main container for timeline headers and items.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-item',
      description: 'One event or entry in the timeline.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-header',
      description: 'Group heading for timeline items, often a date or period.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-title',
      description: 'Primary title for the timeline event.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-subtitle',
      description: 'Secondary title or supporting line for the event.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-description',
      description: 'Short event description.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-timestamp',
      description: 'Time or date label for the event.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngs-timeline-attributes',
      description: 'Extra metadata, actor details, links, badges, or attributes for the event.',
      type: 'component',
      default: '–'
    },
    {
      name: 'ngsTimelineItemIndicator',
      description: 'Template directive for a custom event indicator.',
      type: 'directive',
      default: '–'
    }
  ];
  events = [];
}
